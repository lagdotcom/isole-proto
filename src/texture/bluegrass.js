import TileController from './TileController';

/* todo: grass tops */

const tcm = (resource, tiles) => game =>
	new TileController(game.resources[resource], tiles);

const bluegrass = tcm('tile.bluegrass', {
	tl: { c: 0, r: 1 },
	tm: { c: 1, r: 1 },
	tr: { c: 2, r: 1 },
	ml: { c: 0, r: 1 },
	mm: { c: 1, r: 1 },
	mr: { c: 2, r: 1 },
	bl: { c: 0, r: 1 },
	bm: { c: 1, r: 1 },
	br: { c: 2, r: 1 },
});

export default {
	bluegrass,
};
