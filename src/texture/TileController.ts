import Controller from '../Controller';
import { TileName } from '../flavours';
import Texture, { TileDataMap } from '../Texture';

export default class TileController extends Controller implements Texture {
	count: number;
	tiles: TileDataMap;
	tileName: TileName;

	constructor(img: CanvasImageSource, tiles: TileDataMap, options = {}) {
		super(
			Object.assign(
				{},
				{
					img,
					w: 32,
					h: 32,
					count: 0,
				},
				options
			)
		);
		this.tiles = tiles;
	}

	tile(n: TileName): void {
		const t = this.tiles[n];
		if (t) {
			this.c = t.c;
			this.r = t.r;

			if (t.cycle) {
				if (this.tileName === n) {
					this.count = (this.count + 1) % t.cycle;
					this.c += this.count;
				} else {
					this.count = 0;
				}
			}
		}

		this.tileName = n;
	}

	reset() {
		this.count = 0;
	}
}
