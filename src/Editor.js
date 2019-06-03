import Buster from './enemy/Buster';
import Flat from './component/Flat';
import Krillna from './enemy/Krillna';
import Player from './component/Player';
import Rock from './item/Rock';
import Wall from './component/Wall';
import mel from './makeElement';
import clearChildren from './clearChildren';
import { alla, deg2rad } from './tools';
import { dLeft, dRight } from './dirs';

const enemyTypes = { buster: Buster, krillna: Krillna };
const enemies = Object.keys(enemyTypes);
const itemTypes = { rock: Rock };
const items = ['', ...Object.keys(itemTypes)];
const textures = ['grass'];
const wallDirections = [1, -1];

export default function Editor(options) {
	const { data, game, parent } = options;

	game.element.addEventListener('isole.begin', () => this.onGameBegin());

	this.game = game;
	this.data = data || {
		platforms: [
			{
				h: 250,
				a: 225,
				w: 60,
				th: 32,
				motion: 4,
				texture: 'grass',
			},
			{
				h: 250,
				a: 45,
				w: 240,
				th: 32,
				motion: 4,
				texture: 'grass',
			},
			{
				h: 150,
				a: 135,
				w: 320,
				th: 32,
				motion: -4,
				texture: 'grass',
			},
		],
		walls: [
			{
				top: 218,
				bottom: 150,
				a: 350,
				dir: 1,
				motion: 0,
				texture: 'grass',
			},
			{
				top: 218,
				bottom: 150,
				a: 10,
				dir: -1,
				texture: 'grass',
			},
		],
		floors: [
			{
				h: 50,
				a: 0,
				w: 360,
				texture: 'grass',
			},
		],
		player: { a: 270, r: 300, item: 'rock' },
		enemies: [
			{
				type: 'krillna',
				a: 90,
				r: 200,
				dir: dRight,
			},
			{
				type: 'krillna',
				a: 180,
				r: 300,
				dir: dLeft,
			},
			{
				type: 'buster',
				a: 0,
				r: 250,
			},
		],
	};

	this.makeDom(parent);
}

Editor.prototype.onGameBegin = function() {
	const { data, game } = this;
	const { platforms, walls, floors, player, enemies } = data;

	if (game.options.debugContainer) clearChildren(game.options.debugContainer);

	game.floors = [];
	game.ceilings = [];
	game.walls = [];
	game.enemies = [];

	platforms.forEach(p => {
		game.addPlatform(p);
	});

	walls.forEach(w => {
		game.walls.push(
			new Wall(game, w.top, w.bottom, w.a, w.dir, w.motion, w.texture)
		);
	});

	floors.forEach(f => {
		game.floors.push(new Flat(game, f.h, f.a, f.w, f.motion, f.texture));
	});

	enemies.forEach(e => {
		game.enemies.push(this.makeEnemy(e));
	});

	game.player = new Player(game, {
		a: player.a,
		r: player.r,
	});

	game.inventory.clear();
	if (player.item) game.inventory.add(itemTypes[player.item]);

	game.components = [
		...game.floors,
		...game.ceilings,
		...game.walls,
		...game.enemies,
		game.player,
		game.inventory,
	];
	game.wallsInMotion = true; // TODO

	this.dump.value = JSON.stringify(data);
};

Editor.prototype.makeEnemy = function(e) {
	return new enemyTypes[e.type](this.game, e);
};

Editor.prototype.makeDom = function(parent) {
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
		texture: 'grass',
	});
	this.makeSection(c, 'walls', 'Walls', 'makeWallDom', {
		top: 100,
		bottom: 50,
		a: 0,
		m: 0,
		dir: dLeft,
		texture: 'grass',
	});
	this.makeSection(c, 'floors', 'Floors', 'makeFloorDom', {
		h: 200,
		a: 0,
		w: 90,
		th: 32,
		texture: 'grass',
	});
	this.makeSection(c, 'enemies', 'Enemies', 'makeEnemyDom', {
		type: 'buster',
		a: 0,
		r: 300,
		dir: dLeft,
	});

	const dc = mel(c, 'div', { className: 'section section-dump' });
	mel(dc, 'h2', { innerText: 'Dump' });
	this.dump = mel(dc, 'textarea');
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
};

