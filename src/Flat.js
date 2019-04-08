import { anglewrap, deg2rad } from './tools';

export default function Flat(game, height, angle, width, motion) {
	Object.assign(this, {
		game,
		r: height,
		a: deg2rad(angle),
		width: deg2rad(width) / 2,
		motion: deg2rad(motion || 0),
	});
}

Flat.prototype.update = function(time) {
	if (this.motion) {
		this.a = anglewrap(this.a + time * this.motion);
	}
};

Flat.prototype.draw = function(c) {
	const { r, a, width } = this;
	const { cx, cy } = this.game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.arc(cx, cy, r, a - width, a + width);
	c.stroke();
};
