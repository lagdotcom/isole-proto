const kLeft = 'ArrowLeft';
const kRight = 'ArrowRight';
const kJump = 'ArrowUp';

const gGroundWalk = 9;
const gGroundFriction = 0.8;
const gAirWalk = 0.004;
const gJumpStrength = 3;
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

function Floor(game, height, angle, width) {
	this.game = game;
	this.r = height;
	this.a = (pi2 * angle) / 360;
	this.width = (pi2 * width) / 360 / 2;
}

Floor.prototype.update = function() {
	const { r, a, width } = this;
	const { cx, cy } = this.game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.arc(cx, cy, r, a - width, a + width);
	c.stroke();
};

Floor.prototype.draw = function(c) {};

function Player(game, spriteId) {
	this.game = game;

	this.w = 10;
	this.h = 20;
	this.a = 0;
	this.r = 100;
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
		n: 80,
		rx: 8,
	};

	this.del = document.createElement('div');
	document.body.appendChild(this.del);
}

Player.prototype.update = function(t) {
	var { a, r, va, vr, jumpt, game, floor } = this;
	const { floors, keys } = game;
	var floordata = '';

	var hit = null;
	floors.forEach((f, i) => {
		var da = angledist(a, f.a),
			dd = Math.abs(r - f.r);

		floordata += `floor${i}: da=${da.toFixed(2)} dd=${dd.toFixed(2)}<br>`;

		if (dd < 5 && da < f.width) hit = f;
	});

	this.jumpt -= t;

	if (hit && this.jumpt <= 0) {
		this.grounded = true;

		r = hit.r;
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

	if (keys[kJump] && hit) {
		vr += gJumpStrength;
		this.jumpt = 150;
		controls.push('jump');
	}

	if (va > gMaxVA) va = gMaxVA;
	else if (va < -gMaxVA) va = -gMaxVA;

	this.va = va;
	this.vr = vr;
	a += (va / r) * gWalkScale;
	r += vr;

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
		this.sprite.m += t;
		if (this.sprite.m > this.sprite.n) {
			this.sprite.m -= this.sprite.n;
			this.sprite.r++;
			if (this.sprite.r >= this.sprite.rx) this.sprite.r = 0;
		}
	}

	this.del.innerHTML = `controls: ${controls.join(' ')}<br>flag: ${
		this.jumpt > 0 ? 'jump' : ''
	} ${this.grounded ? 'ground' : ''}<br>vel: ${vr.toFixed(2)},${va.toFixed(
		2
	)}<br>pos: ${r.toFixed(2)},${a.toFixed(2)}<hr>${floordata}`;
};

Player.prototype.draw = function(c) {
	const { a, r, va, vr, w, h, game, sprite } = this;
	const { cx, cy } = game;
	const normal = a + piHalf;

	var x = Math.cos(a) * r,
		y = Math.sin(a) * r;

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
	this.context.scale(scale, scale);

	this.floors = [];
	this.floors.push(new Floor(this, 80, 270, 90));
	this.floors.push(new Floor(this, 100, 90, 135));
	this.floors.push(new Floor(this, 15, 0, 360));

	this.player = new Player(this, 'pspr');

	this.components = this.floors.concat([this.player]);

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

Game.prototype.start = function() {
	this.running = true;

	requestAnimationFrame(this.next);
};

Game.prototype.next = function(t) {
	const { width, height, showFps } = this.options;
	const step = t - this.time;
	c = this.context;

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
	G = new Game({ width: 1024, height: 768, scale: 2, showFps: true });
	window.G = G;

	G.start();
});

window.addEventListener('keydown', e => {
	G.press(e.code);
});

window.addEventListener('keyup', e => {
	G.release(e.code);
});
