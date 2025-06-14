/*
Column 1 - Flight: All frames are 90ms, bat flies around in a mostly meandering pattern, when facing the player and within close enough range, changes into the punch animation. If line of sight is not made and the bat has been flying for long enough, it will latch onto a ledge upside down and go to sleep for a time.

Column 2 - Punch: Frame 1 and 2 are 40ms, Frames 3-5 are 75ms and the bat will pull back slightly, Frames 6-8 are 50ms and repeat multiple times (roughly 3-4) and the bat will punch at the player's X and Y coordinates, drifting past whether it misses or connects before going into Frame 9 at 40ms and returning to flight.

Column 3 - Sleep: Frame 1 and 2 are 75ms, Frame 3 is 350ms, Frame 4 and 5 are 75ms, and Frame 6 is 350ms. Bat remains asleep until attacked or it wakes up randomly on it's own after resting for at least 6 or 7 seconds.

Column 4 - Wake-up: Frame 1 is 150ms, Frames 2-4 are 75ms, Frames 5-9 are 55ms and during this period the player will be harmed if they try to jump on or approach the bat, Frame 10 is 75ms, after this the bat will return to it's random flight pattern.

NOTES: the bat can be jumped on unless it is in the spinning animation during wake up, when it goes to punch it can still be jumped on like normal around it's head area, but it's fist will always damage the player. The hitbox for this creature would roughly be the head region and it's hands potentially, wings I don't see being part of it's hitbox for being jumped on or harming the player.
*/

import Channel from '../Channel';
import { cAI, cHurt } from '../colours';
import Flat from '../component/Flat';
import { dLeft, dRight, Facing } from '../dirs';
import {
	Degrees,
	Milliseconds,
	Pixels,
	Radians,
	ResourceName,
	ScaledTime,
} from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zFlying } from '../layers';
import { gTimeScale, gWalkScale } from '../nums';
import { draw3D } from '../rendering';
import controller, {
	ePunchDone,
	ePunchForward,
	ePunchPullback,
	eWakeDone,
} from '../spr/bat';
import {
	angleDistance,
	collides,
	drawWedge,
	fittest,
	lerp,
	min,
	randomAngle,
	randomItem,
	randomRange,
	rnd,
	scaleWidth,
	wrapAngle,
	π,
} from '../tools';
import AbstractEnemy from './AbstractEnemy';

const gAttackFar = 160,
	gAttackNear = 30,
	gNormalSpeed = 0.2,
	gFastSpeed = 0.4,
	gLungeSpeed = 0.4,
	gPullbackSpeed = 0.12,
	gRoostChance = 0.001,
	gSleepThreshold: Milliseconds = 1000,
	gSlowSpeed = 0.08,
	gSubstateChange: Milliseconds = 2000,
	gSubstateChance = 0.2,
	gVerticalAcceleration = 0.0005,
	gVerticalChange: Milliseconds = 3000,
	gVerticalChance = 0.1,
	gVerticalNear = 50,
	gVerticalSlowdown = 0.75,
	gWakeChance = 0.01,
	gWakeHitboxExtend = 40,
	gZeroAngleThreshold = 0.01,
	gZeroRadiusThreshold = 2;

const sFlying = 'flying',
	sRoosting = 'roosting',
	sSleeping = 'sleeping',
	sPunching = 'punching',
	sWaking = 'waking';
type BatState = 'flying' | 'roosting' | 'sleeping' | 'punching' | 'waking';

const ssNormal = 'Normal',
	ssSlow = 'Slow',
	ssFast = 'Fast',
	ssTurn = 'Turn';
type BatSubstate = 'Normal' | 'Slow' | 'Fast' | 'Turn';

interface BatInit {
	a?: Degrees;
	img?: ResourceName;
	r?: Pixels;
}

export default class Bat extends AbstractEnemy {
	channel: Channel;
	dir: Facing;
	maxradius: Pixels;
	minradius: Pixels;
	roost: Flat | null;
	roostangle?: Radians;
	roostradius?: Pixels;
	sleepTimer: Milliseconds;
	sprite: controller;
	state: BatState;
	substate: BatSubstate;
	substateTimer: Milliseconds;
	targetradius: Pixels;
	tscale: ScaledTime;
	verticalTimer: Milliseconds;

	/**
	 * Create a new Bat
	 * @constructor
	 * @param {Game} game game instance
	 * @param {BatInit} options options
	 */
	constructor(
		game: Game,
		{ a = 0, r = 250, img = 'enemy.bat' }: BatInit = {}
	) {
		super({
			channel: new Channel(game, 'Bat'),
			layer: zFlying,
			game,
			name: 'Bat',
			width: 50,
			height: 50,
			a,
			r,
			rtop: r,
			dir: dLeft,
			va: 0,
			vr: 0,
			sleepTimer: 0,
			state: sFlying,
			substate: ssNormal,
			substateTimer: gSubstateChange,
			verticalTimer: gVerticalChange,
			sprite: new controller(game.resources[img]),
			alive: true,
			health: 2,
			damage: 1,
		});

		this.sprite.map = {
			[ePunchDone]: this.onpunchdone.bind(this),
			[ePunchForward]: this.onpunchforward.bind(this),
			[ePunchPullback]: this.onpunchpullback.bind(this),
			[eWakeDone]: this.onwakedone.bind(this),
		};
	}

