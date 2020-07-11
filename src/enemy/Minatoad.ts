import Game from '../Game';
import { Facing } from '../dirs';
import AnimController, {
	AnimSpecMap,
	ListenerMap,
	Listener,
} from '../AnimController';
import { eAnimationEnded } from '../events';
import AbstractEnemy from './AbstractEnemy';
import {
	gWalkScale,
	gTimeScale,
	gStandThreshold,
	gGroundFriction,
	gGravityStrength,
} from '../nums';
import {
	scalew,
	drawWedge,
	piHalf,
	cart,
	choose,
	rndr,
	first,
	angledist,
	pi,
	anglewrap,
	chance,
} from '../tools';
import { cHurt } from '../colours';
import Hitbox from '../Hitbox';
import DrawnComponent from '../DrawnComponent';
import { zSpark } from '../layers';
import Flat from '../component/Flat';
import Wall from '../component/Wall';

/*
Column 1: IDLE 
	- 75ms, stays active between the boss's various attacks

Column 2: BIG LEAP
	- Frames 1-3 65ms, Frames 4-6 75ms, Frame 7 150ms, Frame 8-9 75ms, Frame 10 300ms, Frame 11-12 75ms. 
	- Frame 13 hold this behavior til the Minatoad vanishes off screen, have the target reticle effect appear and follow the player for a few seconds
	- Frame 14-15 75ms, hold on frame 16 til the Minatoad lands, upon hitting the ground send shockwaves out left and right and maybe stun player if they don't jump
	- Frame 17 75ms, Frame 18 300 ms, Frame 19-24 75ms, return to idle motion after behavior completes
	- Use this move somewhat sparingly in boss's AI, maybe so it can only be used every two or more moves?

Column 3: SMALL HOP
	- Frames 1-4 75ms, Frame 5 hold until apex of jump is reached
	- Frames 6-7 75ms, Frame 8 hold until touching the ground
	- Loop back to frame 1, while this behavior is active have the boss leap continually clockwise or counterclockwise towards the player, like the Boosters
	- Random number of hops, no less than 3 and no more than 6 potentially? Can be adjusted later

Column 4: POISON SPRAY 
	- Frames 1-4 75ms, Frame 5 300ms
	- Frames 6-14 75ms, During this animation spread a slightly transluscent purple wavey mist in an AOE around the Minatoad that stays for a duration.
	- Unsure if purple mist would need a sprite? Seems like it'd fit mostly as a programatic effect

Column 5: RAPID FIRE CIRCULAR BULLET PATTERN
	- Frames 1-4 75ms, Frame 5 150 ms, shoot burst of either large or medium sized bullets from the sheet into the air
	- Frame 6 75ms, loop back to frame 2-4 and repeat this animation cycle 3-4 times, whatever feels good
	- As these actions are occuring, begin bullets falling from the edges of the screen like in the rapid trunk spray attack concept
	- Play frame 7-8 at 75ms, let Minatoad idle for a bit til bullets are mostly dissipated, then begin other attacks

Likely an obvious note, but Minatoad shouldn't be able to use any of it's skills twice in a row except for maybe the small hop.
*/

const eLeap = 'leap';
const eFire = 'fire';
const eRefire = 'refire';

interface MinatoadListenerMap extends ListenerMap {
	[eLeap]: Listener;
	[eFire]: Listener;
	[eRefire]: Listener;
	[eAnimationEnded]: Listener;
}

