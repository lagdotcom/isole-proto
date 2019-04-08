export default function Controller(options) {
	Object.entries(options).forEach(e => {
		const [key, val] = e;
		if (typeof val === 'function') {
			this[key] = (x, y, z) => val(this, x, y, z);
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

Controller.prototype.draw = function(ctx) {
	const { w, c, h, r, flip, img, xo, yo } = this,
		sx = w * c,
		sy = h * r;

	if (flip) ctx.scale(-1, 1);
	ctx.drawImage(img, sx, sy, w, h, xo, yo, w, h);
	if (flip) ctx.scale(-1, 1);
};
