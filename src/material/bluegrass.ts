import Flat from '../component/Flat';
import DrawnComponent from '../DrawnComponent';
import { DisplayLayer, Multiplier, Pixels } from '../flavours';
import Game from '../Game';
import { zDecal } from '../layers';
import { getZ } from '../nums';
import { draw3D } from '../rendering';
import textures from '../texture/bluegrass';
import TileController from '../texture/TileController';
import { scaleWidth } from '../tools';

const bluegrassTips = game =>
	new TileController(game.resources['tile.bluegrass'], {
		tl: { c: 1, r: 4 },
		tm: { c: 2, r: 4, cycle: 4 },
		tr: { c: 6, r: 4 },
	});

class GrassTips implements DrawnComponent {
	back: boolean;
	flat: Flat;
	game: Game;
	layer: DisplayLayer;
	r: Pixels;
	sprite: TileController;
	z: Multiplier;

	constructor(flat: Flat) {
		Object.assign(this, {
			flat,
			back: flat.back,
			z: getZ(flat.back),
			game: flat.game,
			layer: zDecal,
			sprite: bluegrassTips(flat.game),
		});

		this.r = flat.r + 30 * this.z;
	}

	draw(c: CanvasRenderingContext2D): void {
		const { flat, game, r, z, sprite } = this;
		const { left, right, scale, width } = flat;
		const step = scaleWidth(scale, r, z),
			rotation = scaleWidth(scale / 2, r, z);
		let remaining = width * 2,
			a = left;

		sprite.tile('tl');
		while (remaining > 0) {
			if (remaining < step) {
				sprite.tile('tr');
				a = right - step;
			}

			draw3D(c, { a, r, z, game, sprite, rotation });

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
