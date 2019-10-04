/** Image Controller */
export default class Controller {
	/**
	 * Make a new Controller
	 * @param {ControllerOptions} options options
	 */
	constructor(options) {
		Object.entries(
			Object.assign(
				{},
				{ c: 0, r: 0, xo: 0, yo: 0, leftflip: true, flip: false },
				options
			)
		).forEach(e => {
			const [key, val] = e;
			if (typeof val === 'function') {
				this[key] = function() {
					return val(this, ...arguments);
				};
			} else {
				this[key] = val;
			}
		});
	}

	/**
	 * Face right
	 */
	right() {
		this.flip = !this.leftflip;
	}

	/**
	 * Face left
	 */
	left() {
		this.flip = this.leftflip;
	}

	/**
	 * Play or continue an animation
	 * @param {string} state name
	 * @param {number} column sprite column
	 * @param {number} row sprite row
	 * @returns {boolean} true if already playing that animation
	 */
	show(state, column, row) {
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
	 */
	draw(ctx) {
		const { w, c, h, r, flip, img, xo, yo } = this,
			sx = w * c,
			sy = h * r;

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(img, sx, sy, w, h, xo, yo, w, h);
		if (flip) ctx.scale(-1, 1);
	}
}