	update(time: Milliseconds): void {
		if (!(time = this.dostun(time))) return;

		if (!this.minradius) {
			const lowest = fittest(this.game.floors, fl => -fl.r);
			this.minradius = lowest ? lowest.r : 100;
		}

		if (!this.maxradius) {
			const highest = fittest(this.game.floors, fl => fl.r);
			this.maxradius = (highest ? highest.r : 200) + this.height;
		}

		if (!this.targetradius) this.targetradius = this.r;

		this[this.state + 'Update'](time);

		if (this.del) {
			const { va, vr, r, a, z, sprite, state, substate } = this;
			this.debug({
				state: `${state},${substate}`,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${z.toFixed(2)}`,
				anim: `${sprite.a}+${sprite.at.toFixed(0)}ms, ${
					sprite.flip ? 'flip' : 'normal'
				}`,
			});
		}
	}

	physics(time: Milliseconds, va: number, vr: number): void {
		const tscale: ScaledTime = time / gTimeScale;

		let { a, r } = this;

		a += (va / r) * tscale * gWalkScale;
		r += vr * tscale;

		if (r < 0) {
			r *= -1;
			a += π;
		}

		Object.assign(this, { a: wrapAngle(a), r, va, vr, tscale });
	}

	turn(): void {
		if (this.dir === dLeft) {
			this.dir = dRight;
			this.sprite.right();
		} else {
			this.dir = dLeft;
			this.sprite.left();
		}

		this.sprite.turn();
	}

	[sFlying + 'Update'](time: Milliseconds): void {
		this.sleepTimer += time;

		if (this.canAttack()) {
			this.channel.play('enemy.bat.punch');
			this.state = sPunching;
			return this[sPunching + 'Update'](time);
		}

		if (this.canRoost()) {
			this.state = sRoosting;
			return this[sRoosting + 'Update'](time);
		}

		const va = this[sFlying + this.substate + 'Update'](time);
		const vr = this.flyingVerticalUpdate(time);
		this.physics(time, va, vr);
		this.sprite.move(time);
	}

	[sFlying + ssNormal + 'Update'](time: Milliseconds): number {
		let { dir, va } = this;

		if (dir === dRight) va = lerp(va, gNormalSpeed);
		else va = lerp(va, -gNormalSpeed);

		this.checkChangeSubstate(time);
		return va;
	}

	[sFlying + ssTurn + 'Update'](time: Milliseconds): number {
		let { va } = this;

		va = lerp(va, 0);
		if (Math.abs(va) < gZeroAngleThreshold) {
			this.turn();

			while (this.substate === ssTurn) this.changeSubstate();
		}

		this.checkChangeSubstate(time);
		return va;
	}

	[sFlying + ssFast + 'Update'](time: Milliseconds): number {
		let { dir, va } = this;

		if (dir === dRight) va = lerp(va, gFastSpeed);
		else va = lerp(va, -gFastSpeed);

		this.checkChangeSubstate(time);
		return va;
	}

	[sFlying + ssSlow + 'Update'](time: Milliseconds): number {
		let { dir, va } = this;

		if (dir === dRight) va = lerp(va, gSlowSpeed);
		else va = lerp(va, -gSlowSpeed);

		this.checkChangeSubstate(time);
		return va;
	}

	flyingVerticalUpdate(time: Milliseconds): number {
		let { r, minradius, maxradius, targetradius, vr } = this;

		const rdiff = targetradius - r;
		vr = gVerticalAcceleration * time * rdiff;

		if (Math.abs(rdiff) < gVerticalNear) vr *= gVerticalSlowdown;

		if (this.verticalTimer <= 0) {
			if (rnd() * time < gVerticalChance) {
				this.targetradius = randomRange(minradius, maxradius);
				this.verticalTimer = gVerticalChange;
			}
		} else {
			this.verticalTimer -= time;
		}

		return vr;
	}

	checkChangeSubstate(time: Milliseconds): void {
		if (this.substateTimer <= 0) {
			if (rnd() * time < gSubstateChance) this.changeSubstate();
		} else {
			this.substateTimer -= time;
		}
	}

	changeSubstate(): void {
		this.substate = randomItem([ssNormal, ssTurn, ssFast, ssSlow]);
		this.substateTimer = gSubstateChange;
	}

	canAttack(): boolean {
		const { a } = this.getHitbox();
		return (
			!!a &&
			this.game.player.alive &&
			collides(a, this.game.player.getHitbox())
		);
	}

	[sPunching + 'Update'](time: Milliseconds): void {
		this.physics(time, this.va, this.vr);
		this.sprite.punch(time);
	}

	onpunchpullback(): void {
		this.va = this.dir === dLeft ? gPullbackSpeed : -gPullbackSpeed;
	}

	onpunchforward(): void {
		this.va = this.dir === dLeft ? -gLungeSpeed : gLungeSpeed;
	}

	onpunchdone(): void {
		this.state = sFlying;
	}

	canRoost(): boolean {
		if (this.sleepTimer <= gSleepThreshold || rnd() >= gRoostChance)
			return false;
		this.roost = this.getNearestCeiling();
		this.roostangle = undefined;
		return !!this.roost;
	}

	canWake(): boolean {
		return this.sleepTimer >= gSleepThreshold && rnd() < gWakeChance;
	}

	getNearestCeiling(): Flat | null {
		return fittest(this.game.ceilings, c => {
			const dl = angleDistance(this.a, c.left);
			const dr = angleDistance(this.a, c.right);
			return -min(dl, dr);
		});
	}

	[sRoosting + 'Update'](time: Milliseconds): void {
		if (!this.roostangle) {
			this.roostangle = randomAngle(this.roost!.left, this.roost!.right);
			this.roostradius = this.roost!.r - this.height;

			const nd = this.roostangle > this.a ? dRight : dLeft;
			if (nd !== this.dir) this.turn();
		}

		if (this.canAttack()) {
			this.channel.play('enemy.bat.punch');
			this.state = sPunching;
			return this[sPunching + 'Update'](time);
		}

		const va = this.roostingAngleUpdate();
		const vr = this.roostingRadiusUpdate(time);
		this.physics(time, va, vr);

		if (va === 0 && vr === 0) {
			this.state = sSleeping;
			this.sleepTimer = 0;
		}

		this.sprite.move(time);
	}

	roostingAngleUpdate(): number {
		let { dir, roostangle, va } = this;

		const adiff = angleDistance(this.a, roostangle!);
		if (adiff < gZeroAngleThreshold) {
			this.a = roostangle!;
			return 0;
		}

		if (dir === dRight) va = lerp(va, gSlowSpeed);
		else va = lerp(va, -gSlowSpeed);

		return va;
	}

	roostingRadiusUpdate(time: Milliseconds): number {
		let { r, roostradius, vr } = this;

		const rdiff: Pixels = roostradius! - r;
		if (rdiff < gZeroRadiusThreshold) {
			this.r = roostradius!;
			return 0;
		}

		vr = gVerticalAcceleration * time * rdiff;
		if (Math.abs(rdiff) < gVerticalNear) vr *= gVerticalSlowdown;

		return vr;
	}

	[sSleeping + 'Update'](time: Milliseconds): void {
		this.sleepTimer += time;

		if (this.canAttack() || this.canWake()) {
			this.roost = null;
			this.state = sWaking;
			this.sleepTimer = 0;
			return this.sprite.wake(time);
		}

		this.sprite.sleep(time);
	}

	[sWaking + 'Update'](time: Milliseconds): void {
		this.sprite.wake(time);
	}

	onwakedone(): void {
		this.state = sFlying;
	}

	draw(c: CanvasRenderingContext2D): void {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top, a } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);

		if (a) drawWedge(c, cAI, cx, cy, a.bot, a.top);
	}

	getHitbox() {
		const { r, a, z, va, vr, width, height, tscale } = this;
		const baw = scaleWidth(width, r, z),
			taw = scaleWidth(width, r + height, z);
		let amod: Radians,
			vbr = 0,
			vtr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr > 0) vtr = vr;
		else if (vr < 0) vbr = vr;

		return {
			bot: {
				r: r + vbr,
				a: amod,
				z,
				width: baw,
			},
			top: {
				r: r + height * z + vtr,
				a: amod,
				z,
				width: taw,
			},
			a: this.getAttackHitbox(),
		};
	}

	getAttackHitbox(): Hitbox | null {
		if (this.state === sFlying || this.state === sRoosting)
			return this.getPunchHitbox();
		if (this.state === sSleeping) return this.getSleepingHitbox();
		return null;
	}

	getPunchHitbox(): Hitbox {
		const { r, a, z, va, vr, height, tscale, dir } = this;
		const attackWidth = scaleWidth((gAttackFar - gAttackNear) / 2, r, z);
		const left = dir === dLeft;
		const aoffset = left ? -attackWidth : attackWidth;

		let amod: Radians,
			vbr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr < 0) vbr = vr;

		return {
			bot: {
				r: r + vbr,
				a: amod + aoffset,
				z,
				width: attackWidth,
			},
			top: {
				r: r + height * z + vbr,
				a: amod + aoffset,
				z,
				width: attackWidth,
			},
		};
	}

	getSleepingHitbox(): Hitbox {
		const { r, a, z, width, height } = this;
		const br = r - gWakeHitboxExtend;
		const tr = r + height * z + gWakeHitboxExtend;
		const width2 = width + gWakeHitboxExtend * 2;
		const baw = scaleWidth(width2, br, z),
			taw = scaleWidth(width2, tr, z);

		return {
			bot: {
				r: br,
				a,
				z,
				width: baw,
			},
			top: {
				r: tr,
				a,
				z,
				width: taw,
			},
		};
	}
}
