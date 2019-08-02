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
	greenfl: decal('tile.bluegrass', 20, 634, 52, 72),
	redfl: decal('tile.bluegrass', 118, 634, 52, 72),
	bluefl: decal('tile.bluegrass', 212, 634, 52, 72),

	greensfl: decal('tile.bluegrass', 38, 740, 20, 28),
	redsfl: decal('tile.bluegrass', 102, 740, 20, 28),
	bluesfl: decal('tile.bluegrass', 166, 740, 20, 28),
	stalk: decal('tile.bluegrass', 232, 740, 12, 28),

	bluesqtree: decal('tile.bluegrass', 284, 484, 96, 222),
	bluerntree: decal('tile.bluegrass', 410, 496, 98, 208),
};