const animations: AnimSpecMap = {
	idle: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 75 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
			{ c: 0, r: 3, t: 75 },
			{ c: 0, r: 4, t: 75 },
			{ c: 0, r: 5, t: 75 },
		],
	},

	leapRise: {
		extend: true,
		frames: [
			{ c: 1, r: 0, t: 65 },
			{ c: 1, r: 1, t: 65 },
			{ c: 1, r: 2, t: 65 },
			{ c: 1, r: 3, t: 75 },
			{ c: 1, r: 4, t: 75 },
			{ c: 1, r: 5, t: 75, event: eLeap },
			{ c: 1, r: 6, t: 150 },
			{ c: 1, r: 7, t: 75 },
			{ c: 1, r: 8, t: 75 },
			{ c: 1, r: 9, t: 300 },
			{ c: 1, r: 10, t: 75 },
			{ c: 1, r: 11, t: 75 },
			{ c: 1, r: 12, t: 75 },
		],
	},

	leapFall: {
		extend: true,
		frames: [
			{ c: 1, r: 13, t: 75 },
			{ c: 1, r: 14, t: 75 },
			{ c: 1, r: 15, t: 75 },
		],
	},

	leapLand: {
		frames: [
			{ c: 1, r: 16, t: 75 },
			{ c: 1, r: 17, t: 300 },
			{ c: 1, r: 18, t: 75 },
			{ c: 1, r: 19, t: 75 },
			{ c: 1, r: 20, t: 75 },
			{ c: 1, r: 21, t: 75 },
			{ c: 1, r: 22, t: 75 },
			{ c: 1, r: 23, t: 75 },
		],
	},

	jump: {
		frames: [
			{ c: 2, r: 0, t: 75 },
			{ c: 2, r: 1, t: 75 },
		],
	},

	rise: {
		extend: true,
		frames: [
			{ c: 2, r: 2, t: 75 },
			{ c: 2, r: 3, t: 75 },
			{ c: 2, r: 4, t: 75 },
		],
	},

	fall: {
		extend: true,
		frames: [
			{ c: 2, r: 5, t: 75 },
			{ c: 2, r: 6, t: 75 },
			{ c: 2, r: 7, t: 75 },
		],
	},

	spray: {
		frames: [
			{ c: 3, r: 0, t: 75 },
			{ c: 3, r: 1, t: 75 },
			{ c: 3, r: 2, t: 75 },
			{ c: 3, r: 3, t: 75 },
			{ c: 3, r: 4, t: 500 },
			{ c: 3, r: 5, t: 75 },
			{ c: 3, r: 6, t: 75 },
			{ c: 3, r: 7, t: 75 },
			{ c: 3, r: 8, t: 75 },
			{ c: 3, r: 9, t: 75 },
			{ c: 3, r: 10, t: 75 },
			{ c: 3, r: 11, t: 75 },
			{ c: 3, r: 12, t: 75 },
			{ c: 3, r: 13, t: 75 },
		],
	},

	rapid: {
		frames: [
			{ c: 4, r: 0, t: 75 },
			{ c: 4, r: 1, t: 75 },
			{ c: 4, r: 2, t: 75 },
			{ c: 4, r: 3, t: 75 },
			{ c: 4, r: 4, t: 150, event: eFire },
			{ c: 4, r: 5, t: 75, event: eRefire },
			{ c: 4, r: 6, t: 75 },
			{ c: 4, r: 7, t: 75 },
		],
	},
};

class ReticleController extends AnimController {
	constructor(img: CanvasImageSource) {
		super({
			img,
			animations: {
				idle: {
					loop: true,
					frames: [
						{ c: 0, r: 0, t: 75 },
						{ c: 0, r: 1, t: 75 },
						{ c: 0, r: 2, t: 75 },
						{ c: 0, r: 3, t: 75 },
					],
				},
			},
			w: 128,
			h: 128,
			xo: -64,
			yo: -64,
		});

		this.play('idle');
	}

	update(t: number) {
		this.next(t);
	}
}
class Reticle implements DrawnComponent {
	a: number;
	sprite: ReticleController;
	game: Game;
	layer: number;
	r: number;

	constructor(game: Game, a: number, r: number) {
		this.a = a;
		this.sprite = new ReticleController(game.resources['reticle']);
		this.game = game;
		this.layer = zSpark;
		this.r = r;
	}

	update(t: number) {
		this.sprite.update(t);
	}

	draw(c: CanvasRenderingContext2D) {
		const { a, r, game, sprite } = this;
		const { cx, cy } = game;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);

		sprite.draw(c);

		c.translate(-x - cx, -y - cy);
	}
}

