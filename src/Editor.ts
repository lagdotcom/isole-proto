import Axe from './weapon/axe';
import Bat from './enemy/bat';
import Booster from './enemy/Booster';
import Buster from './enemy/Buster';
import ChompChamp from './enemy/ChompChamp';
import Decal, { normalPosition, staticPosition } from './component/Decal';
import Delaunay from 'delaunay-fast';
import Flat from './component/Flat';
import Flazza from './enemy/Flazza';
import Jacques from './player/Jacques';
import Krillna from './enemy/Krillna';
import Rock from './item/Rock';
import Wall from './component/Wall';
import mel from './makeElement';
import clearChildren from './clearChildren';
import { eGameReady, eLevelEnter, eMapEnter } from './events';
import layers, { zBackground } from './layers';
import { dLeft, dRight, Facing } from './dirs';
import Game, {
	GameMode,
	LevelMode,
	MapMode,
	LevelGenerator,
	MapGenerator,
} from './Game';
import CoordAR from './CoordAR';
import Woody from './player/Woody';
import Bomb from './item/Bomb';
import Platform from './component/Platform';
import { rndr } from './tools';
import MapNode from './MapNode';

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
	ceiling?: boolean;
	walls?: boolean;
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
	booster: Booster,
	buster: Buster,
	chompChamp: ChompChamp,
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

export default class Editor implements LevelGenerator, MapGenerator {
	container: HTMLElement;
	data: EditorData;
	dump: HTMLTextAreaElement;
	game: Game;
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
				type: 'jacques',
				a: 140,
				r: 1000,
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

	refresh() {
		if (this.mode == LevelMode) this.game.enter(this);
		if (this.mode == MapMode) this.game.show(this);
	}

	makeMap(game: Game) {
		if (!this.nodes.length) this.generateMap(game);

		game.mapView.selected = this.nodes[game.mapView.current].connections[0];
	}

	generateMap(game: Game) {
		const nodes: MapNode[] = [];
		const stages = 10;
		const offsets = [[0], [-60, 60], [-100, 0, 100]];
		const maxwiggle = 20;
		const wiggle = () => rndr(-maxwiggle, maxwiggle);

		for (var stage = 0; stage < stages; stage++) {
			const size = stage == 0 ? 1 : stage == stages - 1 ? 1 : rndr(2, 4);
			const yo = offsets[size - 1];

			for (var i = 0; i < size; i++) {
				nodes.push({
					id: nodes.length,
					connections: [],
					locked: rndr(0, 10) == 0,
					stage,
					x: wiggle() + stage * 120,
					y: wiggle() + yo[i],
				});
			}
		}

		const tris = Delaunay.triangulate(nodes.map(n => [n.x, n.y]));
		for (var i = 0; i < tris.length; i += 3) {
			const indices = [tris[i], tris[i + 1], tris[i + 2]];
			const set = indices.map(x => nodes[x]);

			set.forEach(n => {
				set.forEach(o => {
					if (n.stage == o.stage - 1 && !n.connections.includes(o.id))
						n.connections.push(o.id);
				});

				n.connections.sort();
			});
		}

		this.nodes = nodes;
		nodes[0].visited = true;
		game.mapView.current = 0;
		game.nodes = nodes;
	}

	makeLevel(game: Game) {
		const { data } = this;
		const { platforms, walls, floors, objects, player, enemies } = data;

		platforms.forEach(p => {
			game.platforms.push(new Platform({ game, ...p }));
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

		const h1 = mel(c, 'h1', { innerText: 'Editor' });
		mel(
			c,
			'button',
			{ innerText: 'Level' },
			{
				click: () => {
					this.nodes = [];
					this.mode = LevelMode;
					this.refresh();
				},
			}
		);
		mel(
			c,
			'button',
			{ innerText: 'Map' },
			{
				click: () => {
					this.mode = MapMode;
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
					this.refresh();

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
					this.data[list].push(o);
					this[maker](this[list], o);
					this.refresh();
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
		this.makeChoiceInput(e, o, 'Type', 'type', enemies);
		this.makeNumInput(e, o, 'Height', 'r');
		this.makeAngleInput(e, o, 'Angle', 'a');
		this.makeChoiceInput(e, o, 'Direction', 'dir', [dLeft, dRight]);
	}
}
