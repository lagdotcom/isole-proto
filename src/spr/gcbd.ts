import Controller from '../Controller';

export default class GCBDController extends Controller {
	walktimer: number;
	walkmax: number;

	constructor(img: CanvasImageSource) {
		super({
			img,
			w: 56,
			h: 48,
			c: Math.floor(Math.random() * 2),
			xo: -28,
			yo: -39,
		});

		this.walktimer = 0;
		this.walkmax = 8;
	}

	ground(): void {
		if (this.r === 0 || this.r === 4) this.r++;
	}

	air(): void {
		this.r = 0;
	}

	walk(t: number): void {
		this.walktimer += t;
		if (this.walktimer > this.walkmax) {
			this.walktimer -= this.walkmax;
			this.r++;
			if (this.r >= 8) this.r = 0;
		}
	}
}
