import { kLeft, kRight, kJump } from './keys';
import {
	gAirWalk,
	gGravityStrength,
	gStandThreshold,
	gGroundFriction,
	gGroundWalk,
	gJumpStrength,
	gJumpTimer,
	gTimeScale,
	gWallBounce,
	gWalkScale,
	gMaxVA,
} from './nums';
import { angledist, anglewrap, cart, jbr, pi, piHalf, scalew } from './tools';

export default function Player(game, img) {
	Object.assign(this, {
		game,
		w: 56,
		h: 30,
		steph: 10,
		a: piHalf * 3,
		r: 200,
		va: 0,
		vr: 0,
		vfa: 0,
		vfr: 0,
		jumpt: 0,
		tscale: 0,
		del: document.createElement('div'),
	});

	this.sprite = {
		img,
		w: 56,
		h: 48,
		c: Math.floor(Math.random() * 2),
		r: 0,
		xo: -28,
		yo: -39,
		xs: -1,
		ys: 1,
		m: 0,
		n: 8,
		rx: 8,
	};

	this.del = document.createElement('div');
	document.body.appendChild(this.del);
}

Player.prototype.update = function(time) {
	var { a, r, va, vr, vfa, game } = this;
	const { walls, ceilings, floors, keys } = game,
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

			debug += `f${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}πr<br>`;

			if (b.r <= f.r && s.r >= f.r && da < f.width + s.aw) floor = f;
		});
	}

	var ceiling = null;
	if (vr > 0) {
		flags.push('up');
		ceilings.forEach((f, i) => {
			var da = angledist(a, f.a);

			debug += `c${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}πr<br>`;

			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) ceiling = f;
		});
		if (ceiling) {
			flags.push('ceiling');
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

	this.jumpt -= tscale;

	if (floor && this.jumpt <= 0) {
		this.grounded = true;

		r = floor.r;
		vr = 0;
		va *= gGroundFriction;
		vfa = floor.motion * time;
	} else {
		this.grounded = false;
		this.floor = null;

		vr -= gGravityStrength;
		vfa = 0;
	}

	var controls = [];
	var strength = this.grounded ? gGroundWalk : gAirWalk;
	if (keys[kLeft]) {
		va -= strength;
		controls.push('left');
		this.sprite.xs = -1;
	} else if (keys[kRight]) {
		va += strength;
		controls.push('right');
		this.sprite.xs = 1;
	}

	if (keys[kJump] && floor) {
		vr += gJumpStrength;
		this.jumpt = gJumpTimer;
		controls.push('jump');
	}

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
		r -= r;
		a += pi;
	}

	this.a = anglewrap(a);
	this.r = r;

	if (!this.grounded) {
		if (this.sprite.r == 0 || this.sprite.r == 4) this.sprite.r++;
	} else if (Math.abs(va) < gStandThreshold) {
		this.sprite.r = 0;
	} else {
		this.sprite.m += tscale;
		if (this.sprite.m > this.sprite.n) {
			this.sprite.m -= this.sprite.n;
			this.sprite.r++;
			if (this.sprite.r >= this.sprite.rx) this.sprite.r = 0;
		}
	}

	if (this.jumpt > 0) flags.push('jump');
	if (this.grounded) flags.push('grounded');

	this.del.innerHTML = jbr(
		`controls: ${controls.join(' ')}`,
		`flags: ${flags.join(' ')}`,
		`vel: ${vr.toFixed(2)},${va.toFixed(2)}πr`,
		`pos: ${r.toFixed(2)},${a.toFixed(2)}πr`,
		debug
	);
};

Player.prototype.draw = function(c) {
	const { a, r, game, sprite } = this;
	const { cx, cy } = game;
	const normal = a + piHalf;

	const { x, y } = cart(a, r);

	c.translate(x + cx, y + cy);
	c.rotate(normal);

	const sx = sprite.w * sprite.c,
		sy = sprite.h * sprite.r;
	c.scale(sprite.xs, sprite.ys);
	c.drawImage(
		sprite.img,
		sx,
		sy,
		sprite.w,
		sprite.h,
		sprite.xo,
		sprite.yo,
		sprite.w,
		sprite.h
	);
	c.scale(sprite.xs, sprite.ys);

	c.rotate(-normal);
	c.translate(-x - cx, -y - cy);

	if (game.options.showHitboxes) this.drawHitbox(c);
};

Player.prototype.drawHitbox = function(c) {
	const { game } = this;
	const { cx, cy } = game;
	const { b, t, s } = this.getHitbox();

	c.strokeStyle = '#ffff00';
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();

	c.strokeStyle = '#ff0000';
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, s.r, s.ar, s.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
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
