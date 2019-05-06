import Controller from '../Controller';
import gTimeScale from '../nums';

/*
Spritesheet Layout (72x72)

Stand	FlipL	Run1	Jump1	JFlipL	Throw1
		FlipR	Run2	Jump2	JFlipR	Throw2
				Run3	Jump3			Throw3
				Run4	Fall1			Throw4
				Run5	Fall2			Throw5
				Run6	Fall3			Throw6
				Run7	Land1			Throw7
				Run8	Land2
*/

const aStand = 'stand',
	aFlip = 'flip',
	aWalk = 'walk',
	aJump = 'jump',
	aFall = 'fall',
	aLand = 'land';

export default img =>
	new Controller({
		img,
		w: 76,
		h: 76,
		column: 0,
		row: 0,
		xo: -36,
		yo: -72,
		timer: 0,
		flip: false,
		facing: 1,
		state: '',
		flipOverride: (me, t) => {
			if (me.state === aFlip) {
				me.timer += t;
				if (me.timer < 75) return true;
			}
		},

		jump: (me, t) => {
			if (me.flipOverride(t)) return;

			if (me.play(aJump, 3, 0)) {
				me.timer += t;
				if (me.timer >= 75 && me.row < 2) {
					me.row++;
					me.timer = 0;
				}
			}
		},
		fall: (me, t) => {
			if (me.flipOverride(t)) return;

			if (me.play(aFall, 3, 3)) {
				me.timer += t;
				if (me.timer >= 75 && me.row < 5) {
					me.row++;
					me.timer = 0;
				}
			}
		},
		stand: (me, t) => {
			if (me.state === aFall || me.state == aLand) {
				if (!me.land(t)) return;
			}

			me.play(aStand, 0, 0);
		},
		face: (me, vr, grounded) => {
			if (vr != me.facing) {
				me.facing = vr;

				if (grounded) {
					if (vr > 0) me.play(aFlip, 1, 1);
					else me.play(aFlip, 1, 0);
				} else {
					if (vr > 0) me.play(aFlip, 4, 1);
					else me.play(aFlip, 4, 0);
				}

				me.flip = vr < 0;
			}
		},
		land: (me, t) => {
			if (me.play(aLand, 3, 6)) {
				me.timer += t;
				if (me.timer >= 75) {
					me.row++;
					if (me.row >= 8) return true;
					else me.timer = 0;
				}
			}

			return false;
		},
		walk: (me, t) => {
			if (me.state === aFall || me.state == aLand) {
				if (!me.land(t)) return;
			}

			if (me.flipOverride(t)) return;

			if (me.play(aWalk, 2, 0)) {
				me.timer += t;
				if (me.timer >= 85) {
					me.row++;
					me.timer = 0;
					if (me.row >= 8) me.row = 0;
				}
			}
		},
	});
