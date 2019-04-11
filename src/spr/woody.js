import Controller from '../Controller';

export default img =>
	new Controller({
		img,
		w: 64,
		h: 64,
		column: 0,
		row: 0,
		xo: -32,
		yo: -64,
		ground: () => {},
		air: () => {},
		walk: () => {},
	});
