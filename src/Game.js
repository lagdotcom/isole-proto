import Buster from './enemy/Buster';
import Flat from './component/Flat';
import Inventory from './component/Inventory';
import Krillna from './enemy/Krillna';
import Player from './component/Player';
import Wall from './component/Wall';
import { eGameBegin, eGameReady } from './events';
import { kLeft, kRight, kJump, kThrow, kSwing } from './keys';
import { any, mediatag, min, pi, piHalf } from './tools';
import { gMaxTimeStep, gPadAxisThreshold } from './nums';
import mel from './makeElement';
import dispatch from './dispatchEvent';
import addResources from './resources';

export default function Game(options) {
	const { parent, width, height, scale, smoothing } = options;

	this.running = false;
	this.options = options;
	this.cx = width / 2 / scale;
	this.cy = height / 2 / scale;
	this.keys = {};
	this.pads = [];

	this.element = this.makeCanvas(parent || document.body);
	this.context = this.element.getContext('2d');
	this.context.imageSmoothingEnabled = smoothing || false;
	this.context.scale(scale, scale);

	this.time = 0;
	this.start = this.start.bind(this);
	this.next = this.next.bind(this);

	this.loaded = 0;
	this.loading = 0;
	this.resources = [];
	this.materials = {};
	this.textures = {};
	this.objects = {};
	addResources(this);
}

Game.prototype.require = function(key, typ, src) {
	const me = this;

	this.loading++;
	this.resources[key] = typ(src, () => {
		me.loaded++;
	});
};

Game.prototype.begin = function() {
	this.floors = [];
	this.ceilings = [];
	this.walls = [];
	this.enemies = [];
	this.redraw = true;

	this.fire(eGameBegin);
	this.fire(eGameReady);
	this.ready();
};

Game.prototype.fire = function(event, detail) {
	dispatch(this.element, event, detail);
};

Game.prototype.on = function(event, handler) {
	this.element.addEventListener(event, handler);
};

Game.prototype.off = function(event, handler) {
	this.element.removeEventListener(event, handler);
};

Game.prototype.ready = function() {
	this.components.forEach(co => {
		co.attachments &&
			co.attachments.forEach(a => {
				this.components.push(a);
			});
	});
};

Game.prototype.makeCanvas = function(parent) {
	const { width, height } = this.options;
	return mel(parent, 'canvas', { width, height });
};

Game.prototype.addPlatform = function({
	h,
	a,
	w,
	th,
	motion = 0,
	material = null,
	texX = 0,
	texY = 0,
}) {
	var floor = new Flat(this, h, a, w, motion, material, texX, texY),
		ceiling = new Flat(this, h - th, a, w, motion),
		left = new Wall(this, h, h - th, a - w / 2, 1, motion),
		right = new Wall(this, h, h - th, a + w / 2, -1, motion);

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
	if (this.loaded < this.loading) {
		this.showLoadScreen();
		requestAnimationFrame(this.start);
		return;
	}

	this.inventory = new Inventory(this);
	if (!this.player) this.begin();

	this.running = true;
	requestAnimationFrame(this.next);
};

Game.prototype.showLoadScreen = function() {
	const { width, height } = this.options;
	const { loaded, loading } = this;
	var c = this.context;

	c.fillStyle = '#000000';
	c.fillRect(0, 0, width, height);

	c.fillStyle = '#ffffff';
	c.font = '40px sans-serif';
	c.fillText(`Loading: ${loaded} / ${loading}`, 100, 100);
};

Game.prototype.next = function(t) {
	const { width, height, showFps, showHitboxes } = this.options;
	const step = min(t - this.time, gMaxTimeStep);
	var c = this.context;

	c.fillStyle = '#000000';
	c.fillRect(0, 0, width, height);

	if (this.pads.length) this.readGamepads();

	this.components.forEach(co => co.update && co.update(step));

	if (this.redraw) {
		this.redraw = false;
		this.drawn = this.components
			.filter(co => co.draw)
			.sort((a, b) => a.layer - b.layer);
	}

	this.drawn.forEach(co => co.draw(c));

	if (showHitboxes) {
		c.beginPath();
		c.rect(0, 0, width, height);
		c.fillStyle = 'rgba(0,0,0,0.5)';
		c.fill();

		this.components.forEach(co => co.drawHitbox && co.drawHitbox(c));
	}

	if (showFps) {
		c.fillStyle = '#ffffff';
		c.font = '12px monospace';
		c.fillText(Math.floor(1000 / step) + 'fps', width - 40, 10);
	}

	this.time = t;
	if (this.running) requestAnimationFrame(this.next);
};

Game.prototype.addPad = function(pad) {
	if (pad.buttons.length < 2) {
		console.log(`Cannot use pad ${pad.id} - not enough buttons.`);
		return;
	}

	console.log(`Added pad ${pad.id}.`);
	this.pads.push(pad);
};

Game.prototype.removePad = function(pad) {
	if (any(this.pads, p => p.id === pad.id)) {
		console.log(`No longer listening to pad ${pad.id}.`);
		this.pads = this.pads.filter(p => p.id !== pad.id);
	}
};

Game.prototype.readGamepads = function() {
	const pads = navigator.getGamepads();
	this.pads.forEach(p => {
		const pad = pads[p.index];

		const buttons = pad.buttons;
		const axes = pad.axes;

		// TODO: configuration
		this.keys[kLeft] = axes[0] < -gPadAxisThreshold;
		this.keys[kRight] = axes[0] > gPadAxisThreshold;
		this.keys[kJump] = buttons[0].pressed;
		this.keys[kThrow] = buttons[1].pressed;
		this.keys[kSwing] = buttons[2].pressed;
	});
};

Game.prototype.press = function(key) {
	this.keys[key] = true;
};

Game.prototype.release = function(key) {
	this.keys[key] = false;
};

Game.prototype.remove = function(component) {
	const match = c => c != component;

	this.components = this.components.filter(match);

	if (component.isEnemy) this.enemies = this.enemies.filter(match);

	this.drawn = this.drawn.filter(match);
};
