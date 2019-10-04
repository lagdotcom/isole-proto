import Controller from '../Controller';

// idle: 0,0 forever
// near player: 0,1-6 loop at 75ms
// launch: 1,0-1 at 75ms
// jump up: 1,2-3? at 75ms
// fall: 1,4?-7 at 75ms
// land: 1,8-9 at 75ms

const aLand = 'land',
	aFall = 'fall';

export default img =>
	new Controller({
		img,
		w: 84,
		h: 56,
		xo: -42,
		yo: -52,
		timer: 0,

		land: (me, t) => {
			if (me.show(aLand, 1, 8)) {
				me.timer += t;
				if (me.timer >= 75) {
					me.r++;
					if (me.r >= 10) return true;
					else me.timer = 0;
				}
			}

			return false;
		},

		idle: (me, t) => {
			if (me.state === aFall || me.state == aLand) {
				if (!me.land(t)) return;
			}

			me.show('idle', 0, 0);
		},

		near: (me, t) => {
			if (me.show('near', 0, 1)) {
				me.timer += t;
				if (me.timer >= 75) {
					me.r++;
					me.timer = 0;
					if (me.r === 7) me.r = 1;
				}
			}
		},

		jump: (me, t) => {
			if (me.show('jump', 1, 0)) {
				me.timer += t;
				if (me.timer >= 75 && me.r < 1) {
					me.r++;
					me.timer = 0;
				}
			}
		},

		rise: (me, t) => {
			if (me.show('rise', 1, 2)) {
				me.timer += t;
				if (me.timer >= 75 && me.r < 3) {
					me.r++;
					me.timer = 0;
				}
			}
		},

		fall: (me, t) => {
			if (me.show(aFall, 1, 4)) {
				me.timer += t;
				if (me.timer >= 75 && me.r < 7) {
					me.r++;
					me.timer = 0;
				}
			}
		},
	});
