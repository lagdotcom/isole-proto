import Cartographer from './Cartographer';
import clearChildren from './clearChildren';
import Decal, { normalPosition, staticPosition } from './component/Decal';
import Flat from './component/Flat';
import Platform from './component/Platform';
import Wall from './component/Wall';
import {
	enemyNames,
	enemyTypes,
	itemNames,
	itemTypes,
	playerNames,
	playerTypes,
	weaponNames,
	weaponTypes,
} from './corpus';
import { dLeft, dRight } from './dirs';
import EditorData, {
	EditorEnemy,
	EditorFloor,
	EditorObject,
	EditorPlatform,
	EditorPlayer,
	EditorWall,
	EditorWeapon,
} from './EditorData';
import { eGameReady, eLevelEnter, eMapEnter } from './events';
import Game, {
	GameMode,
	LevelGenerator,
	LevelMode,
	MapGenerator,
	MapMode,
	ShopGenerator,
	ShopMode,
} from './Game';
import BombItem from './item/Bomb';
import ItemObject from './item/ItemObject';
import RockItem from './item/Rock';
import layers, { zBackground } from './layers';
import mel from './makeElement';
import MapNode from './MapNode';
import { choose } from './tools';
import AxeWeapon from './weapon/Axe';
import WeaponObject from './weapon/WeaponObject';
import { roundwoods } from './worlds';

let materials: string[];
let objects: string[];
const wallDirections = [1, -1];
const objectPositions = [normalPosition, staticPosition];

interface EditorInit {
	data?: EditorData;
	game: Game;
	parent: HTMLElement;
}

