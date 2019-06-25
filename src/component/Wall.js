import Controller from '../Controller';
import { cWall } from '../colours';
import { anglewrap, cart, deg2rad, piHalf, scalew } from '../tools';
import { gHitboxScale, gWallGap } from '../nums';
import { zStructure } from '../layers';

export default function Wall(
	game,
	t,
	b,
	angle,
	direction,
	motion = 0,
	texture
) {
	const a = anglewrap(deg2rad(angle)),
		top = t - gWallGap,
		bottom = b + gWallGap;

	Object.assign(this, {
		isWall: true,
		layer: zStructure,
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
		this.sprite = game.textures[texture];
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

	sprite.tile('tr');
	while (remaining > 0) {
		if (remaining < step) {
			sprite.tile('br');
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
		sprite.tile('mr');
	}
};

Wall.prototype.drawRight = function(c) {
	const { a, t, b, game, scale, sprite } = this;
	const { cx, cy } = game;
	const step = sprite.h;

	var remaining = t - b,
		r = t;

	sprite.tile('tl');
	while (remaining > 0) {
		if (remaining < step) {
			sprite.tile('bl');
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
		sprite.tile('ml');
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
