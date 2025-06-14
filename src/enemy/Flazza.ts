/*
MOVEMENT: 75 ms for the flying animation

TURN: 75 ms, top cell is turning right to left, bottom is left to right.

BODY SLAM/FLOP: Frame 1 & 2 are 75 ms, Frame 3 hangs until landing on the ground, Frame 4 & 5 are 75 ms, Frame 6 is 400 ms, Frame 7 & 8 are 75 MS and frame 9 is 400 MS

NOTES: After the body slam recovery, the flying animation will begin playing again, I imagine the Flazza can't belly flop again until reaching the typical height it flies above platforms, or maybe after a set time. This enemy will definitely take some playing with to get right.
*/

import { cAI, cHurt } from '../colours';
import Flat from '../component/Flat';
import { dLeft, Facing } from '../dirs';
import { Pixels, ResourceName, ScaledTime } from '../flavours';
import Game from '../Game';
import { HitSize } from '../Hitbox';
import { zFlying } from '../layers';
import { getBack, gTimeScale, gWalkScale } from '../nums';
import { draw3D } from '../rendering';
import controller, { eDrop, eRecover } from '../spr/flazza';
import {
	angleCollides,
	angleDistance,
	drawWedge,
	first,
	scaleWidth,
	unscaleWidth,
	wrapAngle,
	π,
} from '../tools';
import AbstractEnemy from './AbstractEnemy';

const gAttackWidth = 120,
	gSpeed = 0.2,
	gFlopSpeed = 1.5,
	gDropSpeed = -7,
	gRecoverSpeed = 0.75;

const sProwling = 'prowling',
	sFlop = 'flop',
	sDrop = 'drop',
	sSlam = 'slam',
	sRecovery = 'recovery';
type FlazzaState = 'prowling' | 'flop' | 'drop' | 'slam' | 'recovery';

interface FlazzaInit {
	img?: ResourceName;
	r?: Pixels;
}

export default class Flazza extends AbstractEnemy {
	dir: Facing;
	dropSpeed: number;
	recoverSpeed: number;
	rtop: number;
	speed: number;
	sprite: controller;
	state: FlazzaState;
	tscale: ScaledTime;

	constructor(
		game: Game,
		{ r = 250, img = 'enemy.flazza' }: FlazzaInit = {}
	) {
		super({
			layer: zFlying,
			game,
			name: 'Flazza',
			width: 45,
			height: 45,
			a: 0,
			r,
			rtop: r,
			dir: dLeft,
			speed: gSpeed,
			dropSpeed: gDropSpeed,
			recoverSpeed: gRecoverSpeed,
			va: 0,
			vr: 0,
			state: sProwling,
			sprite: new controller(game.resources[img]),
			alive: true,
			health: 2,
			damage: 1,
		});

		this.sprite.map = {
			[eDrop]: this.onDrop.bind(this),
			[eRecover]: this.onRecover.bind(this),
		};
	}

	update(time: number): void {
		if (!(time = this.dostun(time))) return;

		const { rtop, game, sprite, dir, speed, dropSpeed, recoverSpeed } =
			this;
		let { a, r, va, vr, state } = this;
		const { player } = game,
			tscale: ScaledTime = time / gTimeScale;

		switch (state) {
			case sProwling:
				if (this.shouldAttack(player)) {
					state = sFlop;
				} else {
					va = dir === dLeft ? -speed : speed;
				}

				break;

			case sFlop:
				vr = gFlopSpeed;
				break;

			case sDrop: {
				va = 0;
				const floor = this.getFloor();
				if (floor) {
					r = floor.r;
					vr = 0;
					state = sSlam;
				} else {
					vr = dropSpeed;
				}
				break;
			}

			case sRecovery:
				if (r >= rtop) {
					r = rtop;
					vr = 0;
					state = sProwling;
				} else {
					va = dir === dLeft ? -speed : speed;
					vr = recoverSpeed;
				}
				break;
		}

		this.va = va;
		this.vr = vr;
		a += (va / r) * tscale * gWalkScale;
		r += vr * tscale;

		if (r < 0) {
			r *= -1;
			a += π;
		}

		this.a = wrapAngle(a);
		this.r = r;
		this.state = state;

		if (dir === dLeft) sprite.left();
		else sprite.right();

		switch (state) {
			case sProwling:
			case sRecovery:
				sprite.fly(time);
				break;

			case sFlop:
				sprite.flop(time);
				break;

			case sDrop:
				sprite.drop(time);
				break;

			case sSlam:
				sprite.slam(time);
				break;
		}

		if (this.del) {
			this.debug({
				state,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${this.z.toFixed(2)}`,
			});
		}
	}

	draw(c: CanvasRenderingContext2D): void {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top, a } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);
		drawWedge(c, cAI, cx, cy, a, top);
	}

	getHitbox(): { bot: HitSize; top: HitSize; a: HitSize } {
		const { r, a, z, va, vr, width, height, tscale } = this;
		const baw = scaleWidth(width, r, z),
			taw = scaleWidth(width, r + height, z),
			aaw = scaleWidth(gAttackWidth, r, z);
		let amod: number,
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
			a: {
				r: r + vbr,
				a: amod,
				z,
				width: aaw,
			},
		};
	}

	getFloor(): Flat | undefined {
		const { bot, top } = this.getHitbox();
		const { game } = this;
		const back = getBack(this.z);

		return first(
			game.floors,
			f =>
				back === f.back &&
				bot.r <= f.r &&
				top.r >= f.r &&
				angleCollides(top, f)
		);
	}

	shouldAttack(target) {
		const { a, r } = this;

		const dist = unscaleWidth(angleDistance(a, target.a), r);
		return target.health && dist - target.w <= gAttackWidth && r > target.r;
	}

	onDrop() {
		this.state = sDrop;
	}

	onRecover() {
		this.state = sRecovery;
	}
}
