import { kCycle, kThrow } from '../keys';
import { zUI } from '../layers';

export default function Inventory(game, size = 3) {
	Object.assign(this, {
		layer: zUI,
		game,
		items: new Array(size),
		cycling: false,
		money: 0,
		health: 5,
		keys: 0,
		img: game.resources['ui.icons'],
	});

	this.clear();
}

Inventory.prototype.clear = function() {
	this.items.fill(null);
};

Inventory.prototype.add = function(cls) {
	const i = this.items.indexOf(null);
	if (i > -1) this.items[i] = new cls(this.game);
};

Inventory.prototype.remove = function(item) {
	this.items = this.items.filter(i => i != item);
};

Inventory.prototype.update = function(t) {
	if (this.game.keys[kThrow]) {
		if (this.canThrow()) {
			this.throw();
		}

		// TODO
		// else {
		// 	this.game.player.sprite.play('shrug');
		// }
	}

	if (this.game.keys[kCycle]) {
		if (!this.cycling) {
			this.cycle();
			this.cycling = true;
		}
	} else {
		this.cycling = false;
	}
};

Inventory.prototype.draw = function(c) {
	const { game, items, money, health, keys, img } = this;

	const y = game.options.height - 48;
	var x = 0;

	items.forEach(i => {
		if (i && i.draw) i.draw(c, x, y);
		x += 48;
	});

	c.font = '20px sans-serif';
	c.fillStyle = '#ffffff';

	x = 0;
	for (var i = 0; i < health; i++) {
		c.drawImage(img, 36, 0, 36, 36, x, 0, 36, 36);
		x += 27;
	}

	c.drawImage(img, 0, 0, 36, 36, 0, 36, 36, 36);
	c.fillText(money, 40, 60);

	c.drawImage(img, 72, 0, 36, 36, 0, 72, 36, 36);
	c.fillText(keys, 40, 96);
};

Inventory.prototype.canThrow = function() {
	return this.items[0] && this.items[0].use;
};

Inventory.prototype.throw = function() {
	return this.items[0].use();
};

Inventory.prototype.cycle = function() {
	const first = this.items.shift();
	this.items = [...this.items, first];
};