class MinatoadController extends AnimController {
	parent: MinatoadListenerMap;

	constructor(parent: MinatoadListenerMap, img: CanvasImageSource) {
		super({
			img,
			animations,
			w: 240,
			h: 240,
			xo: -120,
			yo: -170,
		});

		this.parent = parent;
	}

	_play(anim: string, force: boolean = false): void {
		return this.play(anim, force, this.parent);
	}

	idle(t: number) {
		this.play('idle');
		this.next(t);
	}

	jump(t: number) {
		this._play('jump');
		this.next(t);
	}

	rise(t: number) {
		this._play('rise');
		this.next(t);
	}

	fall(t: number) {
		this._play('fall');
		this.next(t);
	}

	leap(t: number) {
		this._play('leapRise');
		this.next(t);
	}

	leapFall(t: number) {
		this._play('leapFall');
		this.next(t);
	}

	leapLand(t: number) {
		this._play('leapLand');
		this.next(t);
	}

	spray(t: number) {
		this._play('spray');
		this.next(t);
	}

	rapid(t: number) {
		this._play('rapid');
		this.next(t);
	}
}

interface MinatoadOptions {
	a?: number;
	dir?: Facing;
	img?: string;
	r?: number;
}

type MinatoadState =
	| 'idle'
	| 'leap'
	| 'track'
	| 'fall'
	| 'slam'
	| 'hop'
	| 'spray'
	| 'rapid';

const gBetweenAttacks = 1000;
const gJumpStrength = 5;
const gJumpSpeed = 0.4;

export default class Minatoad extends AbstractEnemy {
	dir: Facing;
	hidden: boolean;
	jumps: number;
	last: MinatoadState;
	reticle: Reticle;
	shots: number;
	sprite: MinatoadController;
	state: MinatoadState;
	tscale: number;
	vfa: number;
	waittimer: number;

	constructor(game: Game, options: MinatoadOptions = {}) {
		super({
			game,
			width: 80,
			height: 80,
			name: 'Minatoad',
			dir: options.dir || 'L',
			last: 'idle',
			state: 'idle',
			a: options.a || 0,
			r: options.r || 250,
			va: 0,
			vfa: 0,
			vr: 0,
			health: 10,
			waittimer: 0,
			shots: 0,
			jumps: 0,
			hidden: false,
		});

		this.sprite = new MinatoadController(
			{
				[eAnimationEnded]: this.onAnimEnd.bind(this),
				[eFire]: this.onFire.bind(this),
				[eLeap]: this.onLeap.bind(this),
				[eRefire]: this.onRefire.bind(this),
			},
			game.resources[options.img || 'enemy.minatoad']
		);

		this.reticle = new Reticle(this.game, 0, 0);
	}

	onAnimEnd() {
		if (this.state == 'hop' && this.jumps > 0) {
			this.va = this.getJumpDir();
			this.vr = gJumpStrength;
			this.jumps--;
			return;
		}

		this.state = 'idle';
		this.waittimer = 0;
	}

	onFire() {}

	onLeap() {
		this.vr = 5;
	}

	onRefire() {
		this.shots--;
		if (this.shots >= 0) this.sprite.afi = 0;
	}

	getNextAttack() {
		var next: MinatoadState = this.last;

		while (next == this.last) {
			next = choose([
				'leap',
				'hop',
				'hop',
				'spray',
				'spray',
				'rapid',
				'rapid',
			]);
		}

		this.last = next;
		this.shots = rndr(3, 4);
		this.jumps = rndr(3, 6);
		return next;
	}

