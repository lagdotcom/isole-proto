export default class Controller {
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

	right() {
		this.flip = !this.leftflip;
	}

	left() {
		this.flip = this.leftflip;
	}

	play(state, column, row) {
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

	draw(ctx) {
		const { w, c, h, r, flip, img, xo, yo } = this,
			sx = w * c,
			sy = h * r;

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(img, sx, sy, w, h, xo, yo, w, h);
		if (flip) ctx.scale(-1, 1);
	}
}
