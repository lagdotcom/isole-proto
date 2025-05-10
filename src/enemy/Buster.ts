import { cAI, cAIDark, cHurt } from '../colours';
import { Milliseconds, Pixels, Radians, ResourceName } from '../flavours';
import Game from '../Game';
import { HitSize } from '../Hitbox';
import { zEnemy } from '../layers';
import {
	gGravityStrength,
	gGroundFriction,
	gMaxVA,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import physics from '../physics';
import Player from '../Player';
import { draw3D } from '../rendering';
import controller from '../spr/buster';
import {
	angleDistance,
	drawArc,
	drawWedge,
	isRightOf,
	scaleWidth,
	unscaleWidth,
	wrapAngle,
	π,
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
	back?: boolean;
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
			back = false,
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
			back,
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

		const { game, sprite } = this;
		let { a, r, va, vr, vfa, state } = this;
		const { player } = game,
			tscale = time / gTimeScale;
		const { bot } = this.getHitbox();
		const playerDist = unscaleWidth(angleDistance(a, player.a), r),
			near = player.alive && playerDist - player.w <= gNearWidth;

		const { floor, ceiling, wall } = physics(this, time);

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

			vr -= gGravityStrength * tscale;
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

		this.a = wrapAngle(a);
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
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top, a, n } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);

		drawArc(c, cAI, cx, cy, a.r, a.a, a.width);
		drawArc(c, cAIDark, cx, cy, n.r, n.a, n.width);
	}

	getHitbox(): { top: HitSize; bot: HitSize; a: HitSize; n: HitSize } {
		const { back, r, a, z, va, vr, width, height, tscale } = this;
		const baw = scaleWidth(width, r, z),
			taw = scaleWidth(width, r + height, z),
			aaw = scaleWidth(gAttackWidth, r, z),
			naw = scaleWidth(gNearWidth, r, z);
		let amod: Radians,
			vbr: Pixels = 0,
			vtr: Pixels = 0;

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
			a: {
				back,
				r: r + (height * z) / 2 + vbr,
				a: amod,
				z,
				width: aaw,
			},
			n: {
				back,
				r: r + (height * z) / 2 + vbr,
				a: amod,
				z,
				width: naw,
			},
		};
	}
}
