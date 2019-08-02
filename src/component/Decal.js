import Controller from '../Controller';
import { cIgnore } from '../colours';
import { gTimeScale } from '../nums';
import { anglewrap, cart, deg2rad, piHalf, scalew } from '../tools';
import { zBackground } from '../layers';

export default function Decal(game, options) {
	const sprite = game.objects[options.object];

	Object.assign(
		this,
		{
			isDecal: true,
			layer: zBackground,
			game,
			r: 0,
			a: 0,
			motion: 0,
			parallax: 0,
			sprite,
			width: sprite.w,
			height: sprite.h,
		},
		options
	);

	this.a = anglewrap(deg2rad(this.a));
	this.motion = deg2rad(this.motion / 100);
	this.parallax /= 10;
}

Decal.prototype.update = function(time) {
	const { a, game, motion, parallax } = this;
	var amod = 0;

	if (motion) {
		amod += time * motion;
	}

	if (parallax && game.player.alive) {
		amod += (game.player.va / gTimeScale + game.player.vfa) * parallax;
	}

	this.a = anglewrap(a + amod);
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
