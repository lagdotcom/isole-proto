import textures from '../texture/bluegrass';
import TileController from '../texture/TileController';
import { zDecal } from '../layers';
import { cart, πHalf, scalew } from '../tools';
import Flat from '../component/Flat';
import Game from '../Game';
import DrawnComponent from '../DrawnComponent';

const bluegrassTips = game =>
	new TileController(game.resources['tile.bluegrass'], {
		tl: { c: 1, r: 4 },
		tm: { c: 2, r: 4, cycle: 4 },
		tr: { c: 6, r: 4 },
	});

class GrassTips implements DrawnComponent {
	flat: Flat;
	game: Game;
	layer: number;
	r: number;
	sprite: TileController;

	constructor(flat: Flat) {
		Object.assign(this, {
			flat,
			game: flat.game,
			layer: zDecal,
			r: flat.r + 30,
			sprite: bluegrassTips(flat.game),
		});
	}

	draw(c: CanvasRenderingContext2D): void {
		const { flat, game, r, sprite } = this;
		const { left, right, scale, width } = flat;
		const { cx, cy } = game;
		const step = scalew(scale!, r),
			offset = scalew(scale! / 2, r);
		var remaining = width * 2,
			a = left;

		sprite.tile('tl');
		while (remaining > 0) {
			if (remaining < step) {
				sprite.tile('tr');
				a = right - step;
			}

			var normal = a + offset + πHalf;
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
	}
}

const tipsSpawner = (flat: Flat) => {
	flat.attachments.push(new GrassTips(flat));
};

export default {
	bluegrass: {
		texture: textures.bluegrass,
		spawner: tipsSpawner,
	},
	bluegrass2: {
		texture: textures.bluegrass2,
		spawner: tipsSpawner,
	},
	cloud: { texture: textures.cloud },
};
