import Controller from '../Controller';
import { aThrow } from '../anims';
import { eThrow } from '../events';

const controller = img => new Controller({ img, w: 48, h: 48 });

export default function Rock(game) {
	Object.assign(this, {
		game,
		sprite: controller(game.resources['item.rock']),
		thrown: this.thrown.bind(this),
	});
}

Rock.prototype.draw = function(c, x, y) {
	c.translate(x, y);
	this.sprite.draw(c);
	c.translate(-x, -y);
};

Rock.prototype.use = function() {
	this.game.player.sprite.play(aThrow, false, { [eThrow]: this.thrown });
};

Rock.prototype.thrown = function() {
	// TODO
	console.log('thrown');

	this.game.inventory.remove(this);
};
