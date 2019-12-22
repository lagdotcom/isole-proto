import { cHurt, cStep, cHotspot } from '../colours';
import { dLeft, dRight, Facing } from '../dirs';
import { ePlayerDying, ePlayerHurt, ePlayerDied } from '../events';
import { kLeft, kRight, kJump, kThrow, kSwing } from '../keys';
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
import {
	angledist,
	anglewrap,
	cart,
	deg2rad,
	jbr,
	pi,
	piHalf,
	scalew,
	collides,
	damage,
	dirv,
	displace,
	first,
} from '../tools';
import mel from '../makeElement';
import { zPlayer } from '../layers';
import Channel from '../Channel';
import Game from '../Game';
import Damageable from '../Damageable';
import Flat from '../component/Flat';
import Wall from '../component/Wall';
import Enemy from '../Enemy';
import Hitbox from '../Hitbox';
import Player, { PlayerInit } from '../Player';
import PlayerController from '../spr/PlayerController';

const gJumpAffectStrength = 0.15,
	gJumpAffectTimer = -10,
	gJumpDoubleTimer = -10,
	gJumpStrength = 4,
	gJumpTimer = 8;

export default abstract class AbstractPlayer implements Player {
	a: number;
	alive: boolean;
	body: Channel;
	deadSound: string;
	del?: HTMLElement;
	facing: Facing;
	game: Game;
	grounded: boolean;
	h: number;
	invincible?: boolean;
	invtimer: number;
	isPlayer: true;
	jumpd: boolean;
	jumplg: boolean;
	jumpt: number;
	health: number;
	hurtSound: string;
	layer: number;
	name: string;
	r: number;
	sprite: PlayerController;
	steph: number;
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
				steph: 10,
				a: 0,
				r: 300,
				va: 0,
				vr: 0,
				vfa: 0,
				vfr: 0,
				facing: dRight,
				jumpt: 0,
				jumpd: true,
				jumplg: false,
				tscale: 0,
				alive: true,
				health: 5,
			},
			this.getDefaultInit(game, options),
			options
		);

		this.a = deg2rad(this.a);

		if (game.options.showDebug) {
			this.del = mel(game.options.debugContainer, 'div', {
				className: 'debug debug-player',
			});
		}
	}

	abstract getDefaultInit(game: Game, options: PlayerInit): any;

	update(time: number): void {
		var { a, r, va, vr, vfa, game, sprite, jumpd, jumplg } = this;
		const { walls, ceilings, floors, keys, enemies } = game,
			tscale = time / gTimeScale;
		this.tscale = tscale;
		const { b, t, s } = this.getHitbox();
		var debug = '',
			flags: string[] = [];

		var floor: Flat | null = null;
		if (vr <= 0) {
			flags.push('down');
			floor = first(floors, (f, i) => {
				var da = angledist(a, f.a);

				debug += `f${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}r<br>`;

				return b.r <= f.r && s.r >= f.r && da < f.width + s.aw;
			});
		}

		var ceiling: Flat | null = null;
		if (vr > 0) {
			flags.push('up');
			ceiling = first(ceilings, (f, i) => {
				var da = angledist(a, f.a);

				debug += `c${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}r<br>`;

				return b.r <= f.r && t.r >= f.r && da < f.width + t.aw;
			});
			if (ceiling) {
				flags.push('ceiling');
				if (vr > 0) this.body.play('player.bonk');
				vr = 0;
			}
		}

		var wall: Wall | null = null;
		if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
			flags.push('sideways');
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

		var hurtenemy: Enemy | null = null;
		if (vr < 0) {
			hurtenemy = first(enemies, (e, i) => {
				if (collides({ b, t: s }, e.getHitbox())) {
					debug += `jumped on e${i}: ${e.name}<br>`;
					return true;
				}

				return false;
			});
		}

		var hitenemy = first(enemies, (e, i) => {
			if (e !== hurtenemy && collides({ b, t }, e.getHitbox())) {
				debug += `hit by e${i}: ${e.name}<br>`;
				return true;
			}

			return false;
		});

		this.jumpt -= tscale;

		if (hurtenemy) {
			vr = gJumpStrength * 0.75;
			damage(hurtenemy, this, 1);
			this.body.play('player.bop');
		}
		if (hitenemy && hurtenemy !== hitenemy) {
			damage(this, hitenemy, hitenemy.damage || 1);
		}

		if (floor && this.jumpt <= 0) {
			this.grounded = true;
			this.jumpd = true;

			r = floor.r;
			vr = 0;
			va *= gGroundFriction;
			vfa = floor.motion * time;
		} else {
			this.grounded = false;

			vr -= gGravityStrength;
			vfa = 0;
		}

		var controls: string[] = [];
		if (!sprite.flags.noControl) {
			var strength = this.grounded ? gGroundWalk : gAirWalk;
			if (keys[kLeft]) {
				va -= strength;
				controls.push('left');

				if (!sprite.flags.noTurn) {
					sprite.face(-1, this.grounded);
					this.facing = dLeft;
				}
			} else if (keys[kRight]) {
				va += strength;
				controls.push('right');

				if (!sprite.flags.noTurn) {
					sprite.face(1, this.grounded);
					this.facing = dRight;
				}
			}

			if (keys[kJump]) {
				if (floor) {
					vr += gJumpStrength;
					this.jumpt = gJumpTimer;
					controls.push('jump');
					this.body.play('player.jump');
				} else if (this.jumpt < gJumpDoubleTimer && jumpd && jumplg) {
					this.jumpt = gJumpTimer;
					this.jumpd = false;
					vr = gJumpStrength;
					controls.push('jumpd');
					this.body.play('player.jump');
				} else if (this.jumpt >= gJumpAffectTimer && !jumplg) {
					vr += gJumpAffectStrength;
					controls.push('jump+');
				}

				this.jumplg = false;
			} else {
				this.jumplg = true;
			}

			if (keys[kSwing]) controls.push('swing');
			if (keys[kThrow]) controls.push('throw');
		} else controls.push('nocontrol');

		if (wall && !ceiling) {
			flags.push('wall');
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

		if (!this.grounded) {
			if (vr > 0) sprite.jump(time);
			else sprite.fall(time);
		} else if (Math.abs(va) < gStandThreshold) {
			sprite.stand(time);
		} else {
			sprite.walk(time);
		}

		if (this.jumpt > 0) flags.push('jump');
		if (this.grounded) flags.push('grounded');

		this.hurtTimer(time);

		if (game.options.showDebug && this.del)
			this.del.innerHTML = jbr(
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
		const normal = a + piHalf;

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
		const { b, t, s } = this.getHitbox();

		c.strokeStyle = cHurt;
		c.beginPath();
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.arc(cx, cy, t.r, t.ar, t.al, true);
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.stroke();

		c.strokeStyle = cStep;
		c.beginPath();
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.arc(cx, cy, s.r, s.ar, s.al, true);
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.stroke();

		const p = cart(this.a, this.r);
		const { a, r } = displace(this, [sprite.hotspot], sprite.flip);
		const h = cart(a, r);
		c.strokeStyle = cHotspot;
		c.beginPath();
		c.strokeRect(cx + h.x - 4, cy + h.y - 4, 9, 9);
		c.moveTo(cx + h.x, cy + h.y);
		c.lineTo(cx + p.x, cy + p.y);
		c.stroke();
	}

	getHitbox(): Hitbox {
		const { r, a, va, vr, w, h, steph, tscale } = this;
		const baw = scalew(w, r),
			taw = scalew(w, r + h),
			saw = scalew(w, r + steph);
		var amod: number,
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
				r: r + h + vtr,
				aw: taw,
				al: amod - taw,
				ar: amod + taw,
			},
			s: {
				r: r + steph + vtr,
				aw: saw,
				al: amod - saw,
				ar: amod + saw,
			},
		};
	}

	hurt(by: Damageable, damage: number): void {
		this.invincible = true;
		this.invtimer = 1000;

		// TODO: is this working?
		const dv = dirv(this, by);
		this.va += dv.a * 5;
		this.vr += dv.r * 5;

		this.game.fire(ePlayerHurt, { by, damage });
		this.voice.play(this.hurtSound);
		this.sprite.hurt();
	}

	hurtTimer(t: number): void {
		this.invtimer -= t;
		if (this.invtimer <= 0) this.invincible = false;
	}

	die(): void {
		this.game.fire(ePlayerDying);
		this.voice.play(this.deadSound);
		this.sprite.die();
	}

	finishdeath(): void {
		this.game.fire(ePlayerDied);
		this.game.remove(this);
	}
}
