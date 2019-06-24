import AnimController from '../AnimController';
import {
	aStand,
	aFlip,
	aJFlip,
	aWalk,
	aJump,
	aFall,
	aLand,
	aThrow,
} from '../anims';
import { eThrow } from '../events';

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

const tFlip = 75,
	tJump = 75,
	tFall = 75,
	tLand = 75,
	tWalk = 85,
	tThrow = 75,
	tThrowLast = 150;

const animations = {
	[aStand]: {
		extend: true,
		frames: [{ c: 0, r: 0, t: 1000 }],
	},

	[aFlip]: {
		priority: 5,
		frames: [{ c: 1, r: 0, t: 75 }],
	},

	[aWalk]: {
		loop: true,
		frames: [
			{ c: 2, r: 0, t: 85 },
			{ c: 2, r: 1, t: 85 },
			{ c: 2, r: 2, t: 85 },
			{ c: 2, r: 3, t: 85 },
			{ c: 2, r: 4, t: 85 },
			{ c: 2, r: 5, t: 85 },
			{ c: 2, r: 6, t: 85 },
			{ c: 2, r: 7, t: 85 },
		],
	},

	[aJump]: {
		extend: true,
		frames: [
			{ c: 3, r: 0, t: 75 },
			{ c: 3, r: 1, t: 75 },
			{ c: 3, r: 2, t: 1000 },
		],
	},

	[aFall]: {
		extend: true,
		frames: [
			{ c: 3, r: 3, t: 75 },
			{ c: 3, r: 4, t: 75 },
			{ c: 3, r: 5, t: 1000 },
		],
	},

	[aLand]: {
		priority: 1,
		frames: [{ c: 3, r: 6, t: 75 }, { c: 3, r: 7, t: 75 }],
	},

	[aJFlip]: {
		priority: 5,
		frames: [{ c: 4, r: 0, t: 75 }],
	},

	[aThrow]: {
		priority: 2,
		flags: { preventTurn: true },
		frames: [
			{ c: 5, r: 0, t: 75 },
			{ c: 5, r: 1, t: 75 },
			{ c: 5, r: 2, t: 75 },
			{ c: 5, r: 3, t: 75, event: eThrow },
			{ c: 5, r: 4, t: 75 },
			{ c: 5, r: 5, t: 150 },
		],
	},
};

export default class WoodyController extends AnimController {
	constructor(img) {
		super({
			animations,
			img,
			w: 80,
			h: 80,
			xo: -40,
			yo: -74,
			facing: 1,
		});
	}

	jump(t) {
		this.play(aJump);
		this.next(t);
	}

	fall(t) {
		this.play(aFall);
		this.next(t);
	}

	stand(t) {
		if (this.a === aFall) {
			this.play(aLand);
		}

		this.play(aStand);
		this.next(t);
	}

	face(vr, grounded) {
		if (vr != this.facing) {
			this.facing = vr;

			if (grounded) {
				this.play(aFlip);
			} else {
				this.play(aJFlip);
			}

			this.flip = vr < 0;
		}
	}

	walk(t) {
		if (this.a === aFall) {
			this.play(aLand);
		}

		this.play(aWalk);
		this.next(t);
	}

	throw() {
		this.play(aThrow);
	}
}
