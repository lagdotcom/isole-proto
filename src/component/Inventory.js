import { kCycle, kThrow } from '../keys';

export default function Inventory(game, size = 3) {
	Object.assign(this, {
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
	const { items, money, health, keys, img } = this;

	const y = 768 - 60;
	var x = 0;

	items.forEach(i => {
		if (i && i.draw) i.draw(c, x, y);
		x += 60;
	});

	c.font = '20px sans-serif';
	c.fillStyle = '#ffffff';

	c.drawImage(img, 0, 0, 36, 36, 0, 40, 36, 36);
	c.fillText(money, 40, 64);

	c.drawImage(img, 36, 0, 36, 36, 0, 76, 36, 36);
	c.fillText(health, 40, 100);

	c.drawImage(img, 72, 0, 36, 36, 0, 112, 36, 36);
	c.fillText(keys, 40, 136);
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
