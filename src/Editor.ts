import Axe from './weapon/axe';
import Bat from './enemy/bat';
import Buster from './enemy/Buster';
import Decal, { normalPosition, staticPosition } from './component/Decal';
import Flat from './component/Flat';
import Flazza from './enemy/Flazza';
import Jacques from './player/Jacques';
import Krillna from './enemy/Krillna';
import Rock from './item/Rock';
import Wall from './component/Wall';
import mel from './makeElement';
import clearChildren from './clearChildren';
import { eGameBegin } from './events';
import layers, { zBackground } from './layers';
import { dLeft, dRight, Facing } from './dirs';
import Game from './Game';
import CoordAR from './CoordAR';
import Woody from './player/Woody';
import Bomb from './item/Bomb';

interface EditorData {
	platforms: EditorPlatform[];
	walls: EditorWall[];
	floors: EditorFloor[];
	objects: EditorObject[];
	player: EditorPlayer;
	enemies: EditorEnemy[];
}

interface EditorEnemy extends CoordAR {
	dir: Facing;
	type: string;
}

interface EditorFloor {
	a: number;
	h: number;
	material: string;
	motion?: number;
	w: number;
}

interface EditorObject extends CoordAR {
	object: string;
}

interface EditorPlatform {
	h: number;
	w: number;
	a: number;
	th: number;
	motion?: number;
	material: string;
}

interface EditorPlayer extends CoordAR {
	type: string;
	item?: string;
	weapon?: string;
}

interface EditorWall {
	top: number;
	bottom: number;
	a: number;
	motion?: number;
	dir: 1 | -1;
	material: string;
}

interface EditorInit {
	data?: EditorData;
	game: Game;
	parent: HTMLElement;
}

const enemyTypes = {
	bat: Bat,
	buster: Buster,
	krillna: Krillna,
	flazza: Flazza,
};
const enemies = Object.keys(enemyTypes);

const itemTypes = { bomb: Bomb, rock: Rock };
const items = ['', ...Object.keys(itemTypes)];

const playerTypes = { jacques: Jacques, woody: Woody };
const players = Object.keys(playerTypes);

const weaponTypes = { axe: Axe };
const weapons = ['', ...Object.keys(weaponTypes)];

var materials: string[];
var objects: string[];
const wallDirections = [1, -1];
const objectPositions = [normalPosition, staticPosition];

export default class Editor {
	container: HTMLElement;
	data: EditorData;
	dump: HTMLTextAreaElement;
	game: Game;

	constructor(options: EditorInit) {
		const { data, game, parent } = options;

		materials = Object.keys(game.materials);
		objects = Object.keys(game.objects);
		game.on(eGameBegin, () => this.onGameBegin());

		this.game = game;
		this.data = data || {
			platforms: [
				{
					h: 340,
					a: 235,
					w: 30,
					th: 32,
					motion: 0,
					material: 'grass2',
				},
			],
			walls: [],
			floors: [
				{ h: 150, a: 0, w: 360, material: 'bluegrass' },
				{ h: 300, a: 180, w: 30, motion: 2, material: 'cloud' },
				{ h: 300, a: 0, w: 30, motion: 2, material: 'cloud' },
			],
			objects: [],
			player: {
				type: 'jacques',
				a: 270,
				r: 150,
				item: 'rock',
				weapon: 'axe',
			},
			enemies: [
				{ type: 'bat', a: 200, r: 250, dir: 'L' },
				{ type: 'buster', a: 0, r: 150, dir: 'L' },
				{ type: 'krillna', a: 150, r: 150, dir: 'R' },
			],
		};

		this.makeDom(parent);
	}

