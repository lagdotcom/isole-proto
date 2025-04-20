import { cWall } from '../colours';
import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zStructure } from '../layers';
import { gHitboxScale, gWallGap } from '../nums';
import Texture from '../Texture';
import { anglewrap, cart, deg2rad, scalew, πHalf } from '../tools';
import Flat from './Flat';

export default class Wall implements DrawnComponent {
	a: number;
	b: number;
	bottom: number;
	ceiling?: Flat;
	direction: 1 | -1;
	ex: number;
	ey: number;
	floor?: Flat;
	game: Game;
	isWall: true;
	layer: number;
	motion: number;
	scale?: number;
	sprite?: Texture;
	sx: number;
	sy: number;
	r: number; // used for anglecollides()
	t: number;
	top: number;
	width: number; // used for anglecollides()

	draw: (c: CanvasRenderingContext2D) => void;

	constructor(
		game: Game,
		t: number,
		b: number,
		angle: number,
		direction: 1 | -1,
		motion = 0,
		texture?: string
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

	update(time: number): void {
		if (this.motion) {
			this.a = anglewrap(this.a + time * this.motion);
			this.updateXY();
		}
	}

	drawLeft(c: CanvasRenderingContext2D): void {
		const { a, t, b, game, scale, sprite } = this;
		const { cx, cy } = game;
		const step = sprite!.h;

		let remaining = t - b,
			r = t;

		sprite!.tile('tr');
		while (remaining > 0) {
			if (remaining < step) {
				sprite!.tile('br');
				r = b + step;
			}

			const offset = scalew(scale! / 2, r),
				amod = a - scalew(scale!, r),
				normal = amod + offset + πHalf,
				{ x, y } = cart(amod, r);

			c.translate(x + cx, y + cy);
			c.rotate(normal);

			sprite!.draw(c);

			c.rotate(-normal);
			c.translate(-x - cx, -y - cy);

			remaining -= step;
			r -= step;
			sprite!.tile('mr');
		}
	}

	drawRight(c: CanvasRenderingContext2D): void {
		const { a, t, b, game, scale, sprite } = this;
		const { cx, cy } = game;
		const step = sprite!.h;

		let remaining = t - b,
			r = t;

		sprite!.tile('tl');
		while (remaining > 0) {
			if (remaining < step) {
				sprite!.tile('bl');
				r = b + step;
			}

			const offset = scalew(scale! / 2, r),
				normal = a + offset + πHalf,
				{ x, y } = cart(a, r);

			c.translate(x + cx, y + cy);
			c.rotate(normal);

			sprite!.draw(c);

			c.rotate(-normal);
			c.translate(-x - cx, -y - cy);

			remaining -= step;
			r -= step;
			sprite!.tile('ml');
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
