declare class Game {
	ceilings: Flat[];
	components: Component[];
	context: CanvasRenderingContext2D;
	cx: number;
	cy: number;
	drawn: Component[];
	enemies: Enemy[];
	floors: Flat[];
	inventory: Inventory;
	keys: KeyMap;
	loaded: number;
	loading: number;
	materials: MaterialMap;
	objects: ObjectMap;
	options: GameOptions;
	pads: Gamepad[];
	player: Player;
	redraw: boolean;
	resources: ResourceMap;
	running: boolean;
	textures: TextureMap;
	time: number;
	walls: Wall[];

	constructor(options: GameOptions);
	require(key: string, typ: ResourceLoader, src: string): void;
	begin(): void;
	fire(event: string, detail: any): void;
	on(event: string, handler: EventListenerOrEventListenerObject): void;
	off(event: string, handler: EventListenerOrEventListenerObject): void;
	ready(): void;
	addPlatform(options: PlatformOptions): void;
	showLoadScreen(): void;
	addPad(pad: Gamepad): void;
	removePad(pad: Gamepad): void;
	readGamepads(): void;
	press(key: string): void;
	release(key: string): void;
	remove(component: Component): void;
	start(): void;
	next(t: number): void;
}

declare interface GameOptions {
	parent?: HTMLElement;
	width: number;
	height: number;
	scale: number;
	showFps: boolean;
	showHitboxes: boolean;
	smoothing?: boolean;
}

declare interface KeyMap {
	[name: string]: boolean;
}

declare interface MaterialMap {
	[name: string]: Material;
}

declare interface ObjectMap {}

declare type ResourceLoader = (
	filename: string,
	onload: (e: Event) => void
) => HTMLElement;

declare interface ResourceMap {
	[name: string]: any;
}

declare interface TextureMap {
	[name: string]: Texture;
}

declare class Controller {
	c: number;
	flip: boolean;
	leftFlip: boolean;
	r: number;
	timer: number;
	xo: number;
	yo: number;

	constructor(data: ControllerOptions);
	left(): void;
	right(): void;
	show(state: string, column: number, row: number): boolean;
	draw(ctx: CanvasRenderingContext2D): void;
}

declare interface ControllerOptions {
	c?: number;
	flip?: boolean;
	img: CanvasImageSource;
	leftFlip?: boolean;
	r?: number;
	xo?: number;
	yo?: number;
}

declare class AnimController extends Controller {
	a?: string;
	ac?: AnimData;
	ae?: string;
	afi: number;
	al: ListenerMap;
	animations: AnimMap;
	ar?: AnimData;
	at: number;
	flags: AnimFlags;
	hotspot: XYCoord;

	constructor(data: AnimControllerOptions);
	play(animation: string, force?: boolean, listeners?: ListenerMap): void;
	next(t: number): void;
	frame(n: number): void;
	dispatch(e: string, details: any): void;
}

declare interface AnimControllerOptions extends ControllerOptions {
	animations: AnimMap;
}

declare interface AnimMap {
	[name: string]: AnimData;
}

declare interface AnimData {
	frames: AnimFrame[];
	last?: number;
	loop?: boolean;
	priority?: number;
}

declare interface AnimFrame {
	c: number;
	event?: string;
	hotspot?: XYCoord;
	r: number;
	t: number;
}

declare interface XYCoord {
	x: number;
	y: number;
}

declare interface RACoord {
	/** Radius */
	r: number;

	/** Angle */
	a: number;
}

declare interface AnimFlags {
	noAttack?: boolean;
	noControl?: boolean;
	noTurn?: boolean;
}

declare interface ListenerMap {
	[event: string]: (details: any) => void;
}

declare class Channel {
	a: HTMLAudioElement;
	g: Game;
}

declare interface PlatformOptions {
	h: number;
	a: number;
	w: number;
	th: number;
	motion?: number;
	material?: Material;
	texX?: number;
	texY?: number;
}

declare interface Component {
	attachments?: Component[];
	isEnemy?: boolean;
	isFlat?: boolean;
	game: Game;
	layer: number;

	draw?(ctx: CanvasRenderingContext2D): void;
	drawHitbox?(ctx: CanvasRenderingContext2D): void;
	update?(time: number): void;
}

declare class Flat implements Component {
	a: number;
	circle: boolean;
	game: Game;
	isFlat: boolean;
	left: number;
	layer: number;
	motion: number;
	r: number;
	right: number;
	scale?: number;
	sprite?: Texture;
	width: number;
}

declare class Enemy implements Component {
	game: Game;
	isEnemy: boolean;
	layer: number;
}

declare class Inventory implements Component {
	game: Game;
	layer: number;
}

declare class Player implements Component {
	game: Game;
	layer: number;
}

declare class Wall implements Component {
	game: Game;
	layer: number;
}

declare interface Material {
	spawner(component: Component): void;
	texture(game: Game): Texture;
}

declare interface Texture {}