	onGameBegin() {
		const { data, game } = this;
		const { platforms, walls, floors, objects, player, enemies } = data;

		if (game.options.debugContainer)
			clearChildren(game.options.debugContainer);

		game.floors = [];
		game.ceilings = [];
		game.walls = [];
		game.enemies = [];
		game.decals = [];

		platforms.forEach(p => {
			game.addPlatform(p);
		});

		walls.forEach(w => {
			game.walls.push(
				new Wall(
					game,
					w.top,
					w.bottom,
					w.a,
					w.dir,
					w.motion,
					w.material
				)
			);
		});

		floors.forEach(f => {
			game.floors.push(
				new Flat(game, f.h, f.a, f.w, f.motion, f.material)
			);
		});

		objects.forEach(o => {
			game.decals.push(new Decal(game, o));
		});

		enemies.forEach(e => {
			game.enemies.push(this.makeEnemy(e));
		});

		game.player = this.makePlayer(player);

		game.inventory.clear();
		if (player.item) game.inventory.add(itemTypes[player.item]);
		if (player.weapon)
			game.inventory.weapon = new weaponTypes[player.weapon](game);
		game.inventory.health = game.player.health;

		game.components = [
			...game.floors,
			...game.ceilings,
			...game.walls,
			...game.enemies,
			...game.decals,
			game.player,
			game.inventory,
		];
		game.wallsInMotion = true; // TODO

		this.dump.value = JSON.stringify(data);
	}

	makeEnemy(e: EditorEnemy) {
		return new enemyTypes[e.type](this.game, e);
	}

	makePlayer(p: EditorPlayer) {
		return new playerTypes[p.type](this.game, p);
	}

	makeDom(parent?: HTMLElement) {
		const { data } = this;
		var c = this.container;

		if (c) {
			clearChildren(c);
		} else {
			c = this.container = mel(parent, 'div', { className: 'editor' });
		}

		mel(c, 'h1', { innerText: 'Editor' });

		const yc = mel(c, 'div', { className: 'section section-player' });
		mel(yc, 'h2', { innerText: 'Player' });
		this.makePlayerDom(yc, data.player);

		this.makeSection(c, 'platforms', 'Platforms', 'makePlatformDom', {
			h: 200,
			a: 0,
			w: 90,
			th: 32,
			motion: 0,
			material: 'grass',
		});
		this.makeSection(c, 'walls', 'Walls', 'makeWallDom', {
			top: 100,
			bottom: 50,
			a: 0,
			motion: 0,
			dir: dLeft,
			material: 'grass',
		});
		this.makeSection(c, 'floors', 'Floors', 'makeFloorDom', {
			h: 200,
			a: 0,
			w: 90,
			motion: 0,
			material: 'grass',
		});
		this.makeSection(c, 'objects', 'Objects', 'makeObjectDom', {
			r: 200,
			a: 0,
			layer: zBackground,
			motion: 0,
			parallax: 0,
			object: objects[0],
		});
		this.makeSection(c, 'enemies', 'Enemies', 'makeEnemyDom', {
			type: 'buster',
			a: 0,
			r: 300,
			dir: dLeft,
		});

		const dc = mel(c, 'div', { className: 'section section-dump' });
		mel(dc, 'h2', { innerText: 'Dump' });
		this.dump = mel(dc, 'textarea') as HTMLTextAreaElement;
		mel(
			dc,
			'button',
			{ innerText: 'Load' },
			{
				click: () => {
					try {
						const newData = JSON.parse(this.dump.value);

						this.data = newData;
						this.makeDom();

						this.game.begin();
					} catch (e) {
						alert(e);
						return;
					}
				},
			}
		);
	}

	makeSection(parent, name, label, maker, example) {
		const container = mel(parent, 'div', {
			className: 'section section-' + name,
		});
		this.makeAdd(
			mel(container, 'h2', { innerText: label }),
			name,
			maker,
			example
		);
		this[name] = mel(container);
		this.data[name].forEach(o => this[maker](this[name], o));
	}

	makeNumInput(parent, object, label, attribute, filter = x => x) {
		const el = mel(
			mel(parent, 'label', {
				className: 'input number',
				innerText: label,
			}),
			'input',
			{ type: 'number', value: object[attribute] || 0 },
			{
				change: e => {
					var f = filter(el.valueAsNumber);
					object[attribute] = f;
					this.game.begin();

					if (el.valueAsNumber != f) el.value = f;
				},
			}
		) as HTMLInputElement;

		return el;
	}

