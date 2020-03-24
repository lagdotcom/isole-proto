import Flat from './component/Flat';
import Inventory from './component/Inventory';
import Wall from './component/Wall';
import { eLevelEntered, eGameReady, eMapEntered } from './events';
import { min } from './tools';
import { gMaxTimeStep } from './nums';
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
import Platform from './component/Platform';
import emptyElement from './emptyElement';
import MapNode from './MapNode';
import MapView from './component/MapView';
import InputMapper, { InputButton } from './InputMapper';
import LeaveTimer from './Component/LeaveTimer';
import { Pickup } from './Pickup';

export const LevelMode = 'level';
export const LoadingMode = 'loading';
export const MapMode = 'map';
export type GameMode = 'level' | 'loading' | 'map';

export interface LevelGenerator {
	makeLevel: (game: Game) => void;
}

export interface MapGenerator {
	makeMap: (game: Game) => void;
}

interface GameInit {
	debugContainer?: HTMLElement;
	height: number;
	maxScale?: number;
	minScale?: number;
	vertScale?: number;
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
	input: InputMapper;
	inventory: Inventory;
	keys: Set<InputButton>;
	leaver: LeaveTimer;
	loaded: number;
	loading: number;
	mapView: MapView;
	materials: { [name: string]: Material };
	mode: GameMode;
	nodes: MapNode[];
	objects: { [name: string]: Controller };
	options: GameInit;
	pickups: Pickup[];
	platforms: Platform[];
	player: Player;
	redraw: boolean;
	resources: { [name: string]: any };
	running: boolean;
	runningRaf: number;
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
		this.input = new InputMapper();
		this.loaded = 0;
		this.loading = 0;
		this.materials = {};
		this.nodes = [];
		this.objects = {};
		this.options = options;
		this.resources = [];
		this.running = false;
		this.textures = {};
		this.time = 0;

		this.input.load();
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
			options.zoomScale || 550,
			options.vertScale || 1.2
		);
		this.unzoomer = new Unzoomer(this);
		this.leaver = new LeaveTimer(this);

		this.mode = LoadingMode;
		addResources(this);
	}

	/**
	 * Require a resource
	 * @param {string} key resource name
	 * @param {ResourceLoader} typ resource loader
	 * @param {string} src source URL
	 */
	require(key: string, typ: ResourceLoader, src: string): void {
		this.loading++;
		this.resources[key] = typ(src, () => this.resourceLoaded());
	}

	/**
	 * Mark a resource as loaded
	 */
	resourceLoaded() {
		this.loaded++;

		if (this.loaded == this.loading) {
			this.ready();
		}
	}

	/**
	 * Mark game instance as ready to begin
	 */
	ready() {
		this.inventory = new Inventory(this);
		this.mapView = new MapView(this);

		this.fire(eGameReady);
	}

	/**
	 * Clear all active game components
	 */
	clear() {
		if (this.options.debugContainer)
			emptyElement(this.options.debugContainer);

		this.ceilings = [];
		this.decals = [];
		this.enemies = [];
		this.floors = [];
		this.platforms = [];
		this.walls = [];
		this.pickups = [];
		this.components = [];
		this.redraw = true;
	}

	/**
	 * Show the game map
	 * @param {MapGenerator} gen map generator
	 */
	show(gen: MapGenerator): void {
		this.clear();

		gen.makeMap(this);
		this.components = [this.inventory, this.mapView];
		this.mode = MapMode;
		this.fire(eMapEntered);
	}

	/**
	 * Enter a game level!
	 * @param {LevelGenerator} gen level generator
	 */
	enter(gen: LevelGenerator): void {
		this.clear();

		gen.makeLevel(this);
		this.components = [
			...this.platforms,
			...this.floors,
			...this.ceilings,
			...this.walls,
			...this.enemies,
			...this.decals,
			...this.pickups,
			this.player,
			this.inventory,
			this.zoomer,
			this.unzoomer,
			this.leaver,
		];
		this.wallsInMotion = true; // TODO

		this.mode = LevelMode;
		this.addAttachments();
		this.fire(eLevelEntered);
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
	addAttachments(): void {
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
		this.running = true;
		this.runningRaf = requestAnimationFrame(this.next);
	}

	/**
	 * Render the next frame
	 * @param {number} t time
	 */
	next(t: number): void {
		const step = min(t - this.time, gMaxTimeStep);
		this.time = t;

		switch (this.mode) {
			case LoadingMode:
				this.showLoadScreen();
				break;

			case LevelMode:
			case MapMode:
				this.showGameScreen(step);
				break;
		}

		if (this.running) this.runningRaf = requestAnimationFrame(this.next);
	}

	/**
	 * Render the next frame, in Level mode
	 * @param {number} step time to process
	 */
	showGameScreen(step: number) {
		const { width, height, showFps, showHitboxes } = this.options;
		var c = this.context;

		c.fillStyle = '#000000';
		c.fillRect(0, 0, width, height);

		this.keys = this.input.poll();
		this.components.forEach(co => co.update && co.update(step));

		if (this.redraw) {
			this.redraw = false;
			this.drawn = this.getDrawnComponents();
		}

		this.drawn.forEach(co => !co.hidden && co.draw(c));

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
	}

	getDrawnComponents(): DrawnComponent[] {
		return this.components
			.filter(co => co.draw)
			.sort(
				(a: DrawnComponent, b: DrawnComponent) => a.layer - b.layer
			) as DrawnComponent[];
	}
}
