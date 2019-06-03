import Controller from '../Controller';

class TileController extends Controller {
	constructor(img, tiles) {
		super({
			img,
			w: 32,
			h: 32,
		});
		this.tiles = tiles;
	}

	tile(n) {
		const t = this.tiles[n];
		if (t) {
			this.c = t.c;
			this.r = t.r;
		}
	}
}

const tcm = (resource, tiles) => game =>
	new TileController(game.resources[resource], tiles);

const grass = tcm('tile.grass', {
	tl: { c: 0, r: 0 },
	tm: { c: 1, r: 0 },
	tr: { c: 2, r: 0 },
	ml: { c: 0, r: 1 },
	mm: { c: 1, r: 1 },
	mr: { c: 2, r: 1 },
	bl: { c: 0, r: 2 },
	bm: { c: 1, r: 2 },
	br: { c: 2, r: 2 },
});

const grass2 = tcm('tile.grass', {
	tl: { c: 0, r: 7 },
	tm: { c: 1, r: 7 },
	tr: { c: 2, r: 7 },
	ml: { c: 0, r: 8 },
	mm: { c: 1, r: 8 },
	mr: { c: 2, r: 8 },
	bl: { c: 0, r: 9 },
	bm: { c: 1, r: 9 },
	br: { c: 2, r: 9 },
});

export default {
	grass,
	grass2,
};
