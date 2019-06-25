import textures from '../texture/bluegrass';
import TileController from '../texture/TileController';
import { zDecal } from '../layers';
import { cart, piHalf, scalew } from '../tools';

const bluegrassTips = game =>
	new TileController(game.resources['tile.bluegrass'], {
		tl: { c: 0, r: 0 },
		tm: { c: 1, r: 0 },
		tr: { c: 2, r: 0 },
		ml: { c: 0, r: 0 },
		mm: { c: 1, r: 0 },
		mr: { c: 2, r: 0 },
		bl: { c: 0, r: 0 },
		bm: { c: 1, r: 0 },
		br: { c: 2, r: 0 },
	});

function GrassTips(flat) {
	Object.assign(this, {
		flat,
		layer: zDecal,
		r: flat.r + 30,
		sprite: bluegrassTips(flat.game),
	});
}

GrassTips.prototype.draw = function(c) {
	const { flat, r, sprite } = this;
	const { game, left, right, scale, width } = flat;
	const { cx, cy } = game;
	const step = scalew(scale, r),
		offset = scalew(scale / 2, r);
	var remaining = width * 2,
		a = left;

	sprite.tile('tl');
	while (remaining > 0) {
		if (remaining < step) {
			sprite.tile('tr');
			a = right - step;
		}

		var normal = a + offset + piHalf;
		var { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);

		remaining -= step;
		a += step;
		sprite.tile('tm');
	}
};

export default {
	bluegrass: {
		texture: textures.bluegrass,
		spawner: flat => {
			flat.attachments.push(new GrassTips(flat));
		},
	},
};