	update(time: number) {
		if (!(time = this.dostun(time))) return;

		const tscale = time / gTimeScale;
		this.tscale = tscale;
		this[this.state + 'Update'](time);

		if (this.del) {
			const { va, vr, r, a, sprite, state } = this;

			this.debug({
				state: `${state}`,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r`,
				anim: `${sprite.a}+${sprite.at.toFixed(0)}ms, ${
					sprite.flip ? 'flip' : 'normal'
				}`,
			});
		}
	}

	idleUpdate(t: number) {
		this.sprite.idle(t);
		this.physics(t);

		this.waittimer += t;
		if (this.waittimer > gBetweenAttacks) {
			const next = this.getNextAttack();
			this.last = this.state = next;
		}
	}

	leapUpdate(t: number) {
		this.sprite.leap(t);
		if (this.vr) this.vr = 20;

		this.physics(t);

		if (this.r >= 1000) {
			this.hidden = true;
			this.r = 1000;

			this.game.components.push(this.reticle);
			this.game.drawn.push(this.reticle);

			this.state = 'track';
			this.vr = 0;
			this.waittimer = rndr(2000, 3000);
		}
	}

	trackUpdate(t: number) {
		// TODO: correct r
		this.reticle.r = this.game.player.r;
		this.reticle.a = this.game.player.a;

		this.waittimer -= t;
		if (this.waittimer <= 0) {
			this.state = 'fall';

			this.game.remove(this.reticle);
			this.a = this.reticle.a;
			this.vr = -20;
			this.hidden = false;
		}
	}

	fallUpdate(t: number) {
		const { sprite } = this;
		const { floor } = this.physics(t);
		sprite.leapFall(t);

		if (floor) {
			this.r = floor.r;
			this.vr = 0;
			this.state = 'slam';
		}
	}

	slamUpdate(t: number) {
		this.sprite.leapLand(t);
		this.physics(t);
	}

	hopUpdate(t: number) {
		if (this.vr < 0) this.sprite.fall(t);
		else if (this.vr > 0) this.sprite.rise(t);
		else this.sprite.jump(t);

		this.physics(t);
	}

	sprayUpdate(t: number) {
		this.sprite.spray(t);
		this.physics(t);
	}

	rapidUpdate(t: number) {
		this.sprite.rapid(t);
		this.physics(t);
	}

	physics(time: number) {
		var { a, r, va, vr, vfa, game } = this;
		const { walls, ceilings, floors } = game,
			tscale = time / gTimeScale;
		const { bot, top } = this.getHitbox();

		var floor: Flat | null = null;
		if (vr <= 0) {
			floor = first(floors, f => {
				var da = angledist(a, f.a);

				return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
			});
		}

		var ceiling: Flat | null = null;
		if (vr > 0) {
			ceiling = first(ceilings, f => {
				var da = angledist(a, f.a);

				return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
			});
			if (ceiling) {
				vr = 0;
			}
		}

		var wall: Wall | null = null;
		if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
			const vas = Math.sign(va + vfa);
			wall = first(walls, w => {
				if (vas != w.direction && !w.motion) return false;

				return (
					bot.a - bot.width <= w.a &&
					bot.a + bot.width >= w.a &&
					top.r >= w.bottom &&
					bot.r <= w.top
				);
			});
		}

		if (floor) {
			r = floor.r;
			vr = 0;
			va *= gGroundFriction;
			vfa = floor.motion * time;
		} else {
			vr -= gGravityStrength;
			vfa = 0;
		}

		this.va = va;
		this.vfa = vfa;
		this.vr = vr;
		a += (va / r) * tscale * gWalkScale + vfa;
		r += vr * tscale;

		if (r < 0) {
			r *= -1;
			a += pi;
		}

		this.a = anglewrap(a);
		this.r = r;

		return { floor, ceiling, wall };
	}

	draw(c: CanvasRenderingContext2D) {
		const { a, r, game, sprite, hidden } = this;
		if (hidden) return;

		const { cx, cy } = game;
		const normal = a + piHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, va, vr, width, height, tscale } = this;
		const baw = scalew(width, r),
			taw = scalew(width, r + height);
		var amod: number,
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
				width: baw,
			},
			top: {
				r: r + height + vtr,
				a: amod,
				width: taw,
			},
		};
	}

	private getJumpDir() {
		return anglewrap(this.a - this.game.player.a) > pi
			? gJumpSpeed
			: -gJumpSpeed;
	}
}
