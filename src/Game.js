import Buster from './enemy/Buster';
import Flat from './Flat';
import Krillna from './enemy/Krillna';
import Player from './Player';
import Wall from './Wall';
import { alla, min } from './tools';
import { gMaxTimeStep } from './nums';

import busterImg from '../media/buster.png';
import grassImg from '../media/tilesheet_grass.png';
import krillnaImg from '../media/krillna.png';
import playerImg from '../media/woody.png';

export default function Game(options) {
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

	this.time = 0;
	this.start = this.start.bind(this);
	this.next = this.next.bind(this);

	this.loading = 0;
	this.resources = [];
	this.require('player', playerImg);
	this.require('krillna', krillnaImg);
	this.require('buster', busterImg);
	this.require('grass', grassImg);
}

Game.prototype.require = function(key, src) {
	const me = this;
	var el = document.createElement('img');
	el.onload = () => {
		me.loading--;
	};
	el.src = src;

	this.resources[key] = el;
	this.loading++;
};

Game.prototype.begin = function() {
	this.floors = [];
	this.ceilings = [];
	this.walls = [];
	this.enemies = [];

	var th = 50;
	var rs = 0.04;
	this.addPlatform(th * 5, 225, 60, 32, rs, 'grass');
	this.addPlatform(th * 5, 45, 240, 32, rs, 'grass');
	this.addPlatform(th * 3, 135, 320, 32, -rs, 'grass');
	this.walls.push(new Wall(this, 218, th * 3, 350, 1, 0, 'grass'));
	this.walls.push(new Wall(this, 218, th * 3, 10, -1, 0, 'grass', 2));
	this.floors.push(new Flat(this, th, 0, 360, 0, 'grass', 7));

	this.player = new Player(this, this.resources.player);
	this.enemies.push(new Krillna(this, this.resources.krillna));
	this.enemies.push(
		new Krillna(this, this.resources.krillna, {
			a: Math.PI,
			r: 300,
			dir: 'L',
		})
	);
	this.enemies.push(new Buster(this, this.resources.buster));

	this.components = alla(
		this.floors,
		this.ceilings,
		this.walls,
		this.enemies,
		[this.player]
	);

	this.wallsInMotion = true; // TODO
};

Game.prototype.makeCanvas = function() {
	const { width, height } = this.options;
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	document.body.appendChild(canvas);
	return canvas;
};

Game.prototype.addPlatform = function(
	h,
	angle,
	width,
	th,
	motion = 0,
	texture = null,
	texX = 0,
	texY = 0
) {
	var floor = new Flat(this, h, angle, width, motion, texture, texX, texY),
		ceiling = new Flat(this, h - th, angle, width, motion),
		left = new Wall(this, h, h - th, angle - width / 2, 1, motion),
		right = new Wall(this, h, h - th, angle + width / 2, -1, motion);

	floor.wleft = left;
	floor.wright = right;

	ceiling.wleft = left;
	ceiling.wright = right;

	left.ceiling = ceiling;
	left.floor = floor;

	right.ceiling = ceiling;
	right.floor = floor;

	this.floors.push(floor);
	this.ceilings.push(ceiling);
	this.walls.push(left);
	this.walls.push(right);
};

Game.prototype.start = function() {
	if (this.loading) {
		// TODO: show loading screen
		requestAnimationFrame(this.start);
		return;
	}

	if (!this.player) this.begin();

	this.running = true;
	requestAnimationFrame(this.next);
};

Game.prototype.next = function(t) {
	const { width, height, showFps } = this.options;
	const step = min(t - this.time, gMaxTimeStep);
	var c = this.context;

	c.fillStyle = '#000000';
	c.fillRect(0, 0, width, height);

	this.components.forEach(co => co.update(step));
	this.components.forEach(co => co.draw && co.draw(c));

	if (this.options.showHitboxes) {
		c.beginPath();
		c.rect(0, 0, width, height);
		c.fillStyle = 'rgba(0,0,0,0.5)';
		c.fill();

		this.components.forEach(co => co.drawHitbox && co.drawHitbox(c));
	}

	if (showFps) {
		c.fillStyle = '#ffffff';
		c.fillText(Math.floor(1000 / step) + 'fps', 10, 10);
	}

	this.time = t;
	if (this.running) requestAnimationFrame(this.next);
};

Game.prototype.press = function(key) {
	this.keys[key] = true;
};

Game.prototype.release = function(key) {
	this.keys[key] = false;
};
