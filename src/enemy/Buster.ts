import { cAI, cAIDark, cHurt } from '../colours';
import {
	Degrees,
	Milliseconds,
	Pixels,
	Radians,
	ResourceName,
	ScaledTime,
} from '../flavours';
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
import BusterController from '../spr/buster';
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

const gJumpFatigue: ScaledTime = 150,
	gJumpSide = 0.4,
	gJumpStartup: ScaledTime = 15,
	gJumpStrength = 4,
	gAttackWidth: Pixels = 250,
	gNearWidth: Pixels = 500;

const sIdle = 'idle',
	sPreJump = 'prejump',
	sJumping = 'jumping',
	sWaiting = 'waiting';
type BusterState = 'idle' | 'prejump' | 'jumping' | 'waiting';

interface BusterInit {
	back?: boolean;
	a?: Degrees;
	damage?: number;
	health?: number;
	height?: Pixels;
	img?: ResourceName;
	jumpFatigue?: ScaledTime;
	r?: Pixels;
	sprite?: BusterController;
	width?: Pixels;
}

export default class Buster extends AbstractEnemy {
	fatigue: ScaledTime;
	grounded: boolean;
	jumpDelay: ScaledTime;
	jumpFatigue: ScaledTime;
	sprite: BusterController;
	state: BusterState;
	tscale: ScaledTime;
	vfa: number;

	constructor(
		game: Game,
		{
			back = false,
			width = 52,
			height = 30,
			a = 0,
			r = 250,
			jumpFatigue = gJumpFatigue,
			sprite,
			img = 'enemy.buster',
			health = 3,
			damage = 1,
		}: BusterInit = {}
	) {
		super({
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
			jumpDelay: 0,
			jumpFatigue,
			state: sIdle,
			sprite: sprite ?? new BusterController(game.resources[img]),
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
			tscale: ScaledTime = time / gTimeScale;
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
						this.jumpDelay -= tscale;
						if (this.jumpDelay <= 0) {
							va = this.getJumpSide() * gJumpSide;
							this.fatigue = this.jumpFatigue;
							vr = gJumpStrength;
							state = sJumping;
						}
						break;

					case sJumping:
						state = sWaiting;
						break;

					case sWaiting:
						this.jumpDelay -= tscale;
						if (this.jumpDelay <= 0) state = sIdle;
						break;

					default:
						if (this.fatigue <= 0) {
							state = sPreJump;
							this.jumpDelay = gJumpStartup;
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
		sprite.animate(time, vr, this.grounded, state === sPreJump, near);

		if (this.del) {
			const { jumpDelay, fatigue } = this;
			this.debug({
				state,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${this.z.toFixed(2)}`,
				jump: `${jumpDelay.toFixed(2)}jd, ${fatigue.toFixed(2)}f`,
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
		const { r, a, z, va, vr, width, height, tscale } = this;
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
				r: r + (height * z) / 2 + vbr,
				a: amod,
				z,
				width: aaw,
			},
			n: {
				r: r + (height * z) / 2 + vbr,
				a: amod,
				z,
				width: naw,
			},
		};
	}
}
