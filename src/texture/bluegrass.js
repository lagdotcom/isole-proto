import TileController from './TileController';

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

const bluegrass2 = tcm(
	'tile.bluegrass',
	{
		tl: { c: 9, r: 5 },
		tm: { c: 10, r: 5, cycle: 4 },
		tr: { c: 14, r: 5 },
		ml: { c: 10, r: 9 },
		mm: { c: 11, r: 9, cycle: 2 },
		mr: { c: 13, r: 9 },
		bl: { c: 10, r: 10 },
		bm: { c: 11, r: 10, cycle: 2 },
		br: { c: 13, r: 10 },
	},
	{ w: 16, h: 16 }
);

const cloud = tcm(
	'tile.bluegrass',
	{
		tl: { c: 9, r: 2 },
		tm: { c: 10, r: 2, cycle: 4 },
		tr: { c: 14, r: 2 },
		ml: { c: 9, r: 2 },
		mm: { c: 10, r: 2, cycle: 4 },
		mr: { c: 14, r: 2 },
		bl: { c: 9, r: 2 },
		bm: { c: 10, r: 2, cycle: 4 },
		br: { c: 14, r: 2 },
	},
	{ w: 16, h: 16 }
);

export default {
	bluegrass,
	bluegrass2,
	cloud,
};
