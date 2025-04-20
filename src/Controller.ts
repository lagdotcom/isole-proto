export interface ControllerInit {
	c?: number;
	flip?: boolean;
	h: number;
	img: CanvasImageSource;
	leftflip?: boolean;
	r?: number;
	w: number;
	xo?: number;
	yo?: number;
}

/** Image Controller */
export default class Controller {
	c: number;
	flip: boolean;
	h: number;
	img: CanvasImageSource;
	leftflip: boolean;
	r: number;
	state: string;
	timer: number;
	w: number;
	xo: number;
	yo: number;

	/**
	 * Make a new Controller
	 * @param {ControllerInit} options options
	 */
	constructor(options: ControllerInit) {
		Object.assign(
			this,
			{
				c: 0,
				r: 0,
				xo: 0,
				yo: 0,
				leftflip: true,
				flip: false,
				timer: 0,
			},
			options
		);
	}

	/**
	 * Face right
	 */
	right(): void {
		this.flip = !this.leftflip;
	}

	/**
	 * Face left
	 */
	left(): void {
		this.flip = this.leftflip;
	}

	/**
	 * Play or continue an animation
	 * @param {string} state name
	 * @param {number} column sprite column
	 * @param {number} row sprite row
	 * @returns {boolean} true if already playing that animation
	 */
	show(state: string, column: number, row: number): boolean {
		if (this.state !== state) {
			this.state = state;
			this.c = column;
			this.r = row;
			this.timer = 0;
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Draw the image
	 * @param {CanvasRenderingContext2D} ctx image context
	 * @param {number} xadd x offset
	 * @param {number} yadd y offset
	 */
	draw(ctx: CanvasRenderingContext2D, xadd = 0, yadd = 0): void {
		const { w, c, h, r, flip, img, xo, yo } = this,
			sx = w * c,
			sy = h * r;

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(img, sx, sy, w, h, xo + xadd, yo + yadd, w, h);
		if (flip) ctx.scale(-1, 1);
	}
}
