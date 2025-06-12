import Component from './Component';
import Decal from './component/Decal';
import Flat from './component/Flat';
import Inventory from './component/Inventory';
import LeaveTimer from './component/LeaveTimer';
import MapView from './component/MapView';
import Platform from './component/Platform';
import ShopView from './component/ShopView';
import Wall from './component/Wall';
import Controller from './Controller';
import CoordXY from './CoordXY';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import emptyElement from './emptyElement';
import Enemy from './Enemy';
import {
	DisplayLayer,
	MaterialName,
	Milliseconds,
	Multiplier,
	ObjectName,
	Pixels,
	ResourceName,
	TextureName,
	UrlString,
} from './flavours';
import InputMapper, { InputButton } from './InputMapper';
import { zBeforeUI } from './layers';
import mel from './makeElement';
import MapNode from './MapNode';
import Material from './Material';
import { gMaxTimeStep } from './nums';
import { Pickup } from './Pickup';
import Player from './Player';
import addResources from './resources';
import Texture from './Texture';
import { compareDrawnComponent, min } from './tools';
import Zoomer from './Zoomer';

export const LevelMode = 'level';
export const LoadingMode = 'loading';
export const MapMode = 'map';
export const ShopMode = 'shop';
export type GameMode = 'level' | 'loading' | 'map' | 'shop';

export interface LevelGenerator {
	makeLevel: (game: Game) => void;
}

export interface MapGenerator {
	makeMap: (game: Game) => void;
}

export interface ShopGenerator {
	makeShop: (game: Game) => void;
}

export interface GameEvents {
	'enemy.died': { attacker: Damageable; target: Damageable };
	'game.ready': object;
	'level.enter': { id: number };
	'level.entered': object;
	'map.enter': object;
	'map.entered': object;
	'player.died': object;
	'player.dying': { by: Damageable };
	'player.hurt': { by: Damageable; damage: number };
	'shop.entered': object;
}
export type GameEventName = keyof GameEvents;

interface GameInit {
	debugContainer?: HTMLElement;
	height: Pixels;
	maxScale?: number;
	minScale?: number;
	vertScale?: Multiplier;
	zoomScale?: Pixels;
	parent: HTMLElement;
	showDebug?: boolean;
	showFps?: boolean;
	showHitboxes?: boolean;
	smoothing?: boolean;
	width: Pixels;
}

type ResourceLoader<T> = (url: string, callback: () => void) => T;

class Unzoomer implements DrawnComponent {
	game: Game;
	layer: DisplayLayer;

	constructor(game: Game) {
		this.game = game;
		this.layer = zBeforeUI;
	}

	draw() {
		this.game.zoomer.reset();
	}

	drawHitbox() {
		this.game.zoomer.reset();
	}
}

/** Everknot */
export default class Game {
	ceilings: Flat[];
	components: Component[];
	context: CanvasRenderingContext2D;
	cx: Pixels;
	cy: Pixels;
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
	materials: Record<MaterialName, Material>;
	mode: GameMode;
	mousePosition: CoordXY;
	mouseUpdate: boolean;
	nodes: MapNode[];
	objects: Record<ObjectName, Controller>;
	options: GameInit;
	pickups: Pickup[];
	platforms: Platform[];
	player: Player;
	redraw: boolean;
	resources: Record<ResourceName, any>;
	running: boolean;
	runningRaf: number;
	shopView: ShopView;
	textures: Record<TextureName, Texture>;
	time: Milliseconds;
	walls: Wall[];
	wallsInMotion: boolean;
	unzoomer: DrawnComponent;
	zoomer: Zoomer;

	/**
	 * Create a new Game instance
	 * @param {GameInit} options options
	 */
	constructor(options: GameInit) {
		const {
			parent,
			width,
			height,
			smoothing = false,
			minScale = 0.5,
			maxScale = 1,
			zoomScale = 550,
			vertScale = 1.2,
		} = options;

		this.cx = width / 2;
		this.cy = height / 2;
		this.input = new InputMapper();
		this.loaded = 0;
		this.loading = 0;
		this.materials = {};
		this.mousePosition = { x: NaN, y: NaN };
		this.mouseUpdate = true;
		this.nodes = [];
		this.objects = {};
		this.options = options;
		this.resources = {};
		this.running = false;
		this.textures = {};
		this.time = 0;

		this.input.load();
		this.next = this.next.bind(this);
		this.start = this.start.bind(this);

		this.element = this.makeCanvas(parent);
		this.element.addEventListener('mousemove', e => {
			this.mousePosition = { x: e.offsetX, y: e.offsetY };
			this.mouseUpdate = true;
		});

		const context = this.element.getContext('2d');
		if (!context) throw Error('Could not initialize 2D context');

		this.context = context;
		this.context.imageSmoothingEnabled = smoothing;
		this.zoomer = new Zoomer(
			this,
			minScale,
			maxScale,
			zoomScale,
			vertScale
		);
		this.unzoomer = new Unzoomer(this);
		this.leaver = new LeaveTimer(this);

		this.mode = LoadingMode;
		addResources(this);
	}

