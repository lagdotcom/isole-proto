import Controller from '../Controller';

export default img =>
	new Controller({
		img,
		w: 16,
		h: 16,
		column: Math.floor(Math.random() * 2),
		row: 0,
		xo: -8,
		yo: -16,
		walktimer: 0,
		walkmax: 8,
		air: () => {},
		ground: me => {
			me.row = 0;
		},
		right: me => {
			me.row = 1;
		},
		ceiling: me => {
			me.row = 2;
		},
		left: me => {
			me.row = 3;
		},
		walk: (me, t) => {
			me.walktimer += t;
			if (me.walktimer > me.walkmax) {
				me.walktimer -= me.walkmax;
				me.column = 1 - me.column;
			}
		},
	});
