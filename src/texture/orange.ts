import type { ResourceName } from '../flavours';
import type Game from '../Game';
import type { TileDataMap } from '../Texture';
import TileController from './TileController';

const tcm =
	(resource: ResourceName, tiles: TileDataMap, options?) => (game: Game) =>
		new TileController(game.resources[resource], tiles, {
			w: 32,
			h: 112,
			...options,
		});

const orange = tcm('tile.orangeplat', {
	tl: { c: 0, r: 0 },
	tm: { c: 0, r: 0 },
	tr: { c: 0, r: 0 },
	ml: { c: 0, r: 0 },
	mm: { c: 0, r: 0 },
	mr: { c: 0, r: 0 },
	bl: { c: 0, r: 0 },
	bm: { c: 0, r: 0 },
	br: { c: 0, r: 0 },
});

export default { orange };
