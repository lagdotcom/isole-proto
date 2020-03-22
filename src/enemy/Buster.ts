import { cAI, cHurt } from '../colours';
import {
	gGravityStrength,
	gGroundFriction,
	gMaxVA,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import {
	angledist,
	anglewrap,
	cart,
	deg2rad,
	jbr,
	pi,
	piHalf,
	scalew,
	unscalew,
	first,
} from '../tools';
import controller from '../spr/buster';
import { zEnemy } from '../layers';
import Enemy from '../Enemy';
import Game from '../Game';
import { Quad } from '../Hitbox';
import Flat from '../component/Flat';
import Wall from '../component/Wall';
import mel from '../makeElement';
import Player from '../Player';

const gJumpFatigue = 150,
	gJumpSide = 0.4,
	gJumpStartup = 15,
	gJumpStrength = 4,
	gAttackWidth = 250,
	gNearWidth = 500,
	gRadiusMult = 6;

const sIdle = 'idle',
	sPreJump = 'prejump',
	sJumping = 'jumping',
	sWaiting = 'waiting';
type BusterState = 'idle' | 'prejump' | 'jumping' | 'waiting';

interface BusterController {
	draw(c: CanvasRenderingContext2D): void;
	fall(t: number): void;
	idle(t: number): void;
	jump(t: number): void;
	near(t: number): void;
	rise(t: number): void;
}

interface BusterInit {
	damage?: number;
	health?: number;
	height?: number;
	img?: string;
	jumpfatigue?: number;
	sprite?: BusterController;
	width?: number;
}

export default class Buster implements Enemy {
	a: number;
	alive: boolean;
	del: HTMLElement;
	fatigue: number;
	game: Game;
	grounded: boolean;
	health: number;
	height: number;
	isEnemy: true;
	layer: number;
	jumpdelay: number;
	jumpfatigue: number;
	name: string;
	r: number;
	sprite: BusterController;
	state: BusterState;
	tscale: number;
	va: number;
	vfa: number;
	vr: number;
	width: number;

	constructor(game: Game, options: BusterInit = {}) {
		Object.assign(
			this,
			{
				isEnemy: true,
				layer: zEnemy,
				game,
				name: 'Buster',
				width: options.width || 35,
				height: options.height || 35,
				a: 0,
				r: 250,
				va: 0,
				vr: 0,
				vfa: 0,
				vfr: 0,
				fatigue: 0,
				jumpdelay: 0,
				jumpfatigue: gJumpFatigue,
				state: sIdle,
				sprite:
					options.sprite ||
					new controller(
						game.resources[options.img || 'enemy.buster']
					),
				alive: true,
				health: options.health || 3,
				damage: options.damage || 1,
			},
			options
		);

		this.a = deg2rad(this.a);

		if (game.options.showDebug) {
			this.del = mel(game.options.debugContainer, 'div', {
				className: 'debug debug-enemy',
			});
		}
	}

	update(time: number): void {
		var { a, r, va, vr, vfa, game, sprite, state } = this;
		const { player, walls, ceilings, floors } = game,
			tscale = time / gTimeScale;
		const { b, t } = this.getHitbox();
		const playerDist = unscalew(angledist(a, player.a), r),
			near = player.alive && playerDist - player.w <= gNearWidth;

		var floor: Flat | null = null;
		if (vr <= 0) {
			floor = first(floors, f => {
				var da = angledist(a, f.a);

				return b.r <= f.r && t.r >= f.r && da < f.width + t.aw;
			});
		}

		var ceiling: Flat | null = null;
		if (vr > 0) {
			ceiling = first(ceilings, f => {
				var da = angledist(a, f.a);

				return b.r <= f.r && t.r >= f.r && da < f.width + t.aw;
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
					b.al <= w.a &&
					b.ar >= w.a &&
					t.r >= w.bottom &&
					b.r <= w.top
				);
			});
		}

		this.fatigue -= tscale;

		if (floor) {
			this.grounded = true;

			r = floor.r;
			vr = 0;
			va *= gGroundFriction;
			vfa = floor.motion * time;

			if (this.canAttack(player, playerDist)) {
				switch (state) {
					case sPreJump:
						this.jumpdelay -= tscale;
						if (this.jumpdelay <= 0) {
							va = this.getJumpSide() * gJumpSide;
							this.fatigue = this.jumpfatigue;
							vr = gJumpStrength;
							state = sJumping;
						}
						break;

					case sJumping:
						state = sWaiting;
						break;

					case sWaiting:
						this.jumpdelay -= tscale;
						if (this.jumpdelay <= 0) state = sIdle;
						break;

					default:
						if (this.fatigue <= 0) {
							state = sPreJump;
							this.jumpdelay = gJumpStartup;
						} else {
							state = sIdle;
						}
				}
			} else {
				state = sIdle;
			}
		} else {
			this.grounded = false;

			vr -= gGravityStrength;
			vfa = 0;
		}

		if (wall && !ceiling) {
			const bounce = wall.direction * gWallBounce;
			if (wall.direction == 1) {
				a = wall.a - b.aw;
				if (va > bounce) va = bounce;
			} else {
				a = wall.a + b.aw;
				if (va < -bounce) va = -bounce;
			}
		} else if (va > gMaxVA) va = gMaxVA;
		else if (va < -gMaxVA) va = -gMaxVA;

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
		this.state = state;

		if (!this.grounded) {
			if (vr > 0) sprite.rise(time);
			else sprite.fall(time);
		} else if (state === sPreJump) {
			sprite.jump(time);
		} else if (near) {
			sprite.near(time);
		} else {
			sprite.idle(time);
		}

		if (this.del) {
			const { jumpdelay, fatigue } = this;
			this.del.innerHTML = jbr(
				`<b>${this.name}</b>`,
				`state: ${state}`,
				`vel: ${vr.toFixed(2)},${va.toFixed(2)}r`,
				`pos: ${r.toFixed(2)},${a.toFixed(2)}r`,
				`${jumpdelay.toFixed(2)}jd, ${fatigue.toFixed(2)}f`
			);
		}
	}

	canAttack(player: Player, playerDist: number) {
		return player.alive && playerDist - player.w <= gAttackWidth;
	}

	getJumpSide() {
		return anglewrap(this.a - this.game.player.a) > pi ? 1 : -1;
	}

	draw(c: CanvasRenderingContext2D): void {
		const { a, r, game, sprite } = this;
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
		const { b, t, a, n } = this.getHitbox();

		c.strokeStyle = cHurt;
		c.beginPath();
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.arc(cx, cy, t.r, t.ar, t.al, true);
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.stroke();

		c.strokeStyle = cAI;
		c.beginPath();
		c.arc(cx, cy, a!.r, a!.al, a!.ar);
		c.arc(cx, cy, t.r, a!.ar, a!.al, true);
		c.arc(cx, cy, a!.r, a!.al, a!.ar);
		c.stroke();

		c.strokeStyle = cAI;
		c.beginPath();
		c.arc(cx, cy, n.r, n.al, n.ar);
		c.arc(cx, cy, t.r, n.ar, n.al, true);
		c.arc(cx, cy, n.r, n.al, n.ar);
		c.stroke();
	}

	getHitbox(): { t: Quad; b: Quad; a: Quad; n: Quad } {
		const { r, a, va, vr, width, height, tscale } = this;
		const baw = scalew(width, r),
			taw = scalew(width, r + height),
			aaw = scalew(gAttackWidth, r),
			naw = scalew(gNearWidth, r);
		var amod,
			vbr = 0,
			vtr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr > 0) vtr = vr;
		else if (vr < 0) vbr = vr;

		return {
			b: {
				r: r + vbr,
				aw: baw,
				al: amod - baw,
				ar: amod + baw,
			},
			t: {
				r: r + height + vtr,
				aw: taw,
				al: amod - taw,
				ar: amod + taw,
			},
			a: {
				r: r + vbr,
				aw: aaw,
				al: amod - aaw,
				ar: amod + aaw,
			},
			n: {
				r: r + vbr,
				aw: naw,
				al: amod - naw,
				ar: amod + naw,
			},
		};
	}
}
