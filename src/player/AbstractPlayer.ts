import Channel from '../Channel';
import { cHotspot, cHurt, cStep } from '../colours';
import Damageable from '../Damageable';
import { dLeft, dRight, Facing } from '../dirs';
import {
	DisplayLayer,
	Milliseconds,
	Multiplier,
	Pixels,
	Radians,
	ResourceName,
} from '../flavours';
import Game from '../Game';
import { HitSize } from '../Hitbox';
import { InputButton } from '../InputMapper';
import { zPlayer } from '../layers';
import mel from '../makeElement';
import {
	gAirWalk,
	gBackZ,
	getZ,
	gFrontZ,
	gGroundWalk,
	gMaxVA,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import physics from '../physics';
import Player, { PlayerInit } from '../Player';
import { draw3D } from '../rendering';
import PlayerController from '../spr/PlayerController';
import {
	cart,
	collides,
	damage,
	deg2rad,
	displace,
	drawCross,
	drawWedge,
	first,
	getDirectionVector,
	jbr,
	scaleWidth,
} from '../tools';

const gJumpAffectStrength = 0.15,
	gJumpAffectTimer = -10,
	gJumpDoubleTimer = -10,
	gJumpStrength = 4,
	gJumpTimer = 8,
	gLeapSpeed = 0.02;

export default abstract class AbstractPlayer implements Player {
	a: Radians;
	alive: boolean;
	back: boolean;
	body: Channel;
	deadSound: ResourceName;
	del?: HTMLElement;
	facing: Facing;
	game: Game;
	grounded: boolean;
	h: Pixels;
	ignoreGravity: boolean;
	invincible?: boolean;
	invincibleTimer: Milliseconds;
	isPlayer: true;
	canDoubleJump: boolean;
	jumplg: boolean;
	jumpTimer: number;
	health: number;
	hurtSound: ResourceName;
	layer: DisplayLayer;
	leaping?: 'f' | 'b';
	name: string;
	pickUpDebounce: boolean;
	r: Pixels;
	removeControl: boolean;
	sprite: PlayerController;
	stepHeight: Pixels;
	tscale: number;
	va: number;
	vfa: number;
	voice: Channel;
	vr: number;
	w: number;
	z: Multiplier;

	constructor(game: Game, options: PlayerInit = {}) {
		Object.assign(
			this,
			{
				isPlayer: true,
				layer: zPlayer,
				game,
				stepHeight: 10,
				back: false,
				a: 0,
				r: 300,
				va: 0,
				vr: 0,
				vfa: 0,
				vfr: 0,
				facing: dRight,
				jumpTimer: 0,
				canDoubleJump: true,
				jumplg: false,
				tscale: 0,
				alive: true,
				health: 5,
				pickUpDebounce: false,
				ignoreGravity: false,
			},
			this.getDefaultInit(game, options),
			options
		);

		this.a = deg2rad(options.a ?? 0);
		this.z = getZ(this.back);

		if (game.options.showDebug) {
			this.del = mel(game.options.debugContainer, 'div', {
				className: 'debug debug-player',
			});
		}
	}

	abstract getDefaultInit(game: Game, options: PlayerInit): Partial<this>;

	update(time: Milliseconds): void {
		let { z, canDoubleJump, jumplg, jumpTimer } = this;
		const { game, sprite, va, vr } = this;
		const { keys, enemies } = game,
			tscale = time / gTimeScale;
		this.tscale = tscale;
		const { bot, top, step } = this.getHitbox();
		let debug = '';
		const flags: string[] = [];

		const hurtEnemy =
			vr < 0
				? first(enemies, (e, i) => {
						if (collides({ bot, top: step }, e.getHitbox())) {
							debug += `jumped on e${i}: ${e.name}<br>`;
							return true;
						}

						return false;
					})
				: undefined;

		const hitEnemy = !this.invincible
			? first(enemies, (e, i) => {
					if (
						e !== hurtEnemy &&
						collides({ bot, top }, e.getHitbox())
					) {
						debug += `hit by e${i}: ${e.name}<br>`;
						return true;
					}

					return false;
				})
			: undefined;

		this.jumpTimer = jumpTimer -= tscale;

		if (hurtEnemy) {
			this.vr = gJumpStrength * 0.75;
			damage(hurtEnemy, this, 1);
			this.body.play('player.bop');
		}
		if (hitEnemy) {
			damage(this, hitEnemy, hitEnemy.damage ?? 1);
		}

		this.ignoreGravity = !!this.leaping;
		const { floor, ceiling, wall } = physics(this, time);

		if (vr <= 0) {
			flags.push('down');
		}

		if (vr > 0) {
			flags.push('up');
			if (ceiling) {
				flags.push('ceiling');
				this.body.play('player.bonk');
			}
		}

		if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
			flags.push('sideways');
		}

		if (floor && !this.leaping) {
			this.grounded = true;
			this.canDoubleJump = canDoubleJump = true;
		} else {
			this.grounded = false;
		}

		const ok = game.mode === 'level';
		const controls: string[] = [];
		if (ok && !sprite.flags.noControl && !this.removeControl) {
			const strength = this.grounded ? gGroundWalk : gAirWalk;
			if (keys.has(InputButton.Left)) {
				this.va -= strength;
				controls.push('left');

				if (!sprite.flags.noTurn) {
					sprite.face(-1, this.grounded, canDoubleJump, this.leaping);
					this.facing = dLeft;
				}
			} else if (keys.has(InputButton.Right)) {
				this.va += strength;
				controls.push('right');

				if (!sprite.flags.noTurn) {
					sprite.face(1, this.grounded, canDoubleJump, this.leaping);
					this.facing = dRight;
				}
			}

			if (keys.has(InputButton.Jump)) {
				if (floor) {
					this.vr += gJumpStrength;
					this.jumpTimer = jumpTimer = gJumpTimer;
					controls.push('jump');
					this.body.play('player.jump');
				} else if (
					jumpTimer < gJumpDoubleTimer &&
					canDoubleJump &&
					jumplg
				) {
					this.jumpTimer = jumpTimer = gJumpTimer;
					this.canDoubleJump = canDoubleJump = false;
					this.vr = gJumpStrength;
					controls.push('jumpd');
					this.body.play('player.jump');
				} else if (jumpTimer >= gJumpAffectTimer && !jumplg) {
					this.vr += gJumpAffectStrength;
					controls.push('jump+');
				}

				this.jumplg = jumplg = false;
			} else {
				this.jumplg = jumplg = true;
			}

			if (keys.has(InputButton.Swing)) controls.push('swing');
			if (keys.has(InputButton.Throw)) controls.push('throw');

			if (keys.has(InputButton.Pickup)) {
				controls.push('pickup');

				if (!this.pickUpDebounce) {
					const item = game.pickups.find(p =>
						collides({ bot, top }, p.getHitbox())
					);

					if (item) {
						this.pickUpDebounce = true;
						item.take();
					}
				}
			} else {
				this.pickUpDebounce = false;
			}

			if (keys.has(InputButton.Leap)) {
				if (this.grounded) {
					this.leaping = this.z == gFrontZ ? 'b' : 'f';
					controls.push('leap');
					this.body.play('player.jump');
				}
			}
		} else controls.push('nocontrol');

		if (wall && !ceiling) {
			flags.push('wall');
			const bounce = wall.direction * gWallBounce;
			if (wall.direction === 1) {
				this.a = wall.a - bot.width;
				if (va > bounce) this.va = bounce;
			} else {
				this.a = wall.a + bot.width;
				if (va < -bounce) this.va = -bounce;
			}
		} else if (va > gMaxVA) this.va = gMaxVA;
		else if (va < -gMaxVA) this.va = -gMaxVA;

		if (this.leaping) {
			const vz = this.leaping === 'f' ? gLeapSpeed : -gLeapSpeed;
			z += vz;
			game.redraw = true; // this is kinda stupid
			if (z <= gBackZ) {
				z = gBackZ;
				this.leaping = undefined;
				this.back = true;
			} else if (z >= gFrontZ) {
				z = gFrontZ;
				this.leaping = undefined;
				this.back = false;
			}

			this.z = z;
		}

		if (this.leaping) sprite.leap(time, this.leaping);
		else if (!this.grounded) {
			if (canDoubleJump) sprite.jump(time);
			else sprite.doubleJump(time);
		} else if (Math.abs(this.va) < gStandThreshold) sprite.stand(time);
		else sprite.walk(time);

		if (jumpTimer > 0) flags.push('jump');
		if (this.grounded) flags.push('grounded');

		this.hurtTimer(time);

		if (game.options.showDebug && this.del)
			this.del.innerHTML = jbr(
				'<b>Player</b>',
				`controls: ${controls.join(' ')}`,
				`flags: ${flags.join(' ')}`,
				`vel: ${this.vr.toFixed(2)},${this.va.toFixed(2)}r`,
				`pos: ${this.r.toFixed(2)},${this.a.toFixed(2)}r`,
				`anim: ${sprite.a}+${sprite.at.toFixed(0)}ms, ${
					sprite.flip ? 'flip' : 'normal'
				}`,
				debug
			);
	}

	draw(c: CanvasRenderingContext2D): void {
		if (this.invincible) c.globalAlpha = 0.5;
		draw3D(c, this);
		if (this.invincible) c.globalAlpha = 1;
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game, sprite } = this;
		const { cx, cy } = game;
		const { bot, top, step } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);
		drawWedge(c, cStep, cx, cy, bot, step);

		const p = cart(this.a, this.r);
		const { a, r } = displace(this, [sprite.hotspot], sprite.flip);
		const h = cart(a, r);
		c.strokeStyle = cHotspot;
		c.beginPath();
		c.moveTo(cx + h.x, cy + h.y);
		c.lineTo(cx + p.x, cy + p.y);
		c.stroke();
		drawCross(c, cHotspot, cx + h.x, cy + h.y);
	}

	getHitbox(): { bot: HitSize; top: HitSize; step: HitSize } {
		const { back, r, a, z, va, vr, w, h, stepHeight, tscale } = this;
		const baw = scaleWidth(w, r, z),
			taw = scaleWidth(w, r + h, z),
			saw = scaleWidth(w, r + stepHeight, z);
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
				r: r + h * z + vtr,
				a: amod,
				z,
				width: taw,
			},
			step: {
				back,
				r: r + stepHeight * z + vtr,
				a: amod,
				z,
				width: saw,
			},
		};
	}

	hurt(by: Damageable, damage: number): void {
		this.invincible = true;
		this.invincibleTimer = 1000;

		// TODO: is this working?
		const dv = getDirectionVector(this, by);
		this.va += dv.a * 2;
		this.vr += dv.r * 2;

		this.game.fire('player.hurt', { by, damage });
		this.voice.play(this.hurtSound);
		this.sprite.hurt();
	}

	hurtTimer(t: Milliseconds): void {
		this.invincibleTimer -= t;
		if (this.invincibleTimer <= 0) this.invincible = false;
	}

	die(by: Damageable): void {
		this.game.fire('player.dying', { by });
		this.voice.play(this.deadSound);
		this.sprite.die();
	}

	finishDeath(): void {
		this.game.fire('player.died', {});
		this.game.remove(this);
	}
}
