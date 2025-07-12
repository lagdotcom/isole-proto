import AnimController, { AnimSpecMap } from '../AnimController';
import { eAnimationEnded } from '../events';
import { Milliseconds } from '../flavours';

const aLand = 'land',
	aFall = 'fall';

const animations: AnimSpecMap = {
	idle: {
		loop: true,
		frames: [{ c: 0, r: 0, t: Infinity }],
	},

	near: {
		loop: true,
		frames: [
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
			{ c: 0, r: 3, t: 75 },
			{ c: 0, r: 4, t: 75 },
			{ c: 0, r: 5, t: 75 },
			{ c: 0, r: 6, t: 75 },
		],
	},

	jump: {
		extend: true,
		frames: [
			{ c: 1, r: 0, t: 75 },
			{ c: 1, r: 1, t: 75 },
		],
	},

	rise: {
		extend: true,
		frames: [
			{ c: 1, r: 2, t: 75 },
			{ c: 1, r: 3, t: 75 },
		],
	},

	[aFall]: {
		extend: true,
		frames: [
			{ c: 1, r: 4, t: 75 },
			{ c: 1, r: 5, t: 75 },
			{ c: 1, r: 6, t: 75 },
			{ c: 1, r: 7, t: 75 },
		],
	},

	[aLand]: {
		priority: 1,
		frames: [
			{ c: 1, r: 8, t: 75 },
			{ c: 1, r: 9, t: 75 },
		],
	},
};

export default class BusterController extends AnimController {
	oldVr: number;

	constructor(img: HTMLImageElement) {
		super({
			animations,
			img,
			w: 84,
			h: 56,
			xo: -42,
			yo: -52,
		});
		this.oldVr = 0;
	}

	animate(
		t: Milliseconds,
		vr: number,
		grounded: boolean,
		preJump: boolean,
		near: boolean
	) {
		if (!grounded) {
			if (vr > 0) this.play('rise');
			else this.play('fall');
		} else if (this.oldVr) {
			this.play('land');
		} else if (preJump) {
			this.play('jump');
		} else if (near) {
			this.play('near');
		} else {
			this.play('idle');
		}

		this.oldVr = vr;
		this.next(t);
	}

	idle(t: Milliseconds) {
		if (this.state === aFall || this.state === aLand)
			this.play(aLand, true, {
				[eAnimationEnded]: () => this.play('idle'),
			});
		else this.play('idle');

		this.next(t);
	}

	near(t: Milliseconds) {
		this.play('near');
		this.next(t);
	}

	jump(t: Milliseconds) {
		this.play('jump');
		this.next(t);
	}

	rise(t: Milliseconds) {
		this.play('rise');
		this.next(t);
	}

	fall(t: Milliseconds) {
		this.play(aFall);
		this.next(t);
	}
}
