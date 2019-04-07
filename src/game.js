const kLeft = 'ArrowLeft';
const kRight = 'ArrowRight';
const kJump = 'ArrowUp';

const gTimeScale = 10;
const gGroundWalk = 9;
const gGroundFriction = 0.8;
const gAirWalk = 0.01;
const gJumpStrength = 5;
const gJumpTimer = 8;
const gGravityStrength = 0.2;
const gWalkScale = 10;
const gMaxVA = 0.3;
const gStandThreshold = 0.005;
const pi = Math.PI;
const pi2 = pi * 2;
const piHalf = pi / 2;
var G;

function anglewrap(a) {
	a = a % pi2;
	if (a < 0) a += pi2;
	return a;
}

function angledist(a, b) {
	var d = a - b;
	if (d > pi) d -= pi2;
	else if (d < -pi) d += pi2;
	return Math.abs(d);
}

function alla() {
	var a = [];
	for (var i = 0; i < arguments.length; i++) a = a.concat(arguments[i]);

	return a;
}

function jbr() {
	var s = '';
	for (var i = 0; i < arguments.length; i++) {
		if (i) s += '<br>';
		s += arguments[i];
	}

	return s;
}

function cart(a, r) {
	return {
		x: Math.cos(a) * r,
		y: Math.sin(a) * r,
	};
}

function scalew(w, r) {
	return (w / r) * 0.2;
}

function Flat(game, height, angle, width) {
	Object.assign(this, {
		game,
		r: height,
		a: (pi2 * angle) / 360,
		width: (pi2 * width) / 360 / 2,
	});
}

Flat.prototype.update = function() {};

Flat.prototype.draw = function(c) {
	const { r, a, width } = this;
	const { cx, cy } = this.game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.arc(cx, cy, r, a - width, a + width);
	c.stroke();
};

function Wall(game, top, bottom, angle, direction) {
	const a = (pi2 * angle) / 360;
	const start = cart(a, top);
	const end = cart(a, bottom);

	Object.assign(this, {
		game,
		top,
		bottom,
		a,
		direction,
		sx: start.x,
		sy: start.y,
		ex: end.x,
		ey: end.y,
	});
}

Wall.prototype.update = function() {};

Wall.prototype.draw = function(c) {
	const { game, sx, sy, ex, ey } = this;
	const { cx, cy } = game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.moveTo(sx + cx, sy + cy);
	c.lineTo(ex + cx, ey + cy);
	c.stroke();
};

function Player(game, spriteId) {
	this.game = game;

	this.w = 56;
	this.h = 30;
	this.a = piHalf * 3;
	this.r = 200;
	this.va = 0;
	this.vr = 0;
	this.jumpt = 0;

	this.sprite = {
		img: document.getElementById(spriteId),
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
	var { a, h, r, va, vr, game } = this;
	const { ceilings, floors, keys } = game,
		tscale = time / gTimeScale;
	var debug = '',
		flags = [];

	var floor = null;
	if (vr <= 0) {
		floors.forEach((f, i) => {
			var da = angledist(a, f.a),
				dd = Math.abs(r - f.r);

			debug += `fl${i}: da=${da.toFixed(2)} dd=${dd.toFixed(2)}<br>`;

			if (dd < 5 && da < f.width) floor = f;
		});
	}

	var ceiling = null;
	if (vr > 0) {
		ceilings.forEach((f, i) => {
			var da = angledist(a, f.a),
				dd = Math.abs(r + h - f.r);

			debug += `ce${i}: da=${da.toFixed(2)} dd=${dd.toFixed(2)}<br>`;

			if (dd < 5 && da < f.width) ceiling = f;
		});
		if (ceiling) {
			flags.push('ceiling');
			vr = 0;
		}
	}

	this.jumpt -= tscale;

	if (floor && this.jumpt <= 0) {
		this.grounded = true;

		r = floor.r;
		vr = 0;
		va *= gGroundFriction;
	} else {
		this.grounded = false;
		this.floor = null;

		vr -= gGravityStrength;
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

	if (va > gMaxVA) va = gMaxVA;
	else if (va < -gMaxVA) va = -gMaxVA;

	this.va = va;
	this.vr = vr;
	a += (va / r) * tscale * gWalkScale;
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
		`flag: ${flags.join(' ')}`,
		`vel: ${vr.toFixed(2)},${va.toFixed(2)}`,
		`pos: ${r.toFixed(2)},${a.toFixed(2)}`,
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
	const { b, t } = this.getHitbox();

	c.strokeStyle = '#ffff00';
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();
};

Player.prototype.getHitbox = function() {
	const { r, a, w, h } = this;
	const baw = scalew(w, r),
		taw = scalew(w, r + h);

	return {
		b: {
			r,
			al: a - baw,
			ar: a + baw,
		},
		t: {
			r: r + h,
			al: a - taw,
			ar: a + taw,
		},
	};
};

function Game(options) {
	const { width, height, scale } = options;

	this.running = false;
	this.options = options;
	this.cx = width / 2 / scale;
	this.cy = height / 2 / scale;
	this.keys = {};

	this.canvas = this.makeCanvas();
	this.context = this.canvas.getContext('2d');
	this.context.imageSmoothingEnabled = false;
	this.context.scale(scale, scale);

	this.floors = [];
	this.ceilings = [];
	this.walls = [];

	var th = 45;
	this.addPlatform(th * 5, 225, 60, th);
	this.addPlatform(th * 5, 45, 240, th);
	this.addPlatform(th * 3, 135, 320, th);
	this.walls.push(new Wall(this, th * 4, th * 3, 350, 1));
	this.walls.push(new Wall(this, th * 4, th * 3, 10, -1));
	this.floors.push(new Flat(this, th, 0, 360));

	this.player = new Player(this, 'pspr');

	this.components = alla(this.floors, this.ceilings, this.walls, [
		this.player,
	]);

	this.time = 0;
	this.next = this.next.bind(this);
}

Game.prototype.makeCanvas = function() {
	const { width, height } = this.options;
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	document.body.appendChild(canvas);
	return canvas;
};

Game.prototype.addPlatform = function(h, angle, width, th) {
	this.floors.push(new Flat(this, h, angle, width));
	this.ceilings.push(new Flat(this, h - th, angle, width));
	this.walls.push(new Wall(this, h, h - th, angle - width / 2, 1));
	this.walls.push(new Wall(this, h, h - th, angle + width / 2, -1));
};

Game.prototype.start = function() {
	this.running = true;

	requestAnimationFrame(this.next);
};

Game.prototype.next = function(t) {
	const { width, height, showFps } = this.options;
	const step = t - this.time;
	var c = this.context;

	c.fillStyle = '#000000';
	c.fillRect(0, 0, width, height);

	if (showFps) {
		c.fillStyle = '#ffffff';
		c.fillText(Math.floor(1000 / step) + 'fps', 10, 10);
	}

	this.components.forEach(co => co.update(step));
	this.components.forEach(co => co.draw(c));

	this.time = t;
	if (this.running) requestAnimationFrame(this.next);
};

Game.prototype.press = function(key) {
	this.keys[key] = true;
};

Game.prototype.release = function(key) {
	this.keys[key] = false;
};

window.addEventListener('load', () => {
	G = new Game({
		width: 1024,
		height: 768,
		scale: 1,
		showFps: true,
		showHitboxes: true,
	});
	window.G = G;

	G.start();
});

window.addEventListener('keydown', e => {
	G.press(e.code);
});

window.addEventListener('keyup', e => {
	G.release(e.code);
});
