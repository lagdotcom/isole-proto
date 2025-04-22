import Controller from '../Controller';
import { dDown, dLeft, dRight, dUp } from '../dirs';
import { Radians } from '../flavours';
import { π, πHalf } from '../tools';

// MOVEMENT: Frame 1 = 120 ms, Frame 2 & 3 = 75 ms, Frame 4 = 120 ms, Frame 5 & 6 = 75 ms

const moveTimes = {
	0: 12,
	1: 7.5,
	2: 7.5,
	3: 12,
	4: 7.5,
	5: 7.5,
};

const offsetX = {
	[dLeft]: -36,
	[dRight]: -36,
	[dUp]: -48,
	[dDown]: -24,
};

type KrillnaStuck = 'ground' | 'ceiling' | 'walkLeft' | 'walkRight';

export default class KrillnaController extends Controller {
	walkTimer: number;
	walkMax: number;
	normal: Radians;
	stuck?: KrillnaStuck;
	flipTwice: boolean;

	constructor(img: CanvasImageSource) {
		super({
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

		if (this.show('walk', 0, 0)) {
			this.timer += t;
			if (this.timer >= moveTimes[this.r]) {
				this.timer = 0;
				this.r++;
				if (this.r >= 6) this.r = 0;
			}
		}
	}
}
