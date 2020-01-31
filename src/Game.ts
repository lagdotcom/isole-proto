import Flat from './component/Flat';
import Inventory from './component/Inventory';
import Wall from './component/Wall';
import { eGameBegin, eGameReady } from './events';
import { kLeft, kRight, kJump, kThrow, kSwing } from './keys';
import { any, min } from './tools';
import { gMaxTimeStep, gPadAxisThreshold } from './nums';
import mel from './makeElement';
import dispatch from './dispatchEvent';
import addResources from './resources';
import Component from './Component';
import DrawnComponent from './DrawnComponent';
import Texture from './Texture';
import Decal from './component/Decal';
import Enemy from './Enemy';
import Player from './Player';
import Controller from './Controller';
import Material from './Material';
import Zoomer from './Zoomer';
import { zBeforeUI } from './layers';
import Platform, { PlatformInit } from './component/Platform';

interface GameInit {
	debugContainer?: HTMLElement;
	height: number;
	maxScale?: number;
	minScale?: number;
	zoomScale?: number;
	parent: HTMLElement;
	showDebug?: boolean;
	showFps?: boolean;
	showHitboxes?: boolean;
	smoothing?: boolean;
	width: number;
}

type ResourceLoader = (url: string, callback: () => void) => any;

class Unzoomer implements DrawnComponent {
	game: Game;
	layer: number;
	constructor(game: Game) {
		this.game = game;
		this.layer = zBeforeUI;
	}

	draw() {
		this.game.zoomer.reset();
	}
}

/** Neverseed */
export default class Game {
	ceilings: Flat[];
	components: Component[];
	context: CanvasRenderingContext2D;
	cx: number;
	cy: number;
	decals: Decal[];
	drawn: DrawnComponent[];
	element: HTMLCanvasElement;
	enemies: Enemy[];
	floors: Flat[];
	inventory: Inventory;
	keys: { [name: string]: boolean };
	loaded: number;
	loading: number;
	materials: { [name: string]: Material };
	objects: { [name: string]: Controller };
	options: GameInit;
	pads: Gamepad[];
	platforms: Platform[];
	player: Player;
	redraw: boolean;
	resources: { [name: string]: any };
	running: boolean;
	textures: { [name: string]: Texture };
	time: number;
	walls: Wall[];
	wallsInMotion: boolean;
	unzoomer: DrawnComponent;
	zoomer: Zoomer;

	/**
	 * Create a new Game instance
	 * @param {GameInit} options options
	 */
	constructor(options: GameInit) {
		const { parent, width, height, smoothing } = options;

		this.cx = width / 2;
		this.cy = height / 2;
		this.keys = {};
		this.loaded = 0;
		this.loading = 0;
		this.materials = {};
		this.objects = {};
		this.options = options;
		this.pads = [];
		this.resources = [];
		this.running = false;
		this.textures = {};
		this.time = 0;

		this.next = this.next.bind(this);
		this.start = this.start.bind(this);

		this.element = this.makeCanvas(parent || document.body);

		const context = this.element.getContext('2d');
		if (!context) throw Error('Could not initialize 2D context');

		this.context = context;
		this.context.imageSmoothingEnabled = smoothing || false;
		this.zoomer = new Zoomer(
			this,
			options.minScale || 0.5,
			options.maxScale || 1,
			options.zoomScale || 550
		);
		this.unzoomer = new Unzoomer(this);

		addResources(this);
	}

	/**
	 * Require a resource
	 * @param {string} key resource name
	 * @param {ResourceLoader} typ resource loader
	 * @param {string} src source URL
	 */
	require(key: string, typ: ResourceLoader, src: string): void {
		const me = this;
		this.loading++;
		this.resources[key] = typ(src, () => {
			me.loaded++;
		});
	}

	/**
	 * Prepare the game for starting
	 */
	begin(): void {
		this.platforms = [];
		this.floors = [];
		this.ceilings = [];
		this.walls = [];
		this.enemies = [];
		this.redraw = true;
		this.fire(eGameBegin);
		this.fire(eGameReady);
		this.ready();
	}

	/**
	 * Fire an event
	 * @param {string} event event name
	 * @param {any} detail event details
	 */
	fire(event: string, detail?: any): void {
		dispatch(this.element, event, detail);
	}

	/**
	 * Listen for an event
	 * @param {string} event event name
	 * @param {EventListenerOrEventListenerObject} handler event handler
	 */
	on(event: string, handler: EventListenerOrEventListenerObject): void {
		this.element.addEventListener(event, handler);
	}

	/**
	 * Stop listening for an event
	 * @param {string} event event name
	 * @param {EventListenerOrEventListenerObject} handler event handler
	 */
	off(event: string, handler: EventListenerOrEventListenerObject): void {
		this.element.removeEventListener(event, handler);
	}

	/**
	 * Add attachments into the component list
	 */
	ready(): void {
		this.components.forEach(co => {
			co.attachments &&
				co.attachments.forEach(a => {
					this.components.push(a);
				});
		});
	}

