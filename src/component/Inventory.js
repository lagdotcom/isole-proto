import { kCycle, kThrow } from '../keys';

export default function Inventory(game, size = 3) {
	Object.assign(this, {
		game,
		items: new Array(size),
		cycling: false,
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
	const y = 768 - 60;
	var x = 0;

	this.items.forEach(i => {
		if (i && i.draw) i.draw(c, x, y);
		x += 60;
	});
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
