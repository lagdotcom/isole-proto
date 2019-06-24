import Controller from '../Controller';

export default img =>
	new Controller({
		img,
		w: 56,
		h: 48,
		c: Math.floor(Math.random() * 2),
		xo: -28,
		yo: -39,
		walktimer: 0,
		walkmax: 8,
		ground: me => {
			if (me.r == 0 || me.r == 4) me.r++;
		},
		air: me => {
			me.r = 0;
		},
		walk: (me, t) => {
			me.walktimer += t;
			if (me.walktimer > me.walkmax) {
				me.walktimer -= me.walkmax;
				me.r++;
				if (me.r >= 8) me.r = 0;
			}
		},
	});