	/**
	 * Create the canvas
	 * @param {HTMLElement} parent parent element
	 */
	makeCanvas(parent: HTMLElement | undefined): HTMLCanvasElement {
		const { width, height } = this.options;
		return mel(parent, 'canvas', { width, height }) as HTMLCanvasElement;
	}

	/**
	 * Add a platform
	 * @param {PlatformInit} options options
	 */
	addPlatform({
		h,
		a,
		w,
		th,
		motion = 0,
		material = '',
		ceiling = false,
		walls = false,
	}: PlatformInit) {
		this.platforms.push(
			new Platform({
				game: this,
				h,
				a,
				w,
				th,
				motion,
				material,
				ceiling,
				walls,
			})
		);
	}

	/**
	 * Show loading screen
	 */
	showLoadScreen(): void {
		const { width, height } = this.options;
		const { loaded, loading } = this;
		var c = this.context;

		c.fillStyle = '#000000';
		c.fillRect(0, 0, width, height);
		c.fillStyle = '#ffffff';
		c.font = '40px sans-serif';

		c.fillText(`Loading: ${loaded} / ${loading}`, 100, 100);
	}

	/**
	 * Add a Gamepad to the list
	 * @param {Gamepad} pad pad
	 */
	addPad(pad: Gamepad): void {
		if (pad.buttons.length < 3) {
			console.log(`Cannot use pad ${pad.id} - not enough buttons.`);
			return;
		}
		console.log(`Added pad ${pad.id}.`);
		this.pads.push(pad);
	}

	/**
	 * Remove a Gamepad from the list
	 * @param {Gamepad} pad pad
	 */
	removePad(pad: Gamepad): void {
		if (any(this.pads, p => p.id === pad.id)) {
			console.log(`No longer listening to pad ${pad.id}.`);
			this.pads = this.pads.filter(p => p.id !== pad.id);
		}
	}

	/**
	 * Read from attached Gamepads
	 */
	readGamepads(): void {
		const pads = navigator.getGamepads();
		this.pads.forEach(p => {
			const pad = pads[p.index];
			if (!pad) return;

			const buttons = pad.buttons;
			const axes = pad.axes;

			// TODO: configuration
			this.keys[kLeft] = axes[0] < -gPadAxisThreshold;
			this.keys[kRight] = axes[0] > gPadAxisThreshold;
			this.keys[kJump] = buttons[0].pressed;
			this.keys[kThrow] = buttons[1].pressed;
			this.keys[kSwing] = buttons[2].pressed;
		});
	}

	/**
	 * Mark a key as pressed
	 * @param {string} key name
	 */
	press(key: string): void {
		this.keys[key] = true;
	}

	/**
	 * Mark a key as unpressed
	 * @param {string} key name
	 */
	release(key: string): void {
		this.keys[key] = false;
	}

	/**
	 * Remove a component from the list
	 * @param {Component} component component
	 */
	remove(component: Component): void {
		const match = (c: Component) => c != component;
		this.components = this.components.filter(match);
		if (component.isEnemy) this.enemies = this.enemies.filter(match);
		this.drawn = this.drawn.filter(match);
	}

	/**
	 * Start the game
	 */
	start(): void {
		if (this.loaded < this.loading) {
			this.showLoadScreen();
			requestAnimationFrame(this.start);
			return;
		}

		this.inventory = new Inventory(this);
		if (!this.player) this.begin();

		this.running = true;
		requestAnimationFrame(this.next);
	}

	/**
	 * Render the next frame
	 * @param {number} t time
	 */
	next(t: number): void {
		const { width, height, showFps, showHitboxes } = this.options;
		const step = min(t - this.time, gMaxTimeStep);
		var c = this.context;

		c.fillStyle = '#000000';
		c.fillRect(0, 0, width, height);

		if (this.pads.length) this.readGamepads();

		this.components.forEach(co => co.update && co.update(step));

		if (this.redraw) {
			this.redraw = false;
			this.drawn = this.getDrawnComponents();
		}

		this.drawn.forEach(co => co.draw(c));

		if (showHitboxes) {
			c.beginPath();
			c.rect(0, 0, width, height);
			c.fillStyle = 'rgba(0,0,0,0.5)';
			c.fill();

			this.zoomer.draw(c);
			this.drawn.forEach(co => co.drawHitbox && co.drawHitbox(c));
			this.zoomer.reset();
		}

		if (showFps) {
			c.fillStyle = '#ffffff';
			c.font = '12px monospace';
			c.fillText(Math.floor(1000 / step) + 'fps', width - 40, 10);
		}

		this.time = t;
		if (this.running) requestAnimationFrame(this.next);
	}

	getDrawnComponents(): DrawnComponent[] {
		return this.components
			.filter(co => co.draw)
			.sort(
				(a: DrawnComponent, b: DrawnComponent) => a.layer - b.layer
			) as DrawnComponent[];
	}
}