	/**
	 * Require a resource
	 * @param {ResourceName} name resource name
	 * @param {ResourceLoader} typ resource loader
	 * @param {string} src source URL
	 */
	require<T>(
		name: ResourceName,
		typ: ResourceLoader<T>,
		src: UrlString
	): void {
		this.loading++;
		this.resources[name] = typ(src, () => this.resourceLoaded());
	}

	/**
	 * Mark a resource as loaded
	 */
	resourceLoaded() {
		this.loaded++;

		if (this.loaded === this.loading) {
			this.ready();
		}
	}

	/**
	 * Mark game instance as ready to begin
	 */
	ready() {
		this.inventory = new Inventory(this);
		this.mapView = new MapView(this);
		this.shopView = new ShopView(this);

		this.fire('game.ready', {});
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
		this.zoomer.reset();

		gen.makeMap(this);
		this.components = [this.inventory, this.mapView];
		this.mode = MapMode;
		this.fire('map.entered', {});
	}

	/**
	 * Enter a game level!
	 * @param {LevelGenerator} gen level generator
	 */
	enter(gen: LevelGenerator): void {
		this.clear();
		this.zoomer.reset();

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
			this.player.reticle,
			this.player.spellCircle,
			this.inventory,
			this.zoomer,
			this.unzoomer,
			this.leaver,
		];
		this.wallsInMotion = true; // TODO

		this.mode = LevelMode;
		this.addAttachments();
		this.fire('level.entered', {});
	}

	/**
	 * Enter the shop!
	 * @param {ShopGenerator} gen shop generator
	 */
	shop(gen: ShopGenerator) {
		this.clear();
		this.zoomer.reset();

		gen.makeShop(this);
		this.components = [this.shopView, this.inventory];

		this.mode = ShopMode;
		this.fire('shop.entered', {});
	}

	/**
	 * Fire an event
	 * @param {string} event event name
	 * @param {unknown} detail event details
	 */
	fire<T extends GameEventName>(event: T, detail: GameEvents[T]): void {
		this.element.dispatchEvent(new CustomEvent(event, { detail }));
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
			co.attachments?.forEach(a => {
				this.components.push(a);
			});
		});
	}

	/**
	 * Create the canvas
	 * @param {HTMLElement} parent parent element
	 */
	makeCanvas(parent?: HTMLElement): HTMLCanvasElement {
		const { width, height } = this.options;
		return mel(parent, 'canvas', { width, height }) as HTMLCanvasElement;
	}

	/**
	 * Show loading screen
	 */
	showLoadScreen(): void {
		const { width, height } = this.options;
		const { loaded, loading } = this;
		const c = this.context;

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
		const match = (c: Component) => c !== component;
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
	 * @param {Milliseconds} t time
	 */
	next(t: Milliseconds): void {
		const step: Milliseconds = min(t - this.time, gMaxTimeStep);
		this.time = t;

		switch (this.mode) {
			case LoadingMode:
				this.showLoadScreen();
				break;

			case LevelMode:
			case MapMode:
			case ShopMode:
				this.showGameScreen(step);
				break;
		}

		if (this.running) this.runningRaf = requestAnimationFrame(this.next);
	}

	/**
	 * Render the next frame, in Level mode
	 * @param {Milliseconds} step time to process
	 */
	showGameScreen(step: Milliseconds) {
		const { width, height, showFps, showHitboxes } = this.options;
		const c = this.context;

		c.fillStyle = '#000000';
		c.fillRect(0, 0, width, height);

		this.keys = this.input.poll();
		if (this.mouseUpdate) {
			this.mouseUpdate = false;
			this.keys.add(InputButton.AimAtMouse);
		}
		this.components.forEach(co => co.update?.(step));

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
			this.drawn.forEach(co => co.drawHitbox?.(c));
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
			.sort(compareDrawnComponent) as DrawnComponent[];
	}
}
