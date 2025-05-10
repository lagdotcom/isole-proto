import { cHurt } from '../colours';
import Flat from '../component/Flat';
import Wall from '../component/Wall';
import { dDown, dLeft, dRight, dUp } from '../dirs';
import { Pixels, Radians, ResourceName } from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zEnemy } from '../layers';
import { gGravityStrength, gTimeScale, gWalkScale } from '../nums';
import physics from '../physics';
import { drawSprite } from '../rendering';
import controller from '../spr/krillna';
import {
	angleDistance,
	cart,
	drawWedge,
	scaleWidth,
	wrapAngle,
	π,
	πHalf,
} from '../tools';
import AbstractEnemy from './AbstractEnemy';

const gFrameMotion = [0.2, 0.6, 0.8, 1.4, 0.8, 0.6],
	gKrillnaSpeed = 0.16,
	gRadiusMult = 6;

interface KrillnaInit {
	a?: Radians;
	img?: ResourceName;
	r?: Pixels;
	speed?: number;
}

export default class Krillna extends AbstractEnemy {
	dir: 'L' | 'R' | 'U' | 'D';
	last: { ceiling?: Flat; floor?: Flat; wall?: Wall };
	movefn: (frame: number, n: number) => number;
	speed: number;
	sprite: controller;
	tscale: number;
	vfa: number;
	ignoreGravity: boolean;

	constructor(
		game: Game,
		{
			speed = gKrillnaSpeed,
			a = πHalf,
			r = 200,
			img = 'enemy.krillna',
		}: KrillnaInit = {}
	) {
		super({
			isEnemy: true,
			layer: zEnemy,
			game,
			name: 'Krillna',
			dir: dRight,
			speed,
			last: {},
			width: 40,
			height: 28,
			a,
			r,
			va: 0,
			vr: 0,
			vfa: 0,
			vfr: 0,
			tscale: 0,
			movefn: (fr: number, n: number) => gFrameMotion[fr] * n,
			sprite: new controller(game.resources[img]),
			alive: true,
			health: 5,
			damage: 1,
			ignoreGravity: false,
		});
	}

	update(time: number): void {
		if (!(time = this.dostun(time))) return;

		const { z, speed, last, sprite, height, width, movefn } = this;
		let { a, r, va, vr, vfa, dir } = this;
		const tscale = time / gTimeScale;
		this.tscale = tscale;
		const { bot, top } = this.getHitbox();

		this.ignoreGravity = !!(last.ceiling || last.floor || last.wall);
		if (last.ceiling) this.vr = 0.001; // make sure it checks the current ceiling again
		let { floor, ceiling, wall } = physics(this, time);

		function applyFloor(f: Flat) {
			floor = f;
			wall = undefined;
			stuck = f;
			r = f.r;
			vr = 0;
			dir = dir === dRight ? dir : dLeft;
			va = dir === dRight ? speed : -speed;
			vfa = f.motion * time;

			if (last.wall) {
				if (last.wall.direction === 1) a = f.left;
				else a = f.right;
			}

			sprite.ground();
		}

		function applyWall(w: Wall) {
			wall = w;
			floor = undefined;
			ceiling = undefined;
			stuck = w;
			va = 0;
			dir = dir === dDown ? dir : dUp;
			vr = (dir === dUp ? speed : -speed) * gRadiusMult;
			vfa = w.motion * time;

			const wsw = scaleWidth(width, r, z);
			if (w.direction === 1) {
				sprite.walkLeft();
				a = w.a - wsw;
			} else {
				sprite.walkRight();
				a = w.a + wsw;
			}
		}

		function applyCeiling(c: Flat) {
			ceiling = c;
			wall = undefined;
			stuck = c;
			r = c.r - height;
			vr = 0;
			dir = dir === dRight ? dir : dLeft;
			va = dir === dRight ? speed : -speed;
			vfa = c.motion * time;

			if (last.wall) {
				if (last.wall.direction === 1) a = c.left;
				else a = c.right;
			}

			sprite.ceiling();
		}

		let stuck: Flat | Wall | null = null;
		if (floor && !last.wall) {
			applyFloor(floor);
		} else if (last.floor) {
			if (
				angleDistance(a, last.floor.right) <
				angleDistance(a, last.floor.left)
			) {
				wall = last.floor.wallRight;
			} else {
				wall = last.floor.wallLeft;
			}

			if (wall) {
				r = wall.top;
				dir = dDown;
			}
		}

		if (ceiling && !last.wall) {
			applyCeiling(ceiling);
		} else if (last.ceiling) {
			if (
				angleDistance(a, last.ceiling.right) <
				angleDistance(a, last.ceiling.left)
			) {
				wall = last.ceiling.wallRight;
			} else {
				wall = last.ceiling.wallLeft;
			}

			if (wall) {
				r = wall.bottom - height;
				dir = dUp;
			}
		}

		if (wall) {
			applyWall(wall);
		} else if (last.wall) {
			if (bot.r <= last.wall.top && top.r >= last.wall.bottom) {
				applyWall(last.wall);
			} else if (dir === dDown && last.wall.ceiling) {
				if (last.wall.direction === 1) dir = dRight;
				else dir = dLeft;
				applyCeiling(last.wall.ceiling);
			} else if (dir === dUp && last.wall.floor) {
				if (last.wall.direction === 1) dir = dRight;
				else dir = dLeft;
				applyFloor(last.wall.floor);
			}
		}

		if (!stuck) {
			vr -= gGravityStrength;
		}

		const mva = stuck ? movefn(sprite.r, va) : va,
			mvr = stuck ? movefn(sprite.r, vr) : vr;

		this.va = va;
		this.vfa = vfa;
		this.vr = vr;
		a += (mva / r) * tscale * gWalkScale + vfa;
		r += mvr * tscale;

		if (r < 0) {
			r *= -1;
			a += π;
		}

		this.a = wrapAngle(a);
		this.r = r;
		this.dir = dir;
		this.last = { wall, floor, ceiling };

		if (!floor && !ceiling && !wall) {
			sprite.air();
		} else {
			sprite.walk(tscale, dir);
		}

		this.debug({
			vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
			pos: `${r.toFixed(2)},${a.toFixed(2)}r`,
		});
	}

	draw(c: CanvasRenderingContext2D) {
		const { a, r, z, game, sprite } = this;
		const { cx, cy } = game;
		const normal = a + πHalf + sprite.normal;
		const { x, y } = cart(a, r);
		drawSprite(c, sprite, { cx, cy, x, y, z, normal });
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { back, r, a, z, va, vr, width, height, tscale } = this;
		const baw = scaleWidth(width, r, z),
			taw = scaleWidth(width, r + height, z);
		let amod,
			vbr = 0,
			vtr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr > 0) vtr = vr;
		else if (vr < 0) vbr = vr;

		return {
			bot: {
				back,
				r: r + vbr,
				a: amod,
				z,
				width: baw,
			},
			top: {
				back,
				r: r + height * z + vtr,
				a: amod,
				z,
				width: taw,
			},
		};
	}
}
