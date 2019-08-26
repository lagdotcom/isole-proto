import { cHurt, cStep, cHotspot } from '../colours';
import { dLeft, dRight } from '../dirs';
import { ePlayerDied, ePlayerHurt } from '../events';
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
} from '../tools';
import mel from '../makeElement';
import WoodyController from '../spr/woody';
import { zPlayer } from '../layers';
import Channel from '../Channel';

const gJumpAffectStrength = 0.15,
	gJumpAffectTimer = -10,
	gJumpDoubleTimer = -10,
	gJumpStrength = 4,
	gJumpTimer = 8;

export default function Player(game, options = {}) {
	Object.assign(
		this,
		{
			body: new Channel(game, 'Woody Body'),
			voice: new Channel(game, 'Woody Voice'),
			isPlayer: true,
			layer: zPlayer,
			game,
			name: 'Woody',
			w: 30,
			h: 34,
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
			sprite: new WoodyController(
				this,
				game.resources[options.img || 'player.woody']
			),
			alive: true,
			health: 5,
		},
		options
	);

	this.a = deg2rad(this.a);

	if (game.options.showDebug) {
		this.del = mel(game.options.debugContainer, 'div', {
			className: 'debug debug-player',
		});
	}
}

Player.prototype.update = function(time) {
	var { a, r, va, vr, vfa, game, sprite, jumpd, jumplg } = this;
	const { walls, ceilings, floors, keys, enemies } = game,
		tscale = time / gTimeScale;
	this.tscale = tscale;
	const { b, t, s } = this.getHitbox();
	var debug = '',
		flags = [];

	var floor = null;
	if (vr <= 0) {
		flags.push('down');
		floors.forEach((f, i) => {
			var da = angledist(a, f.a);

			debug += `f${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}r<br>`;

			if (b.r <= f.r && s.r >= f.r && da < f.width + s.aw) floor = f;
		});
	}

	var ceiling = null;
	if (vr > 0) {
		flags.push('up');
		ceilings.forEach((f, i) => {
			var da = angledist(a, f.a);

			debug += `c${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}r<br>`;

			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) ceiling = f;
		});
		if (ceiling) {
			flags.push('ceiling');
			if (vr > 0) this.body.play('player.bonk');
			vr = 0;
		}
	}

	var wall = null;
	if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
		flags.push('sideways');
		const vas = Math.sign(va + vfa);
		walls.forEach(w => {
			if (vas != w.direction && !w.motion) return;

			if (b.al <= w.a && b.ar >= w.a && t.r >= w.bottom && b.r <= w.top)
				wall = w;
		});
	}

	var hurtenemy = null;
	if (vr < 0) {
		enemies.forEach((e, i) => {
			if (collides({ b, t: s }, e.getHitbox())) {
				debug += `jumped on e${i}: ${e.name}<br>`;
				hurtenemy = e;
			}
		});
	}

	var hitenemy = null;
	enemies.forEach((e, i) => {
		if (e !== hurtenemy && collides({ b, t }, e.getHitbox())) {
			debug += `hit by e${i}: ${e.name}<br>`;
			hitenemy = e;
		}
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

	var controls = [],
		strength = this.grounded ? gGroundWalk : gAirWalk;
	if (keys[kLeft]) {
		va -= strength;
		controls.push('left');

		if (!sprite.flags.preventTurn) {
			sprite.face(-1, this.grounded);
			this.facing = dLeft;
		}
	} else if (keys[kRight]) {
		va += strength;
		controls.push('right');

		if (!sprite.flags.preventTurn) {
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

	if (game.options.showDebug)
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
};

Player.prototype.draw = function(c) {
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
};

Player.prototype.drawHitbox = function(c) {
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
};

Player.prototype.getHitbox = function() {
	const { r, a, va, vr, w, h, steph, tscale } = this;
	const baw = scalew(w, r),
		taw = scalew(w, r + h),
		saw = scalew(w, r + steph);
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
};

Player.prototype.hurt = function(by, damage) {
	this.invincible = true;
	this.invtimer = 1000;

	// TODO: is this working?
	const dv = dirv(this, by);
	this.va += dv.a * 5;
	this.vr += dv.r * 5;

	this.game.fire(ePlayerHurt, { by, damage });
	this.voice.play('woody.hurt');
};

Player.prototype.hurtTimer = function(t) {
	this.invtimer -= t;
	if (this.invtimer <= 0) this.invincible = false;
};

Player.prototype.die = function() {
	this.game.fire(ePlayerDied);
	this.voice.play('player.dead');
	this.game.remove(this);
};
