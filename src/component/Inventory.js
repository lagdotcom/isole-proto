import { kThrow } from '../keys';

export default function Inventory(game) {
	Object.assign(this, {
		game,
		items: [],
	});
}

Inventory.prototype.clear = function() {
	this.items = [];
};

Inventory.prototype.add = function(cls) {
	this.items.push(new cls(this.game));
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
};

Inventory.prototype.draw = function(c) {
	const y = 768 - 60;
	var x = 0;

	this.items.forEach(i => {
		i.draw(c, x, y);
		x += 60;
	});
};

Inventory.prototype.canThrow = function() {
	return this.items.length > 0 && this.items[0].use;
};

Inventory.prototype.throw = function() {
	return this.items[0].use();
};
