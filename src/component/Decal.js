import Controller from '../Controller';
import { cIgnore } from '../colours';
import { anglewrap, cart, deg2rad, piHalf, scalew } from '../tools';
import { zBackground } from '../layers';

export default function Decal(game, height, angle, motion, object) {
	const sprite = game.objects[object];

	Object.assign(this, {
		isDecal: true,
		layer: zBackground,
		game,
		r: height,
		a: anglewrap(deg2rad(angle)),
		motion: deg2rad(motion / 100 || 0),
		object,
		sprite,
		width: sprite.w,
		height: sprite.h,
	});
}

Decal.prototype.update = function(time) {
	if (this.motion) {
		this.a = anglewrap(this.a + time * this.motion);
		this.left = this.a - this.width;
		this.right = this.a + this.width;
	}
};

Decal.prototype.draw = function(c) {
	const { a, r, game, sprite } = this;
	const { cx, cy } = game;
	const normal = a + piHalf;

	const { x, y } = cart(a, r);

	c.translate(x + cx, y + cy);
	c.rotate(normal);

	sprite.draw(c);

	c.rotate(-normal);
	c.translate(-x - cx, -y - cy);
};

Decal.prototype.drawHitbox = function(c) {
	const { game } = this;
	const { cx, cy } = game;
	const { b, t } = this.getHitbox();

	c.strokeStyle = cIgnore;
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();
};

Decal.prototype.getHitbox = function() {
	const { r, a, width, height } = this;
	const baw = scalew(width, r),
		taw = scalew(width, r + height);

	return {
		b: {
			r: r,
			aw: baw,
			al: a - baw,
			ar: a + baw,
		},
		t: {
			r: r + height,
			aw: taw,
			al: a - taw,
			ar: a + taw,
		},
	};
};
