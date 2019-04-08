import Controller from '../Controller';

export default img =>
	new Controller({
		img,
		w: 28,
		h: 28,
		column: 0,
		row: 0,
		xo: -14,
		yo: -28,
		ground: () => {},
		air: () => {},
		walk: () => {},
	});