	makeAngleInput(parent, object, label, attribute) {
		return this.makeNumInput(parent, object, label, attribute, x => {
			var a = x % 360;
			if (a < 0) return a + 360;
			return a;
		});
	}

	makeChoiceInput(
		parent: HTMLElement,
		object: any,
		label: string,
		attribute: string,
		choices: any[] | { [key: string]: any },
		parser: (raw: string) => any = x => x
	) {
		const el = mel(
			mel(parent, 'label', {
				className: 'input choice',
				innerText: label,
			}),
			'select',
			{},
			{
				change: (e: Event) => {
					object[attribute] = parser(el.value);
					this.game.begin();
				},
			}
		) as HTMLSelectElement;

		if (Array.isArray(choices))
			choices.forEach(value => {
				mel(el, 'option', {
					innerText: value,
					selected: object[attribute] === value,
					value,
				});
			});
		else
			Object.keys(choices).forEach(innerText => {
				const value = choices[innerText];
				mel(el, 'option', {
					innerText,
					selected: object[attribute] === value,
					value,
				});
			});

		return el;
	}

	makeDel(parent: HTMLElement, o: any, list: string) {
		mel(
			parent,
			'button',
			{ className: 'del', innerText: 'Del' },
			{
				click: () => {
					parent.remove();
					this.data[list] = this.data[list].filter(i => i !== o);
					this.game.begin();
				},
			}
		);
	}

	makeAdd(parent: HTMLElement, list: string, maker: string, example: any) {
		mel(
			parent,
			'button',
			{ className: 'add', innerText: 'Add' },
			{
				click: () => {
					const o = Object.assign({}, example);
					this.data[list].push(o);
					this[maker](this[list], o);
					this.game.begin();
				},
			}
		);
	}

	makePlayerDom(parent: HTMLElement, o: EditorPlayer) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeChoiceInput(e, o, 'Character', 'type', players);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeChoiceInput(e, o, 'Item', 'item', items);
		this.makeChoiceInput(e, o, 'Weapon', 'weapon', weapons);
	}

	makePlatformDom(parent: HTMLElement, o: EditorPlatform) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'platforms');
		this.makeNumInput(e, o, 'Height', 'h');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeAngleInput(e, o, 'Width', 'w');
		this.makeNumInput(e, o, 'Thickness', 'th');
		this.makeNumInput(e, o, 'Motion', 'motion');
		this.makeChoiceInput(e, o, 'Material', 'material', materials);
	}

	makeWallDom(parent: HTMLElement, o: EditorWall) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'walls');
		this.makeNumInput(e, o, 'Top', 'top');
		this.makeNumInput(e, o, 'Bottom', 'bottom');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeNumInput(e, o, 'Motion', 'motion');
		this.makeChoiceInput(e, o, 'Direction', 'dir', wallDirections);
		this.makeChoiceInput(e, o, 'Material', 'material', materials);
	}

	makeFloorDom(parent: HTMLElement, o: EditorFloor) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'floors');
		this.makeNumInput(e, o, 'Height', 'h');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeNumInput(e, o, 'Width', 'w');
		this.makeNumInput(e, o, 'Motion', 'motion');
		this.makeChoiceInput(e, o, 'Material', 'material', materials);
	}

	makeObjectDom(parent: HTMLElement, o: EditorObject) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'objects');
		this.makeChoiceInput(e, o, 'Position', 'position', objectPositions);
		this.makeNumInput(e, o, 'Height/Y', 'r');
		this.makeAngleInput(e, o, 'Angle/X', 'a');
		this.makeNumInput(e, o, 'Motion', 'motion');
		this.makeNumInput(e, o, 'Parallax', 'parallax');
		this.makeChoiceInput(e, o, 'Layer', 'layer', layers, x =>
			parseInt(x, 10)
		);
		this.makeChoiceInput(e, o, 'Object', 'object', objects);
	}

	makeEnemyDom(parent: HTMLElement, o: EditorEnemy) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'enemies');
		this.makeChoiceInput(e, o, 'Type', 'type', enemies);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeChoiceInput(e, o, 'Direction', 'dir', [dLeft, dRight]);
	}
}
