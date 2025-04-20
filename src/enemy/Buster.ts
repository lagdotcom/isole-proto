import { cAI, cAIDark, cHurt } from '../colours';
import Flat from '../component/Flat';
import Wall from '../component/Wall';
import { Milliseconds, Pixels, Radians, ResourceName } from '../flavours';
import Game from '../Game';
import Hitbox, { Hitsize } from '../Hitbox';
import { zEnemy } from '../layers';
import {
	gGravityStrength,
	gGroundFriction,
	gMaxVA,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import Player from '../Player';
import controller from '../spr/buster';
import {
	angledist,
	anglewrap,
	cart,
	drawArc,
	drawWedge,
	first,
	isRightOf,
	scalew,
	unscalew,
	π,
	πHalf,
} from '../tools';
import AbstractEnemy from './AbstractEnemy';

const gJumpFatigue = 150,
	gJumpSide = 0.4,
	gJumpStartup = 15,
	gJumpStrength = 4,
	gAttackWidth: Pixels = 250,
	gNearWidth: Pixels = 500;

const sIdle = 'idle',
	sPreJump = 'prejump',
	sJumping = 'jumping',
	sWaiting = 'waiting';
type BusterState = 'idle' | 'prejump' | 'jumping' | 'waiting';

interface BusterController {
	draw(c: CanvasRenderingContext2D): void;
	fall(t: Milliseconds): void;
	idle(t: Milliseconds): void;
	jump(t: Milliseconds): void;
	near(t: Milliseconds): void;
	rise(t: Milliseconds): void;
}

interface BusterInit {
	a?: Radians;
	damage?: number;
	health?: number;
	height?: Pixels;
	img?: ResourceName;
	jumpfatigue?: number;
	r?: Pixels;
	sprite?: BusterController;
	width?: Pixels;
}

export default class Buster extends AbstractEnemy {
	fatigue: number;
	grounded: boolean;
	jumpdelay: number;
	jumpfatigue: number;
	sprite: BusterController;
	state: BusterState;
	tscale: number;
	vfa: number;

	constructor(
		game: Game,
		{
			width = 52,
			height = 30,
			a = 0,
			r = 250,
			jumpfatigue = gJumpFatigue,
			sprite,
			img = 'enemy.buster',
			health = 3,
			damage = 1,
		}: BusterInit = {}
	) {
		super({
			isEnemy: true,
			layer: zEnemy,
			game,
			name: 'Buster',
			width,
			height,
			a,
			r,
			va: 0,
			vr: 0,
			vfa: 0,
			vfr: 0,
			fatigue: 0,
			jumpdelay: 0,
			jumpfatigue,
			state: sIdle,
			sprite: sprite ?? new controller(game.resources[img]),
			alive: true,
			health,
			damage,
		});
	}

	update(time: Milliseconds): void {
		if (!(time = this.dostun(time))) return;

		let { a, r, va, vr, vfa, game, sprite, state } = this;
		const { player, walls, ceilings, floors } = game,
			tscale = time / gTimeScale;
		const { bot, top } = this.getHitbox();
		const playerDist = unscalew(angledist(a, player.a), r),
			near = player.alive && playerDist - player.w <= gNearWidth;

		let floor: Flat | null = null;
		if (vr <= 0) {
			floor = first(floors, f => {
				const da = angledist(a, f.a);

				return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
			});
		}

		let ceiling: Flat | null = null;
		if (vr > 0) {
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
					bot.a - bot.width <= w.a &&
					bot.a + bot.width >= w.a &&
					top.r >= w.bottom &&
					bot.r <= w.top
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
			if (wall.direction === 1) {
				a = wall.a - bot.width;
				if (va > bounce) va = bounce;
			} else {
				a = wall.a + bot.width;
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
			a += π;
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
			this.debug({
				state,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r`,
				jump: `${jumpdelay.toFixed(2)}jd, ${fatigue.toFixed(2)}f`,
			});
		}
	}

	canAttack(player: Player, playerDist: Pixels) {
		return player.alive && playerDist - player.w <= gAttackWidth;
	}

	getJumpSide() {
		return isRightOf(this.a, this.game.player.a) ? 1 : -1;
	}

	draw(c: CanvasRenderingContext2D): void {
		const { a, r, game, sprite } = this;
		const { cx, cy } = game;
		const normal: Radians = a + πHalf;

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
		const { bot, top, a, n } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);

		drawArc(c, cAI, cx, cy, a.r, a.a, a.width);
		drawArc(c, cAIDark, cx, cy, n.r, n.a, n.width);
	}

	getHitbox(): { top: Hitsize; bot: Hitsize; a: Hitsize; n: Hitsize } {
		const { r, a, va, vr, width, height, tscale } = this;
		const baw = scalew(width, r),
			taw = scalew(width, r + height),
			aaw = scalew(gAttackWidth, r),
			naw = scalew(gNearWidth, r);
		let amod: Radians,
			vbr: Pixels = 0,
			vtr: Pixels = 0;

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
			a: {
				r: r + height / 2 + vbr,
				a: amod,
				width: aaw,
			},
			n: {
				r: r + height / 2 + vbr,
				a: amod,
				width: naw,
			},
		};
	}
}
