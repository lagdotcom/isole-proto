import Controller from '../Controller';

export default img =>
	new Controller({
		img,
		w: 56,
		h: 48,
		column: Math.floor(Math.random() * 2),
		row: 0,
		xo: -28,
		yo: -39,
		walktimer: 0,
		walkmax: 8,
		ground: me => {
			if (me.row == 0 || me.row == 4) me.row++;
		},
		air: me => {
			me.row = 0;
		},
		walk: (me, t) => {
			me.walktimer += t;
			if (me.walktimer > me.walkmax) {
				me.walktimer -= me.walkmax;
				me.row++;
				if (me.row >= 8) me.row = 0;
			}
		},
	});
