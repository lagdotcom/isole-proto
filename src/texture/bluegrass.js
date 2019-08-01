import TileController from './TileController';

/* todo: grass tops */

const tcm = (resource, tiles, options) => game =>
	new TileController(game.resources[resource], tiles, options);

const bluegrass = tcm(
	'tile.bluegrass',
	{
		tl: { c: 1, r: 5 },
		tm: { c: 2, r: 5, cycle: 4 },
		tr: { c: 6, r: 5 },
		ml: { c: 2, r: 9 },
		mm: { c: 3, r: 9, cycle: 4 },
		mr: { c: 5, r: 9 },
		bl: { c: 2, r: 10 },
		bm: { c: 3, r: 10, cycle: 2 },
		br: { c: 5, r: 10 },
	},
	{ w: 16, h: 16 }
);

export default {
	bluegrass,
};
