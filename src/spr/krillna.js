import Controller from '../Controller';
import { dRight, dDown, dLeft, dUp } from '../dirs';
import { pi, piHalf } from '../tools';

// MOVEMENT: Frame 1 = 120 ms, Frame 2 & 3 = 75 ms, Frame 4 = 120 ms, Frame 5 & 6 = 75 ms

const moveTimes = {
	0: 12,
	1: 7.5,
	2: 7.5,
	3: 12,
	4: 7.5,
	5: 7.5,
};

const xoffsets = {
	[dLeft]: -36,
	[dRight]: -36,
	[dUp]: -48,
	[dDown]: -24,
};

export default img =>
	new Controller({
		img,
		w: 72,
		h: 72,
		xo: -36,
		yo: -58,
		walktimer: 0,
		walkmax: 8,
		normal: 0,
		fliptwice: false,
		air: me => {
			me.stuck = null;
		},
		ground: me => {
			me.stuck = 'ground';
			me.normal = 0;
			me.fliptwice = false;
			me.yo = -58;
		},
		wleft: me => {
			me.stuck = 'wleft';
			me.normal = -piHalf;
			me.yo = -45;
		},
		wright: me => {
			me.stuck = 'wright';
			me.normal = piHalf;
			me.yo = -45;
		},
		ceiling: me => {
			me.stuck = 'ceiling';
			me.normal = pi;
			me.fliptwice = true;
			me.yo = -32;
		},
		walk: (me, t, dir) => {
			const { fliptwice, stuck } = me;

			me.xo = xoffsets[dir];

			if (dir === dRight) {
				me.flip = true;
				if (fliptwice) me.flip = !me.flip;
			} else if (dir === dLeft) {
				me.flip = false;
				if (fliptwice) me.flip = !me.flip;
			}

			if (me.play('walk', 0, 0)) {
				me.timer += t;
				if (me.timer >= moveTimes[me.r]) {
					me.timer = 0;
					me.r++;
					if (me.r >= 6) me.r = 0;
				}
			}
		},
	});
