export default class Controller {
	constructor(options) {
		Object.entries(options).forEach(e => {
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

	right() {
		this.flip = false;
	}

	left() {
		this.flip = true;
	}

	play(state, column, row) {
		if (this.state !== state) {
			this.state = state;
			this.column = column;
			this.row = row;
			this.timer = 0;
			return false;
		} else {
			return true;
		}
	}

	draw(ctx) {
		const { w, column, h, row, flip, img, xo, yo } = this,
			sx = w * column,
			sy = h * row;

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(img, sx, sy, w, h, xo, yo, w, h);
		if (flip) ctx.scale(-1, 1);
	}
}
