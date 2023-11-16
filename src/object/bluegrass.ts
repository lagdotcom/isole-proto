import Game from '../Game';
import DecalController from './DecalController';

const decal =
	(resource: string, x: number, y: number, w: number, h: number) =>
	(game: Game, options?: any) =>
		new DecalController(game.resources[resource], {
			x,
			y,
			w,
			h,
			xo: -w / 2,
			yo: -h,
			...(options || {}),
		});

export default {
	greenfl: decal('tile.bluegrass', 20, 634, 52, 72),
	redfl: decal('tile.bluegrass', 118, 634, 52, 72),
	bluefl: decal('tile.bluegrass', 212, 634, 52, 72),

	greensfl: decal('tile.bluegrass', 38, 740, 20, 28),
	redsfl: decal('tile.bluegrass', 102, 740, 20, 28),
	bluesfl: decal('tile.bluegrass', 166, 740, 20, 28),
	stalk: decal('tile.bluegrass', 232, 740, 12, 28),

	bluesqtree: decal('tile.bluegrass', 284, 484, 96, 222),
	bluerntree: decal('tile.bluegrass', 410, 496, 98, 208),

	twisttree: decal('tile.rwbgtree', 0, 64, 576, 800),
	fltree: decal('tile.rwbgtree', 608, 0, 640, 832),

	sqrock: decal('tile.rwbgrocks', 0, 0, 320, 144),
	rnrock: decal('tile.rwbgrocks', 352, 32, 224, 112),

	fartree1: decal('tile.rwfartrees', 32, 32, 384, 672),
	fartree2: decal('tile.rwfartrees', 480, 64, 342, 640),
	fartree3: decal('tile.rwfartrees', 864, 32, 320, 672),

	bgcanopy: decal('tile.rwbgcanopy', 32, 0, 1312, 416),
};
