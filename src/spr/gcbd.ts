import Controller from '../Controller';

export default class GCBDController extends Controller {
	walkTimer: number;
	walkMax: number;

	constructor(img: HTMLImageElement) {
		super({
			img,
			w: 56,
			h: 48,
			c: Math.floor(Math.random() * 2),
			xo: -28,
			yo: -39,
		});

		this.walkTimer = 0;
		this.walkMax = 8;
	}

	ground(): void {
		if (this.r === 0 || this.r === 4) this.r++;
	}

	air(): void {
		this.r = 0;
	}

	walk(t: number): void {
		this.walkTimer += t;
		if (this.walkTimer > this.walkMax) {
			this.walkTimer -= this.walkMax;
			this.r++;
			if (this.r >= 8) this.r = 0;
		}
	}
}