Editor.prototype.makeSection = function(parent, name, label, maker, example) {
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
};

Editor.prototype.makeNumInput = function(
	parent,
	object,
	label,
	attribute,
	filter = x => x
) {
	const el = mel(
		mel(parent, 'label', { className: 'input number', innerText: label }),
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
	);

	return el;
};

Editor.prototype.makeAngleInput = function(parent, object, label, attribute) {
	return this.makeNumInput(parent, object, label, attribute, x => {
		var a = x % 360;
		if (a < 0) return a + 360;
		return a;
	});
};

Editor.prototype.makeChoiceInput = function(
	parent,
	object,
	label,
	attribute,
	choices
) {
	const el = mel(
		mel(parent, 'label', { className: 'input choice', innerText: label }),
		'select',
		{},
		{
			change: e => {
				object[attribute] = el.value;
				this.game.begin();
			},
		}
	);

	choices.forEach(value => {
		mel(el, 'option', {
			innerText: value,
			selected: object[attribute] === value,
			value,
		});
	});

	return el;
};

Editor.prototype.makeDel = function(parent, o, list) {
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
};

Editor.prototype.makeAdd = function(parent, list, maker, example) {
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
};

Editor.prototype.makePlayerDom = function(parent, o) {
	const e = mel(parent, 'div', { className: 'entry' });
	this.makeNumInput(e, o, 'Height', 'r');
	this.makeAngleInput(e, o, 'Angle', 'a');
	this.makeChoiceInput(e, o, 'Item', 'item', items);
};

Editor.prototype.makePlatformDom = function(parent, o) {
	const e = mel(parent, 'div', { className: 'entry' });
	this.makeDel(e, o, 'platforms');
	this.makeNumInput(e, o, 'Height', 'h');
	this.makeAngleInput(e, o, 'Angle', 'a');
	this.makeAngleInput(e, o, 'Width', 'w');
	this.makeNumInput(e, o, 'Thickness', 'th');
	this.makeNumInput(e, o, 'Motion', 'motion');
	this.makeChoiceInput(e, o, 'Texture', 'texture', textures);
};

Editor.prototype.makeWallDom = function(parent, o) {
	const e = mel(parent, 'div', { className: 'entry' });
	this.makeDel(e, o, 'walls');
	this.makeNumInput(e, o, 'Top', 'top');
	this.makeNumInput(e, o, 'Bottom', 'bottom');
	this.makeAngleInput(e, o, 'Angle', 'a');
	this.makeNumInput(e, o, 'Motion', 'motion');
	this.makeChoiceInput(e, o, 'Direction', 'dir', wallDirections);
	this.makeChoiceInput(e, o, 'Texture', 'texture', textures);
};

Editor.prototype.makeFloorDom = function(parent, o) {
	const e = mel(parent, 'div', { className: 'entry' });
	this.makeDel(e, o, 'floors');
	this.makeNumInput(e, o, 'Height', 'h');
	this.makeAngleInput(e, o, 'Angle', 'a');
	this.makeNumInput(e, o, 'Width', 'w');
	this.makeNumInput(e, o, 'Motion', 'motion');
	this.makeChoiceInput(e, o, 'Texture', 'texture', textures);
};

Editor.prototype.makeEnemyDom = function(parent, o) {
	const e = mel(parent, 'div', { className: 'entry' });
	this.makeDel(e, o, 'enemies');
	this.makeChoiceInput(e, o, 'Type', 'type', enemies);
	this.makeNumInput(e, o, 'Height', 'r');
	this.makeAngleInput(e, o, 'Angle', 'a');
	this.makeChoiceInput(e, o, 'Direction', 'dir', [dLeft, dRight]);
};