export default class Editor
	implements LevelGenerator, MapGenerator, ShopGenerator
{
	container: HTMLElement;
	data: EditorData;
	dump: HTMLTextAreaElement;
	game: Game;
	me: boolean;
	mode: GameMode;
	nodes: MapNode[];

	constructor(options: EditorInit) {
		const { data, game, parent } = options;

		this.nodes = [];
		materials = Object.keys(game.materials);
		objects = Object.keys(game.objects);
		game.on(eGameReady, () => this.refresh());
		game.on(eLevelEnter, () => this.game.enter(this));
		game.on(eMapEnter, () => {
			this.mode = MapMode;
			this.game.show(this);
		});

		this.game = game;
		this.mode = LevelMode;
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
				{ h: 500, a: 190, w: 40, motion: 0, material: 'grass' },
				{ h: 700, a: 140, w: 30, motion: 0, material: 'grass' },
			],
			objects: [],
			player: {
				type: 'woody',
				a: 50,
				r: 200,
				item: 'rock',
				weapon: 'axe',
			},
			enemies: [{ type: 'minatoad', a: 0, r: 150, dir: 'L' }],
		};

		this.makeDom(parent);
	}

	refresh() {
		if (this.mode === LevelMode) this.game.enter(this);
		if (this.mode === MapMode) this.game.show(this);
		if (this.mode === ShopMode) this.game.shop(this);
	}

	makeMap(game: Game) {
		if (!this.nodes.length) this.generateMap(game);

		game.mapView.selected = this.nodes[game.mapView.current].connections[0];
	}

	generateMap(game: Game) {
		const cart = new Cartographer();
		const nodes = cart.gen({ floor: 0 });

		this.nodes = nodes;
		nodes[0].visited = true;
		game.mapView.current = 0;
		game.nodes = nodes;
	}

	makeLevel(game: Game) {
		const data = this.me ? this.data : choose(roundwoods);
		const {
			platforms,
			walls,
			floors,
			objects,
			player,
			enemies,
			weapons,
			items,
		} = data;

		platforms &&
			platforms.forEach(p => {
				game.platforms.push(new Platform({ game, ...p }));
			});

		walls &&
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

		floors &&
			floors.forEach(f => {
				game.floors.push(
					new Flat(game, f.h, f.a, f.w, f.motion, f.material)
				);
			});

		objects &&
			objects.forEach(o => {
				game.decals.push(new Decal(game, o));
			});

		enemies &&
			enemies.forEach(e => {
				// feels weird
				if (e.type === 'chompChamp')
					game.decals.push(this.makeEnemy(e));
				else game.enemies.push(this.makeEnemy(e));
			});

		weapons &&
			weapons.forEach(w => {
				game.pickups.push(
					new WeaponObject(game, {
						a: w.a,
						r: w.r,
						weapon: weaponTypes[w.weapon],
					})
				);
			});

		items &&
			items.forEach(i => {
				game.pickups.push(
					new ItemObject(game, {
						a: i.a,
						r: i.r,
						item: itemTypes[i.item],
					})
				);
			});

		game.player = this.makePlayer(player);

		game.inventory.clear();
		if (player.item) game.inventory.add(itemTypes[player.item]);
		if (player.weapon)
			game.inventory.weapon = new weaponTypes[player.weapon](game);
		game.inventory.health = game.player.health;

		this.dump.value = JSON.stringify(data);
	}

	makeShop(game: Game) {
		game.shopView.clear();

		game.shopView.item(RockItem, 10);
		game.shopView.weapon(AxeWeapon, 40);
		game.shopView.item(BombItem, 15);
	}

	makeEnemy(e: EditorEnemy) {
		return new enemyTypes[e.type](this.game, e);
	}

	makePlayer(p: EditorPlayer) {
		return new playerTypes[p.type](this.game, p);
	}

	makeDom(parent?: HTMLElement) {
		const { data } = this;
		let c = this.container;

		if (c) {
			clearChildren(c);
		} else {
			c = this.container = mel(parent, 'div', { className: 'editor' });
		}

		mel(c, 'h1', { innerText: 'Editor' });
		mel(
			c,
			'button',
			{ innerText: 'Edit Mode' },
			{
				click: () => {
					this.nodes = [];
					this.me = true;
					this.mode = LevelMode;
					this.refresh();
					this.me = false;
				},
			}
		);
		mel(
			c,
			'button',
			{ innerText: 'Game Mode' },
			{
				click: () => {
					this.me = false;
					this.mode = MapMode;
					this.refresh();
				},
			}
		);
		mel(
			c,
			'button',
			{ innerText: 'Shop Mode' },
			{
				click: () => {
					this.me = false;
					this.mode = ShopMode;
					this.refresh();
				},
			}
		);

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
		this.makeSection(c, 'weapons', 'Weapons', 'makeWeaponDom', {
			weapon: weaponNames[1],
			a: 0,
			r: 300,
		});
		this.makeSection(c, 'items', 'Items', 'makeItemDom', {
			item: itemNames[1],
			a: 0,
			r: 300,
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

						this.refresh();
					} catch (e) {
						alert(e);
						return;
					}
				},
			}
		);
	}

	makeSection(
		parent: HTMLElement,
		name: string,
		label: string,
		maker: string,
		example: any
	) {
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

		const sec = this.data[name];
		sec && sec.forEach(o => this[maker](this[name], o));
	}

	makeNumInput(
		parent: HTMLElement,
		object: any,
		label: string,
		attribute: string,
		filter = x => x
	) {
		const el = mel(
			mel(parent, 'label', {
				className: 'input number',
				innerText: label,
			}),
			'input',
			{ type: 'number', value: object[attribute] || 0 },
			{
				change: () => {
					const f = filter(el.valueAsNumber);
					object[attribute] = f;
					this.refresh();

					if (el.valueAsNumber !== f) el.value = f;
				},
			}
		) as HTMLInputElement;

		return el;
	}

	makeAngleInput(
		parent: HTMLElement,
		object: any,
		label: string,
		attribute: string
	) {
		return this.makeNumInput(parent, object, label, attribute, x => {
			const a = x % 360;
			if (a < 0) return a + 360;
			return a;
		});
	}

	makeBoolInput(
		parent: HTMLElement,
		object: any,
		label: string,
		attribute: string
	) {
		const el = mel(
			mel(parent, 'label', {
				className: 'input checkbox',
				innerText: label,
			}),
			'input',
			{ type: 'checkbox' },
			{
				change: () => {
					object[attribute] = el.checked;
					this.refresh();
				},
			}
		) as HTMLInputElement;
	}

	makeChoiceInput<T>(
		parent: HTMLElement,
		object: any,
		label: string,
		attribute: string,
		choices: T[] | Record<string, T>,
		parser: (raw: string) => T = x => x as T
	) {
		const el = mel(
			mel(parent, 'label', {
				className: 'input choice',
				innerText: label,
			}),
			'select',
			{},
			{
				change: () => {
					object[attribute] = parser(el.value);
					this.refresh();
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
					this.refresh();
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
					if (!this.data[list]) this.data[list] = [];

					this.data[list].push(o);
					this[maker](this[list], o);
					this.refresh();
				},
			}
		);
	}

	makePlayerDom(parent: HTMLElement, o: EditorPlayer) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeChoiceInput(e, o, 'Character', 'type', playerNames);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeChoiceInput(e, o, 'Item', 'item', itemNames);
		this.makeChoiceInput(e, o, 'Weapon', 'weapon', weaponNames);
	}

	makePlatformDom(parent: HTMLElement, o: EditorPlatform) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'platforms');
		this.makeNumInput(e, o, 'Height', 'h');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeNumInput(e, o, 'Width', 'w');
		this.makeNumInput(e, o, 'Thickness', 'th');
		this.makeNumInput(e, o, 'Motion', 'motion');
		this.makeChoiceInput(e, o, 'Material', 'material', materials);
		this.makeBoolInput(e, o, 'Ceiling?', 'ceiling');
		this.makeBoolInput(e, o, 'Walls?', 'walls');
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
		this.makeChoiceInput(e, o, 'Type', 'type', enemyNames);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeChoiceInput(e, o, 'Direction', 'dir', [dLeft, dRight]);
	}

	makeWeaponDom(parent: HTMLElement, o: EditorWeapon) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'weapons');
		this.makeChoiceInput(
			e,
			o,
			'Weapon',
			'weapon',
			weaponNames.filter(x => x)
		);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
	}

	makeItemDom(parent: HTMLElement, o: EditorWeapon) {
		const e = mel(parent, 'div', { className: 'entry' });
		this.makeDel(e, o, 'items');
		this.makeChoiceInput(
			e,
			o,
			'Item',
			'item',
			itemNames.filter(x => x)
		);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
	}
}
