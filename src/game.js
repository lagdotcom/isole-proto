const kLeft = 'ArrowLeft';
const kRight = 'ArrowRight';
const kJump = 'ArrowUp';

const gTimeScale = 10,
	gHitboxScale = 0.2,
	gGroundWalk = 9,
	gGroundFriction = 0.8,
	gAirWalk = 0.01,
	gJumpStrength = 5,
	gJumpTimer = 8,
	gGravityStrength = 0.2,
	gWalkScale = 10,
	gMaxVA = 0.3,
	gStandThreshold = 0.005,
	gWallGap = 5,
	gWallBounce = -0.01,
	pi = Math.PI,
	pi2 = pi * 2,
	piHalf = pi / 2;
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
	return (w / r) * gHitboxScale;
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

function Wall(game, t, b, angle, direction) {
	const a = anglewrap((pi2 * angle) / 360),
		top = t - gWallGap,
		bottom = b + gWallGap,
		start = cart(a, top),
		end = cart(a, bottom);

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
	this.tscale = 0;

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
	var { a, r, va, vr, game } = this;
	const { walls, ceilings, floors, keys } = game,
		tscale = time / gTimeScale;
	this.tscale = tscale;
	const { b, t } = this.getHitbox();
	var debug = '',
		flags = [];

	var wall = null;
	if (Math.abs(va) > gStandThreshold) {
		flags.push('sideways');
		const vas = Math.sign(va);
		walls.forEach(w => {
			if (vas != w.direction) return;

			if (b.al <= w.a && b.ar >= w.a && t.r >= w.bottom && b.r <= w.top)
				wall = w;
		});
	}

	var floor = null;
	if (vr <= 0) {
		flags.push('down');
		floors.forEach((f, i) => {
			var da = angledist(a, f.a);

			debug += `f${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}°<br>`;

			if (b.r <= f.r && t.r >= f.r && da < f.width + b.aw) floor = f;
		});
	}

	var ceiling = null;
	if (vr > 0) {
		flags.push('up');
		ceilings.forEach((f, i) => {
			var da = angledist(a, f.a);

			debug += `c${i}: r=${f.r.toFixed(2)}, da=${da.toFixed(2)}°<br>`;

			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) ceiling = f;
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

	if (wall && !ceiling) {
		flags.push('wall');
		va = wall.direction * gWallBounce;
		if (wall.direction == 1) a = wall.a - b.aw;
		else a = wall.a + b.aw;
	} else if (va > gMaxVA) va = gMaxVA;
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
		`flags: ${flags.join(' ')}`,
		`vel: ${vr.toFixed(2)},${va.toFixed(2)}°`,
		`pos: ${r.toFixed(2)},${a.toFixed(2)}°`,
		`hb: baw=${b.aw.toFixed(2)}`,
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
	const { r, a, va, vr, w, h, tscale } = this;
	const baw = scalew(w, r),
		taw = scalew(w, r + h);
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
