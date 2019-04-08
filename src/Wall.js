import { anglewrap, cart, deg2rad } from './tools';
import { gWallGap } from './nums';

export default function Wall(game, t, b, angle, direction, motion) {
	const a = anglewrap(deg2rad(angle)),
		top = t - gWallGap,
		bottom = b + gWallGap;

	Object.assign(this, {
		game,
		top,
		bottom,
		a,
		direction,
		motion: deg2rad(motion),
	});

	this.updateXY();
}

Wall.prototype.updateXY = function() {
	const start = cart(this.a, this.top),
		end = cart(this.a, this.bottom);
	this.sx = start.x;
	this.sy = start.y;
	this.ex = end.x;
	this.ey = end.y;
};

Wall.prototype.update = function(time) {
	if (this.motion) {
		this.a = anglewrap(this.a + time * this.motion);
		this.updateXY();
	}
};

Wall.prototype.draw = function(c) {
	const { game, sx, sy, ex, ey } = this;
	const { cx, cy } = game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.moveTo(sx + cx, sy + cy);
	c.lineTo(ex + cx, ey + cy);
	c.stroke();
};
