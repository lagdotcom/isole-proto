const kLeft = 'ArrowLeft';
const kRight = 'ArrowRight';
const kJump = 'ArrowUp';

const gGroundWalk = 0.2;
const gGroundFriction = 0.85;
const gAirWalk = 0.01;
const gJumpStrength = 0.6;
var G;

function atan2(y, x) {
	var base = Math.atan2(y, x);
	if (base < 0) base += Math.PI * 2;
	return base;
}

function Gravity(game) {
	this.game = game;

	this.x = game.cx;
	this.y = game.cy;
	this.strength = 0.03;
}

Gravity.prototype.update = function() {
	// body...
};

Gravity.prototype.draw = function() {
	const { x, y, strength } = this;

	c.fillStyle = '#ffff00';
	c.beginPath();
	c.arc(x, y, strength * 300, 0, Math.PI * 2);
	c.fill();
};

function Floor(game, height, angle, width) {
	this.game = game;
	this.height = height;
	this.angle = (Math.PI * 2 * angle) / 360;
	this.width = (Math.PI * 2 * width) / 360 / 2;
}

Floor.prototype.update = function() {
	const { height, angle, width } = this;
	const { cx, cy } = this.game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.arc(cx, cy, height, angle - width, angle + width);
	c.stroke();
};

Floor.prototype.draw = function(c) {};

function Player(game) {
	this.game = game;

	this.w = 10;
	this.h = 20;
	this.x = game.cx / 2;
	this.y = 50;
	this.vx = 0;
	this.vy = 0;
	this.jumpt = 0;

	this.del = document.createElement('div');
	document.body.appendChild(this.del);
}

Player.prototype.update = function(t) {
	var { x, y, vx, vy, game, floor } = this;
	const { floors, gravity, keys } = game;

	const dx = x - gravity.x,
		dy = y - gravity.y,
		angle = atan2(dy, dx),
		dist = Math.sqrt(dx * dx + dy * dy);

	var hit = null;
	floors.forEach((f, i) => {
		if (hit) return;

		var da = Math.abs(angle - f.angle),
			dd = Math.abs(dist - f.height);

		if (dd < 5 && da < f.width) hit = f;
	});

	this.jumpt -= t;
	this.motion = { dx, dy, angle, dist };

	if (hit && this.jumpt <= 0) {
		this.grounded = true;

		const fx = gravity.x + Math.cos(angle) * hit.height,
			fy = gravity.y + Math.sin(angle) * hit.height;

		x = fx;
		y = fy;

		if (this.floor != hit) {
			vx = 0;
			vy = 0;
			this.floor = hit;
		} else {
			vx *= gGroundFriction;
			vy *= gGroundFriction;
		}
	} else {
		this.grounded = false;
		this.floor = null;

		if (gravity.x > this.x) vx += gravity.strength;
		else if (gravity.x < this.x) vx -= gravity.strength;

		if (gravity.y > this.y) vy += gravity.strength;
		else if (gravity.y < this.y) vy -= gravity.strength;
	}

	var controls = [];
	if (keys[kLeft]) {
		const lang = angle - Math.PI / 2,
			strength = hit ? gGroundWalk : gAirWalk;
		vx += Math.cos(lang) * strength;
		vy += Math.sin(lang) * strength;
		controls.push('left');
	} else if (keys[kRight]) {
		const rang = angle + Math.PI / 2,
			strength = hit ? gGroundWalk : gAirWalk;
		vx += Math.cos(rang) * strength;
		vy += Math.sin(rang) * strength;
		controls.push('right');
	}

	if (keys[kJump] && hit) {
		vx += Math.cos(angle) * gJumpStrength;
		vy += Math.sin(angle) * gJumpStrength;
		this.jumpt = 150;
		controls.push('jump');
	}

	this.vx = vx;
	this.vy = vy;
	this.x = x + vx;
	this.y = y + vy;

	this.del.innerHTML = `controls:${controls.join(' ')}<br>flag: ${
		this.jumpt > 0 ? 'jump' : ''
	} ${this.grounded ? 'ground' : ''}<br>vel: ${vx.toFixed(2)},${vy.toFixed(
		2
	)}<br>`;
};

Player.prototype.draw = function(c) {
	const { x, y, w, h, vx, vy, game } = this;
	const { angle, dist } = this.motion;
	const normal = angle + Math.PI / 2;

	c.fillStyle = '#ff0000';
	c.translate(x, y);
	c.rotate(normal);
	c.fillRect(-w / 2, -h, w, h);
	c.rotate(-normal);
	c.translate(-x, -y);

	const mx = Math.cos(angle) * dist,
		my = Math.sin(angle) * dist;

	c.strokeStyle = '#880000';
	c.beginPath();
	c.moveTo(game.cx, game.cy);
	c.lineTo(game.cx + mx, game.cy + my);
	c.stroke();

	c.strokeStyle = '#880088';
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(x + vx * 10, y + vy * 10);
	c.stroke();
};

function Game(options) {
	this.running = false;
	this.options = options;
	this.cx = options.width / 2;
	this.cy = options.height / 2;
	this.keys = {};

	this.canvas = this.makeCanvas();
	this.context = this.canvas.getContext('2d');

	this.floors = [];
	this.floors.push(new Floor(this, 80, 270, 40));
	this.floors.push(new Floor(this, 100, 90, 80));
	this.floors.push(new Floor(this, 15, 0, 360));

	this.gravity = new Gravity(this);
	this.player = new Player(this);

	this.components = this.floors.concat([this.gravity, this.player]);

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
	G = new Game({ width: 640, height: 480, showFps: true });
	window.G = G;

	G.start();
});

window.addEventListener('keydown', e => {
	G.press(e.code);
});

window.addEventListener('keyup', e => {
	G.release(e.code);
});
