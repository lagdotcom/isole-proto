import Controller from '../Controller';
import { cWall } from '../colours';
import { anglewrap, cart, deg2rad, piHalf, scalew } from '../tools';
import { gHitboxScale, gWallGap } from '../nums';

const WallController = (img, c, r) =>
	new Controller({
		img,
		w: 32,
		h: 32,
		c,
		r,
		top: me => {
			me.r = r;
		},
		middle: me => {
			me.r = r + 1;
		},
		bottom: me => {
			me.r = r + 2;
		},
	});

export default function Wall(
	game,
	t,
	b,
	angle,
	direction,
	motion = 0,
	texture,
	texX = 0,
	texY = 0
) {
	const a = anglewrap(deg2rad(angle)),
		top = t - gWallGap,
		bottom = b + gWallGap;

	Object.assign(this, {
		game,
		top,
		bottom,
		t,
		b,
		a,
		direction,
		motion: deg2rad(motion / 100 || 0),
	});

	if (texture) {
		this.sprite = WallController(game.resources[texture], texX, texY);
		this.scale = this.sprite.w / gHitboxScale;

		if (direction < 0) {
			this.draw = this.drawLeft;
		} else {
			this.draw = this.drawRight;
		}
	}

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

Wall.prototype.drawLeft = function(c) {
	const { a, t, b, game, scale, sprite } = this;
	const { cx, cy } = game;
	const step = sprite.h;

	var remaining = t - b,
		r = t;

	sprite.top();
	while (remaining > 0) {
		if (remaining < step) {
			sprite.bottom();
			r = b + step;
		}

		const offset = scalew(scale / 2, r),
			amod = a - scalew(scale, r),
			normal = amod + offset + piHalf,
			{ x, y } = cart(amod, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);

		remaining -= step;
		r -= step;
		sprite.middle();
	}
};

Wall.prototype.drawRight = function(c) {
	const { a, t, b, game, scale, sprite } = this;
	const { cx, cy } = game;
	const step = sprite.h;

	var remaining = t - b,
		r = t;

	sprite.top();
	while (remaining > 0) {
		if (remaining < step) {
			sprite.bottom();
			r = b + step;
		}

		const offset = scalew(scale / 2, r),
			normal = a + offset + piHalf,
			{ x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);

		remaining -= step;
		r -= step;
		sprite.middle();
	}
};

Wall.prototype.drawHitbox = function(c) {
	const { game, sx, sy, ex, ey } = this;
	const { cx, cy } = game;

	c.strokeStyle = cWall;
	c.beginPath();
	c.moveTo(sx + cx, sy + cy);
	c.lineTo(ex + cx, ey + cy);
	c.stroke();
};
