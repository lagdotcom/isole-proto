import DecalController from './DecalController';

const decal = (resource, x, y, w, h) => (game, options) =>
	new DecalController(game.resources[resource], {
		x,
		y,
		w,
		h,
		xo: -w / 2,
		yo: -h,
		...options,
	});

export default {
	greenfl: decal('tile.bluegrass', 10, 317, 26, 36),
	redfl: decal('tile.bluegrass', 59, 317, 26, 36),
	bluefl: decal('tile.bluegrass', 106, 317, 26, 36),

	greensfl: decal('tile.bluegrass', 19, 370, 10, 14),
	redsfl: decal('tile.bluegrass', 51, 370, 10, 14),
	bluesfl: decal('tile.bluegrass', 83, 370, 10, 14),
	stalk: decal('tile.bluegrass', 116, 370, 6, 14),

	bluesqtree: decal('tile.bluegrass', 142, 242, 48, 111),
	bluerntree: decal('tile.bluegrass', 205, 248, 49, 104),
};
