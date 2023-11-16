import { cWall } from '../colours';
import Component from '../Component';
import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zStructure } from '../layers';
import { gHitboxScale } from '../nums';
import Texture from '../Texture';
import { anglewrap, cart, deg2rad, scalew, πHalf } from '../tools';
import Wall from './Wall';

/** Floor or Ceiling */
export default class Flat implements DrawnComponent {
	a: number;
	attachments: Component[];
	circle: boolean;
	game: Game;
	isFlat: true;
	layer: number;
	left: number;
	motion: number;
	r: number;
	right: number;
	scale: number;
	sprite?: Texture;
	width: number;
	wleft?: Wall;
	wright?: Wall;

	/**
	 * Create a new Flat
	 * @param {Game} game game instance
	 * @param {number} height height
	 * @param {number} angle angle
	 * @param {number} width width
	 * @param {number} motion motion
	 * @param {string} texture texture name
	 */
	constructor(
		game: Game,
		height: number,
		angle: number,
		width: number,
		motion?: number,
		texture?: string
	) {
		this.circle = width >= 360;

		Object.assign(this, {
			isFlat: true,
			layer: zStructure,
			game,
			attachments: [],
			r: height,
			a: deg2rad(angle),
			width: deg2rad(width) / 2,
			motion: deg2rad((motion || 0) / 100),
		});

		this.left = this.a - this.width;
		this.right = this.a + this.width;

		if (texture) {
			this.sprite = game.textures[texture];
			this.scale = this.sprite.w / gHitboxScale;
			game.materials[texture].spawner(this);
		} else {
			this.draw = () => {};
			this.scale = 0;
		}
	}

	/**
	 * Update position
	 * @param {number} time time
	 */
	update(time: number): void {
		if (this.motion) {
			this.a = anglewrap(this.a + time * this.motion);
			this.left = this.a - this.width;
			this.right = this.a + this.width;
		}
	}

	/**
	 * Draw the Flat
	 * @param {CanvasRenderingContext2D} c image context
	 */
	draw(c: CanvasRenderingContext2D): void {
		const { left, right, r, game, scale, sprite, width } = this;
		const { cx, cy } = game;
		const step = scalew(scale, r),
			offset = scalew(scale / 2, r);
		let remaining = width * 2,
			a = left;

		if (!sprite) return;

		sprite.reset();
		sprite.tile(this.circle ? 'tm' : 'tl');
		while (remaining > 0) {
			if (remaining < step) {
				if (!this.circle) sprite.tile('tr');
				a = right - step;
			}

			const normal = a + offset + πHalf;
			const { x, y } = cart(a, r);

			c.translate(x + cx, y + cy);
			c.rotate(normal);

			sprite.draw(c);

			c.rotate(-normal);
			c.translate(-x - cx, -y - cy);

			remaining -= step;
			a += step;
			sprite.tile('tm');
		}
	}

	/**
	 * Draw the Flat's hitbox
	 * @param {CanvasRenderingContext2D} c image context
	 */
	drawHitbox(c: CanvasRenderingContext2D): void {
		const { r, left, right } = this;
		const { cx, cy } = this.game;

		c.strokeStyle = cWall;
		c.beginPath();
		c.arc(cx, cy, r, left, right);
		c.stroke();
	}
}
