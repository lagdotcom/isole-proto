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

type KrillnaStuck = 'ground' | 'ceiling' | 'wleft' | 'wright';

export default class KrillnaController extends Controller {
	walktimer: number;
	walkmax: number;
	normal: number;
	stuck?: KrillnaStuck;
	fliptwice: boolean;

	constructor(img: CanvasImageSource) {
		super({
			img,
			w: 72,
			h: 72,
			xo: -36,
			yo: -58,
		});
		this.walktimer = 0;
		this.walkmax = 8;
		this.normal = 0;
		this.fliptwice = false;
	}

	air(): void {
		this.stuck = undefined;
	}

	ground(): void {
		this.stuck = 'ground';
		this.normal = 0;
		this.fliptwice = false;
		this.yo = -58;
	}

	wleft(): void {
		this.stuck = 'wleft';
		this.normal = -piHalf;
		this.yo = -45;
	}

	wright(): void {
		this.stuck = 'wright';
		this.normal = piHalf;
		this.yo = -45;
	}

	ceiling(): void {
		this.stuck = 'ceiling';
		this.normal = pi;
		this.fliptwice = true;
		this.yo = -32;
	}

	walk(t: number, dir: string): void {
		const { fliptwice, stuck } = this;

		this.xo = xoffsets[dir];

		if (dir === dRight) {
			this.flip = true;
			if (fliptwice) this.flip = !this.flip;
		} else if (dir === dLeft) {
			this.flip = false;
			if (fliptwice) this.flip = !this.flip;
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
