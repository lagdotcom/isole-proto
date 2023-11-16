import Controller from '../Controller';

// idle: 0,0 forever
// near player: 0,1-6 loop at 75ms
// launch: 1,0-1 at 75ms
// jump up: 1,2-3? at 75ms
// fall: 1,4?-7 at 75ms
// land: 1,8-9 at 75ms

const aLand = 'land',
	aFall = 'fall';

export default class BusterController extends Controller {
	constructor(img: CanvasImageSource) {
		super({
			img,
			w: 84,
			h: 56,
			xo: -42,
			yo: -52,
		});
	}

	land(t: number): boolean {
		if (this.show(aLand, 1, 8)) {
			this.timer += t;
			if (this.timer >= 75) {
				this.r++;
				if (this.r >= 10) return true;
				else this.timer = 0;
			}
		}

		return false;
	}

	idle(t: number) {
		if (this.state === aFall || this.state === aLand) {
			if (!this.land(t)) return;
		}

		this.show('idle', 0, 0);
	}

	near(t: number) {
		if (this.show('near', 0, 1)) {
			this.timer += t;
			if (this.timer >= 75) {
				this.r++;
				this.timer = 0;
				if (this.r === 7) this.r = 1;
			}
		}
	}

	jump(t: number) {
		if (this.show('jump', 1, 0)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 1) {
				this.r++;
				this.timer = 0;
			}
		}
	}

	rise(t: number) {
		if (this.show('rise', 1, 2)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 3) {
				this.r++;
				this.timer = 0;
			}
		}
	}

	fall(t: number) {
		if (this.show(aFall, 1, 4)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 7) {
				this.r++;
				this.timer = 0;
			}
		}
	}
}
