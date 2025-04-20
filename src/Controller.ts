import { Milliseconds, Pixels, SpriteColumn, SpriteRow } from './flavours';

export interface ControllerInit {
	c?: SpriteColumn;
	flip?: boolean;
	h: Pixels;
	img: CanvasImageSource;
	leftflip?: boolean;
	r?: SpriteRow;
	w: Pixels;
	xo?: Pixels;
	yo?: Pixels;
}

/** Image Controller */
export default class Controller {
	c: SpriteColumn;
	flip: boolean;
	h: Pixels;
	img: CanvasImageSource;
	leftflip: boolean;
	r: SpriteRow;
	state: string;
	timer: Milliseconds;
	w: Pixels;
	xo: Pixels;
	yo: Pixels;

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
	 * @param {SpriteColumn} column sprite column
	 * @param {SpriteRow} row sprite row
	 * @returns {boolean} true if already playing that animation
	 */
	show(state: string, column: SpriteColumn, row: SpriteRow): boolean {
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
	 * @param {Pixels} xadd x offset
	 * @param {Pixels} yadd y offset
	 */
	draw(
		ctx: CanvasRenderingContext2D,
		xadd: Pixels = 0,
		yadd: Pixels = 0
	): void {
		const { w, c, h, r, flip, img, xo, yo } = this,
			sx: Pixels = w * c,
			sy: Pixels = h * r;

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(img, sx, sy, w, h, xo + xadd, yo + yadd, w, h);
		if (flip) ctx.scale(-1, 1);
	}
}
