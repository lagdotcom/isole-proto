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
				Run7	Land1
				Run8	Land2
*/

const aStand = 'stand',
	aFlip = 'flip',
	aWalk = 'walk',
	aJump = 'jump',
	aFall = 'fall',
	aLand = 'land',
	aThrow = 'throw';

const tFlip = 75,
	tJump = 75,
	tFall = 75,
	tLand = 75,
	tWalk = 85,
	tThrow = 75,
	tThrowLast = 150;

export default class WoodyController extends Controller {
	constructor(img) {
		super({
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
		});
	}

	flipOverride(t) {
		if (this.state === aFlip) {
			this.timer += t;
			if (this.timer < tFlip) return true;
		}
	}

	throwOverride(t) {
		if (this.state === aThrow) {
			this.timer += t;
			if (
				(this.row === 5 && this.timer >= tThrowLast) ||
				(this.row < 5 && this.timer >= tThrow)
			) {
				this.row++;
				this.timer = 0;
				return this.row < 6;
			}
			return true;
		}
	}

	checkOverrides(t) {
		if (this.flipOverride(t)) return true;
		if (this.throwOverride(t)) return true;
	}

	jump(t) {
		if (this.checkOverrides(t)) return;

		if (this.play(aJump, 3, 0)) {
			this.timer += t;
			if (this.timer >= tJump && this.row < 2) {
				this.row++;
				this.timer = 0;
			}
		}
	}

	fall(t) {
		if (this.checkOverrides(t)) return;

		if (this.play(aFall, 3, 3)) {
			this.timer += t;
			if (this.timer >= tFall && this.row < 5) {
				this.row++;
				this.timer = 0;
			}
		}
	}

	stand(t) {
		if (this.checkOverrides(t)) return;

		if (this.state === aFall || this.state == aLand) {
			if (!this.land(t)) return;
		}

		this.play(aStand, 0, 0);
	}

	face(vr, grounded) {
		if (vr != this.facing) {
			this.facing = vr;

			if (grounded) {
				if (vr > 0) this.play(aFlip, 1, 1);
				else this.play(aFlip, 1, 0);
			} else {
				if (vr > 0) this.play(aFlip, 4, 1);
				else this.play(aFlip, 4, 0);
			}

			this.flip = vr < 0;
		}
	}

	land(t) {
		if (this.play(aLand, 3, 6)) {
			this.timer += t;
			if (this.timer >= tLand) {
				this.row++;
				if (this.row >= 8) return true;
				else this.timer = 0;
			}
		}

		return false;
	}

	walk(t) {
		if (this.state === aFall || this.state == aLand) {
			if (!this.land(t)) return;
		}

		if (this.checkOverrides(t)) return;

		if (this.play(aWalk, 2, 0)) {
			this.timer += t;
			if (this.timer >= tWalk) {
				this.row++;
				this.timer = 0;
				if (this.row >= 8) this.row = 0;
			}
		}
	}

	throw(t) {
		this.play(aThrow, 5, 0);
	}
}
