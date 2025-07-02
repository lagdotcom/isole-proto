import AnimController, { AnimSpecMap } from '../AnimController';
import { dDown, dLeft, dRight, dUp } from '../dirs';
import { Radians } from '../flavours';
import { π, πHalf } from '../tools';

const animations: AnimSpecMap = {
	move: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 120 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
			{ c: 0, r: 3, t: 120 },
			{ c: 0, r: 4, t: 75 },
			{ c: 0, r: 5, t: 75 },
		],
	},
};

const offsetX = {
	[dLeft]: -36,
	[dRight]: -36,
	[dUp]: -48,
	[dDown]: -24,
};

type KrillnaStuck = 'ground' | 'ceiling' | 'walkLeft' | 'walkRight';

export default class KrillnaController extends AnimController {
	walkTimer: number;
	walkMax: number;
	normal: Radians;
	stuck?: KrillnaStuck;
	flipTwice: boolean;

	constructor(img: CanvasImageSource) {
		super({
			animations,
			img,
			w: 72,
			h: 72,
			xo: -36,
			yo: -58,
		});
		this.walkTimer = 0;
		this.walkMax = 8;
		this.normal = 0;
		this.flipTwice = false;
		this.play('move');
	}

	air(): void {
		this.stuck = undefined;
	}

	ground(): void {
		this.stuck = 'ground';
		this.normal = 0;
		this.flipTwice = false;
		this.yo = -58;
	}

	walkLeft(): void {
		this.stuck = 'walkLeft';
		this.normal = -πHalf;
		this.yo = -45;
	}

	walkRight(): void {
		this.stuck = 'walkRight';
		this.normal = πHalf;
		this.yo = -45;
	}

	ceiling(): void {
		this.stuck = 'ceiling';
		this.normal = π;
		this.flipTwice = true;
		this.yo = -32;
	}

	walk(t: number, dir: 'L' | 'R' | 'U' | 'D'): void {
		const { flipTwice } = this;

		this.xo = offsetX[dir];

		if (dir === dRight) {
			this.flip = true;
			if (flipTwice) this.flip = !this.flip;
		} else if (dir === dLeft) {
			this.flip = false;
			if (flipTwice) this.flip = !this.flip;
		}

		this.next(t);
	}
}
