import { Milliseconds, Pixels, SpriteColumn, SpriteRow } from './flavours';

export interface ControllerFrame {
	width: Pixels;
	height: Pixels;
	ox: Pixels;
	oy: Pixels;
	x: Pixels;
	y: Pixels;
}

export interface ControllerInit {
	c?: SpriteColumn;
	flip?: boolean;
	frames?: ControllerFrame[][];
	h: Pixels;
	img: HTMLImageElement;
	leftFlip?: boolean;
	r?: SpriteRow;
	w: Pixels;
	xo?: Pixels;
	yo?: Pixels;
}

function autoFrames(
	imgWidth: Pixels,
	imgHeight: Pixels,
	cellWidth: Pixels,
	cellHeight: Pixels
) {
	const frames: ControllerFrame[][] = [];
	const columns = imgWidth / cellWidth;
	const rows = imgHeight / cellHeight;

	for (let c = 0; c < columns; c++) {
		const column: ControllerFrame[] = [];
		frames.push(column);
		const x = c * cellWidth;

		for (let r = 0; r < rows; r++)
			column.push({
				x,
				y: r * cellHeight,
				ox: 0,
				oy: 0,
				width: cellWidth,
				height: cellHeight,
			});
	}

	return frames;
}

/** Image Controller */
export default class Controller {
	c: SpriteColumn;
	flip: boolean;
	frames: ControllerFrame[][];
	h: Pixels;
	img: HTMLImageElement;
	leftFlip: boolean;
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
				leftFlip: true,
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
		this.flip = !this.leftFlip;
	}

	/**
	 * Face left
	 */
	left(): void {
		this.flip = this.leftFlip;
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
	 * @param {Pixels} offsetX x offset
	 * @param {Pixels} offsetY y offset
	 */
	draw(
		ctx: CanvasRenderingContext2D,
		offsetX: Pixels = 0,
		offsetY: Pixels = 0
	): void {
		const { w, c, h, r, flip, img, xo, yo } = this;

		if (!this.frames)
			this.frames = autoFrames(
				this.img.naturalWidth,
				this.img.naturalHeight,
				w,
				h
			);

		const frame = this.frames[c][r];
		if (!frame) {
			console.warn(this.img.src, `missing sprite ${c},${r}`);
			return;
		}

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(
			img,
			frame.x,
			frame.y,
			frame.width,
			frame.height,
			xo + offsetX + frame.ox,
			yo + offsetY + frame.oy,
			frame.width,
			frame.height
		);
		if (flip) ctx.scale(-1, 1);
	}
}
