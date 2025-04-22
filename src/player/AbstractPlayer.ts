import Channel from '../Channel';
import { cHotspot, cHurt, cStep } from '../colours';
import Flat from '../component/Flat';
import Wall from '../component/Wall';
import Damageable from '../Damageable';
import { dLeft, dRight, Facing } from '../dirs';
import Enemy from '../Enemy';
import {
	DisplayLayer,
	Milliseconds,
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
	gGravityStrength,
	gGroundFriction,
	gGroundWalk,
	gMaxVA,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import Player, { PlayerInit } from '../Player';
import PlayerController from '../spr/PlayerController';
import {
	angleCollides,
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
	wrapAngle,
	π,
	πHalf,
} from '../tools';

const gJumpAffectStrength = 0.15,
	gJumpAffectTimer = -10,
	gJumpDoubleTimer = -10,
	gJumpStrength = 4,
	gJumpTimer = 8;

export default abstract class AbstractPlayer implements Player {
	a: Radians;
	alive: boolean;
	body: Channel;
	deadSound: ResourceName;
	del?: HTMLElement;
	facing: Facing;
	game: Game;
	grounded: boolean;
	h: Pixels;
	invincible?: boolean;
	invincibleTimer: Milliseconds;
	isPlayer: true;
	canDoubleJump: boolean;
	jumplg: boolean;
	jumpt: number;
	health: number;
	hurtSound: ResourceName;
	layer: DisplayLayer;
	name: string;
	pickupdebounce: boolean;
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

	constructor(game: Game, options: PlayerInit = {}) {
		Object.assign(
			this,
			{
				isPlayer: true,
				layer: zPlayer,
				game,
				stepHeight: 10,
				a: 0,
				r: 300,
				va: 0,
				vr: 0,
				vfa: 0,
				vfr: 0,
				facing: dRight,
				jumpt: 0,
				canDoubleJump: true,
				jumplg: false,
				tscale: 0,
				alive: true,
				health: 5,
				pickupdebounce: false,
			},
			this.getDefaultInit(game, options),
			options
		);

		this.a = deg2rad(options.a ?? 0);

		if (game.options.showDebug) {
			this.del = mel(game.options.debugContainer, 'div', {
				className: 'debug debug-player',
			});
		}
	}

	abstract getDefaultInit(game: Game, options: PlayerInit): Partial<this>;

	update(time: Milliseconds): void {
		let { a, r, va, vr, vfa, canDoubleJump, jumplg, jumpt } = this;
		const { game, sprite } = this;
		const { walls, ceilings, floors, keys, enemies } = game,
			tscale = time / gTimeScale;
		this.tscale = tscale;
		const { bot, top, step } = this.getHitbox();
		let debug = '';
		const flags: string[] = [];

		let floor: Flat | null = null;
		if (vr <= 0) {
			flags.push('down');
			floor = first(
				floors,
				f => bot.r <= f.r && step.r >= f.r && angleCollides(step, f)
			);
		}

		let ceiling: Flat | null = null;
		if (vr > 0) {
			flags.push('up');
			ceiling = first(
				ceilings,
				f => bot.r <= f.r && top.r >= f.r && angleCollides(top, f)
			);
			if (ceiling) {
				flags.push('ceiling');
				if (vr > 0) this.body.play('player.bonk');
				vr = 0;
			}
		}

		let wall: Wall | null = null;
		if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
			flags.push('sideways');
			const vas = Math.sign(va + vfa);
			wall = first(walls, w => {
				if (vas !== w.direction && !w.motion) return false;

				return (
					top.r >= w.bottom && bot.r <= w.top && angleCollides(bot, w)
				);
			});
		}

		let hurtenemy: Enemy | null = null;
		if (vr < 0) {
			hurtenemy = first(enemies, (e, i) => {
				if (collides({ bot, top: step }, e.getHitbox())) {
					debug += `jumped on e${i}: ${e.name}<br>`;
					return true;
				}

				return false;
			});
		}

		const hitenemy = first(enemies, (e, i) => {
			if (e !== hurtenemy && collides({ bot, top }, e.getHitbox())) {
				debug += `hit by e${i}: ${e.name}<br>`;
				return true;
			}

			return false;
		});

		this.jumpt = jumpt -= tscale;

		if (hurtenemy) {
			vr = gJumpStrength * 0.75;
			damage(hurtenemy, this, 1);
			this.body.play('player.bop');
		}
		if (hitenemy && hurtenemy !== hitenemy) {
			damage(this, hitenemy, hitenemy.damage ?? 1);
		}

		if (floor && jumpt <= 0) {
			this.grounded = true;
			this.canDoubleJump = canDoubleJump = true;

			r = floor.r;
			vr = 0;
			va *= gGroundFriction;
			vfa = floor.motion * time;
		} else {
			this.grounded = false;

			vr -= gGravityStrength;
			vfa = 0;
		}

		const ok = game.mode === 'level';
		const controls: string[] = [];
		if (ok && !sprite.flags.noControl && !this.removeControl) {
			const strength = this.grounded ? gGroundWalk : gAirWalk;
			if (keys.has(InputButton.Left)) {
				va -= strength;
				controls.push('left');

				if (!sprite.flags.noTurn) {
					sprite.face(-1, this.grounded, canDoubleJump);
					this.facing = dLeft;
				}
			} else if (keys.has(InputButton.Right)) {
				va += strength;
				controls.push('right');

				if (!sprite.flags.noTurn) {
					sprite.face(1, this.grounded, canDoubleJump);
					this.facing = dRight;
				}
			}

			if (keys.has(InputButton.Jump)) {
				if (floor) {
					vr += gJumpStrength;
					this.jumpt = jumpt = gJumpTimer;
					controls.push('jump');
					this.body.play('player.jump');
				} else if (
					jumpt < gJumpDoubleTimer &&
					canDoubleJump &&
					jumplg
				) {
					this.jumpt = jumpt = gJumpTimer;
					this.canDoubleJump = canDoubleJump = false;
					vr = gJumpStrength;
					controls.push('jumpd');
					this.body.play('player.jump');
				} else if (jumpt >= gJumpAffectTimer && !jumplg) {
					vr += gJumpAffectStrength;
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

				if (!this.pickupdebounce) {
					const item = game.pickups.find(p =>
						collides({ bot, top }, p.getHitbox())
					);

					if (item) {
						this.pickupdebounce = true;
						item.take();
					}
				}
			} else {
				this.pickupdebounce = false;
			}
		} else controls.push('nocontrol');

		if (wall && !ceiling) {
			flags.push('wall');
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

		if (!this.grounded) {
			if (canDoubleJump) sprite.jump(time);
			else sprite.doubleJump(time);
		} else if (Math.abs(va) < gStandThreshold) {
			sprite.stand(time);
		} else {
			sprite.walk(time);
		}

		if (jumpt > 0) flags.push('jump');
		if (this.grounded) flags.push('grounded');

		this.hurtTimer(time);

		if (game.options.showDebug && this.del)
			this.del.innerHTML = jbr(
				'<b>Player</b>',
				`controls: ${controls.join(' ')}`,
				`flags: ${flags.join(' ')}`,
				`vel: ${vr.toFixed(2)},${va.toFixed(2)}r`,
				`pos: ${r.toFixed(2)},${a.toFixed(2)}r`,
				`anim: ${sprite.a}+${sprite.at.toFixed(0)}ms, ${
					sprite.flip ? 'flip' : 'normal'
				}`,
				debug
			);
	}

	draw(c: CanvasRenderingContext2D): void {
		const { a, r, game, sprite, invincible } = this;
		const { cx, cy } = game;
		const normal = a + πHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		if (invincible) c.globalAlpha = 0.5;
		sprite.draw(c);
		if (invincible) c.globalAlpha = 1;

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
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
		const { r, a, va, vr, w, h, stepHeight, tscale } = this;
		const baw = scaleWidth(w, r),
			taw = scaleWidth(w, r + h),
			saw = scaleWidth(w, r + stepHeight);
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
				r: r + h + vtr,
				a: amod,
				width: taw,
			},
			step: {
				r: r + stepHeight + vtr,
				a: amod,
				width: saw,
			},
		};
	}

	hurt(by: Damageable, damage: number): void {
		this.invincible = true;
		this.invincibleTimer = 1000;

		// TODO: is this working?
		const dv = getDirectionVector(this, by);
		this.va += dv.a * 5;
		this.vr += dv.r * 5;

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
