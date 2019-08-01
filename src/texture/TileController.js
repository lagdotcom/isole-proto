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

			if (t.cycle) {
				if (this.tname === n) {
					this.count = (this.count + 1) % t.cycle;
					this.c += this.count;
				} else {
					this.count = 0;
				}
			}
		}

		this.tname = n;
	}
}
