import { ResourceName } from '../flavours';
import { TileDataMap } from '../Texture';
import TileController from './TileController';

const tcm = (resource: ResourceName, tiles: TileDataMap) => game =>
	new TileController(game.resources[resource], tiles);

const solid = tcm('tile.greybox', {
	tl: { c: 0, r: 0 },
	tm: { c: 1, r: 0 },
	tr: { c: 2, r: 0 },
});

const thin = tcm('tile.greybox', {
	tl: { c: 0, r: 1 },
	tm: { c: 1, r: 1 },
	tr: { c: 2, r: 1 },
});

const close = tcm('tile.greybox', {
	tl: { c: 0, r: 2 },
	tm: { c: 1, r: 2 },
	tr: { c: 2, r: 2 },
	ml: { c: 0, r: 3 },
	mm: { c: 1, r: 3 },
	mr: { c: 2, r: 3 },
	bl: { c: 0, r: 3 },
	bm: { c: 1, r: 3 },
	br: { c: 2, r: 3 },
});

const open = tcm('tile.greybox', {
	tl: { c: 0, r: 4 },
	tm: { c: 1, r: 4 },
	tr: { c: 2, r: 4 },
	ml: { c: 0, r: 5 },
	mm: { c: 1, r: 5 },
	mr: { c: 2, r: 5 },
	bl: { c: 0, r: 5 },
	bm: { c: 1, r: 5 },
	br: { c: 2, r: 5 },
});

export default {
	solid,
	thin,
	open,
	close,
};
