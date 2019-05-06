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
		column: Math.floor(Math.random() * 2),
		row: 0,
		xo: -42,
		yo: -52,
		timer: 0,

		land: (me, t) => {
			if (me.play(aLand, 1, 8)) {
				me.timer += t;
				if (me.timer >= 75) {
					me.row++;
					if (me.row >= 10) return true;
					else me.timer = 0;
				}
			}

			return false;
		},

		idle: (me, t) => {
			if (me.state === aFall || me.state == aLand) {
				if (!me.land(t)) return;
			}

			me.play('idle', 0, 0);
		},

		near: (me, t) => {
			if (me.play('near', 0, 1)) {
				me.timer += t;
				if (me.timer >= 75) {
					me.row++;
					me.timer = 0;
					if (me.row === 7) me.row = 1;
				}
			}
		},

		jump: (me, t) => {
			if (me.play('jump', 1, 0)) {
				me.timer += t;
				if (me.timer >= 75 && me.row < 1) {
					me.row++;
					me.timer = 0;
				}
			}
		},

		rise: (me, t) => {
			if (me.play('rise', 1, 2)) {
				me.timer += t;
				if (me.timer >= 75 && me.row < 3) {
					me.row++;
					me.timer = 0;
				}
			}
		},

		fall: (me, t) => {
			if (me.play(aFall, 1, 4)) {
				me.timer += t;
				if (me.timer >= 75 && me.row < 7) {
					me.row++;
					me.timer = 0;
				}
			}
		},
	});
