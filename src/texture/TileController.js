import Controller from '../Controller';

export default class TileController extends Controller {
	constructor(img, tiles, options = {}) {
		super(
			Object.assign(
				{},
				{
					img,
					w: 32,
					h: 32,
				},
				options
			)
		);
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
