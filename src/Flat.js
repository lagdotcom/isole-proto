import Controller from './Controller';
import { gHitboxScale } from './nums';
import { anglewrap, cart, deg2rad, piHalf, scalew } from './tools';

const FlatController = (img, c, r) =>
	new Controller({
		img,
		w: 32,
		h: 32,
		column: c,
		row: r,
		xo: 0,
		yo: 0,
		left: me => {
			me.column = c;
		},
		middle: me => {
			me.column = c + 1;
		},
		right: me => {
			me.column = c + 2;
		},
	});

export default function Flat(
	game,
	height,
	angle,
	width,
	motion,
	texture,
	texX = 0,
	texY = 0
) {
	Object.assign(this, {
		game,
		r: height,
		a: deg2rad(angle),
		width: deg2rad(width) / 2,
		motion: deg2rad(motion || 0),
	});

	this.left = this.a - this.width;
	this.right = this.a + this.width;

	if (texture) {
		this.sprite = FlatController(texture, texX, texY);
		this.scale = this.sprite.w / gHitboxScale;
	}
}

Flat.prototype.update = function(time) {
	if (this.motion) {
		this.a = anglewrap(this.a + time * this.motion);
		this.left = this.a - this.width;
		this.right = this.a + this.width;
	}
};

Flat.prototype.draw = function(c) {
	if (!this.sprite) return;

	const { left, right, r, game, scale, sprite } = this;
	const { cx, cy } = game;
	const step = scalew(scale, r),
		offset = scalew(scale / 2, r);
	var remaining = this.width * 2,
		a = left;

	sprite.left();
	while (remaining > 0) {
		if (remaining < step) {
			sprite.right();
			a = this.right - step;
		}

		var normal = a + offset + piHalf;
		var { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);

		remaining -= step;
		a += step;
		sprite.middle();
	}
};

Flat.prototype.drawHitbox = function(c) {
	const { r, a, width, left, right } = this;
	const { cx, cy } = this.game;

	c.strokeStyle = '#888888';
	c.beginPath();
	c.arc(cx, cy, r, left, right);
	c.stroke();
};
