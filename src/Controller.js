export default function Controller(options) {
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

Controller.prototype.right = function() {
	this.flip = false;
};

Controller.prototype.left = function() {
	this.flip = true;
};

Controller.prototype.play = function(state, column, row) {
	if (this.state !== state) {
		this.state = state;
		this.column = column;
		this.row = row;
		this.timer = 0;
		return false;
	} else {
		return true;
	}
};

Controller.prototype.draw = function(ctx) {
	const { w, column, h, row, flip, img, xo, yo } = this,
		sx = w * column,
		sy = h * row;

	if (flip) ctx.scale(-1, 1);
	ctx.drawImage(img, sx, sy, w, h, xo, yo, w, h);
	if (flip) ctx.scale(-1, 1);
};
