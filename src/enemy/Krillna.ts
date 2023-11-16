import { cHurt } from '../colours';
import Flat from '../component/Flat';
import Wall from '../component/Wall';
import { dDown, dLeft, dRight, dUp } from '../dirs';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zEnemy } from '../layers';
import {
	gGravityStrength,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
} from '../nums';
import controller from '../spr/krillna';
import {
	anglecollides,
	angledist,
	anglewrap,
	cart,
	drawWedge,
	first,
	scalew,
	π,
	πHalf,
} from '../tools';
import AbstractEnemy from './AbstractEnemy';

const gFrameMotion = [0.2, 0.6, 0.8, 1.4, 0.8, 0.6],
	gKrillnaSpeed = 0.16,
	gRadiusMult = 6;

interface KrillnaInit {
	a?: number;
	img?: string;
	r?: number;
	speed?: number;
}

export default class Krillna extends AbstractEnemy {
	dir: 'L' | 'R' | 'U' | 'D';
	last: { ceiling?: Flat | null; floor?: Flat | null; wall?: Wall | null };
	movefn: (frame: number, n: number) => number;
	speed: number;
	sprite: controller;
	tscale: number;
	vfa: number;

	constructor(game: Game, options: KrillnaInit = {}) {
		super({
			isEnemy: true,
			layer: zEnemy,
			game,
			name: 'Krillna',
			dir: dRight,
			speed: options.speed || gKrillnaSpeed,
			last: {},
			width: 40,
			height: 28,
			a: options.a || πHalf,
			r: options.r || 200,
			va: 0,
			vr: 0,
			vfa: 0,
			vfr: 0,
			tscale: 0,
			movefn: (fr: number, n: number) => gFrameMotion[fr] * n,
			sprite: new controller(
				game.resources[options.img || 'enemy.krillna']
			),
			alive: true,
			health: 5,
			damage: 1,
		});
	}

	update(time: number): void {
		if (!(time = this.dostun(time))) return;

		let {
			a,
			r,
			va,
			vr,
			vfa,
			game,
			dir,
			speed,
			last,
			sprite,
			height,
			width,
			movefn,
		} = this;
		const { walls, ceilings, floors } = game,
			tscale = time / gTimeScale;
		this.tscale = tscale;
		const { bot, top } = this.getHitbox();

		let floor: Flat | null = null;
		if (vr <= 0 || last.floor) {
			floor = first(floors, f => {
				const da = angledist(a, f.a);

				return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
			});
		}

		let ceiling: Flat | null = null;
		if (vr > 0 || last.ceiling) {
			ceiling = first(ceilings, f => {
				const da = angledist(a, f.a);

				return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
			});
			if (ceiling) {
				vr = 0;
			}
		}

		let wall: Wall | null = null;
		if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
			const vas = Math.sign(va + vfa);

			wall = first(walls, w => {
				if (vas !== w.direction && !w.motion) return false;

				return (
					top.r >= w.bottom && bot.r <= w.top && anglecollides(bot, w)
				);
			});
		}

		function applyfloor(f: Flat) {
			floor = f;
			wall = null;
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

		function applywall(w: Wall) {
			wall = w;
			floor = null;
			ceiling = null;
			stuck = w;
			va = 0;
			dir = dir === dDown ? dir : dUp;
			vr = (dir === dUp ? speed : -speed) * gRadiusMult;
			vfa = w.motion * time;

			const wsw = scalew(width, r);
			if (w.direction === 1) {
				sprite.wleft();
				a = w.a - wsw;
			} else {
				sprite.wright();
				a = w.a + wsw;
			}
		}

		function applyceiling(c: Flat) {
			ceiling = c;
			wall = null;
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
			applyfloor(floor);
		} else if (last.floor) {
			if (
				angledist(a, last.floor.right) < angledist(a, last.floor.left)
			) {
				wall = last.floor.wright || null;
			} else {
				wall = last.floor.wleft || null;
			}

			if (wall) {
				r = wall.top;
				dir = dDown;
			}
		}

		if (ceiling && !last.wall) {
			applyceiling(ceiling);
		} else if (last.ceiling) {
			if (
				angledist(a, last.ceiling.right) <
				angledist(a, last.ceiling.left)
			) {
				wall = last.ceiling.wright || null;
			} else {
				wall = last.ceiling.wleft || null;
			}

			if (wall) {
				r = wall.bottom - height;
				dir = dUp;
			}
		}

		if (wall) {
			applywall(wall);
		} else if (last.wall) {
			if (bot.r <= last.wall.top && top.r >= last.wall.bottom) {
				applywall(last.wall);
			} else if (dir === dDown && last.wall.ceiling) {
				if (last.wall.direction === 1) dir = dRight;
				else dir = dLeft;
				applyceiling(last.wall.ceiling);
			} else if (dir === dUp && last.wall.floor) {
				if (last.wall.direction === 1) dir = dRight;
				else dir = dLeft;
				applyfloor(last.wall.floor);
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

		this.a = anglewrap(a);
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

	draw(c) {
		const { a, r, game, sprite } = this;
		const { cx, cy } = game;
		const normal = a + πHalf + sprite.normal;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawHitbox(c) {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, va, vr, width, height, tscale } = this;
		const baw = scalew(width, r),
			taw = scalew(width, r + height);
		let amod,
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
}
