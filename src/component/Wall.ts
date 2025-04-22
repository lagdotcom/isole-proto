import { cWall } from '../colours';
import DrawnComponent from '../DrawnComponent';
import {
	Degrees,
	DisplayLayer,
	Milliseconds,
	Pixels,
	Radians,
	TextureName,
} from '../flavours';
import Game from '../Game';
import { zStructure } from '../layers';
import { gHitboxScale, gWallGap } from '../nums';
import Texture from '../Texture';
import { cart, deg2rad, scaleWidth, wrapAngle, πHalf } from '../tools';
import Flat from './Flat';

export default class Wall implements DrawnComponent {
	a: Radians;
	b: Pixels;
	bottom: Pixels;
	ceiling?: Flat;
	direction: 1 | -1;
	ex: Pixels;
	ey: Pixels;
	floor?: Flat;
	game: Game;
	isWall: true;
	layer: DisplayLayer;
	motion: number;
	scale: number;
	sprite: Texture;
	sx: Pixels;
	sy: Pixels;
	r: Pixels; // used for angleCollides()
	t: Pixels;
	top: Pixels;
	width: Radians; // used for angleCollides()

	draw: (c: CanvasRenderingContext2D) => void;

	constructor(
		game: Game,
		t: Pixels,
		b: Pixels,
		angle: Degrees,
		direction: 1 | -1,
		motion = 0,
		texture?: TextureName
	) {
		const a = wrapAngle(deg2rad(angle)),
			top: Pixels = t - gWallGap,
			bottom: Pixels = b + gWallGap;

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
			motion: deg2rad(motion / 100),
			r: b,
			width: 0,
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

	updateXY(): void {
		const start = cart(this.a, this.top),
			end = cart(this.a, this.bottom);
		this.sx = start.x;
		this.sy = start.y;
		this.ex = end.x;
		this.ey = end.y;
	}

	update(time: Milliseconds): void {
		if (this.motion) {
			this.a = wrapAngle(this.a + time * this.motion);
			this.updateXY();
		}
	}

	drawLeft(c: CanvasRenderingContext2D): void {
		const { a, t, b, game, scale, sprite } = this;
		const { cx, cy } = game;
		const step = sprite.h;

		let remaining = t - b,
			r = t;

		sprite.tile('tr');
		while (remaining > 0) {
			if (remaining < step) {
				sprite.tile('br');
				r = b + step;
			}

			const offset = scaleWidth(scale / 2, r),
				amod: Radians = a - scaleWidth(scale, r),
				normal: Radians = amod + offset + πHalf,
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
	}

	drawRight(c: CanvasRenderingContext2D): void {
		const { a, t, b, game, scale, sprite } = this;
		const { cx, cy } = game;
		const step = sprite.h;

		let remaining = t - b,
			r = t;

		sprite.tile('tl');
		while (remaining > 0) {
			if (remaining < step) {
				sprite.tile('bl');
				r = b + step;
			}

			const offset = scaleWidth(scale / 2, r),
				normal: Radians = a + offset + πHalf,
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
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game, sx, sy, ex, ey } = this;
		const { cx, cy } = game;

		c.strokeStyle = cWall;
		c.beginPath();
		c.moveTo(sx + cx, sy + cy);
		c.lineTo(ex + cx, ey + cy);
		c.stroke();
	}
}
