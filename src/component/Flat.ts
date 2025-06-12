import { cWall } from '../colours';
import Component from '../Component';
import DrawnComponent from '../DrawnComponent';
import {
	Degrees,
	DisplayLayer,
	Milliseconds,
	Multiplier,
	Pixels,
	Radians,
	TextureName,
} from '../flavours';
import Game from '../Game';
import { zStructure } from '../layers';
import { getZ, gHitboxScale } from '../nums';
import { draw3D } from '../rendering';
import Texture from '../Texture';
import { deg2rad, scaleWidth, wrapAngle } from '../tools';
import Wall from './Wall';

/** Floor or Ceiling */
export default class Flat implements DrawnComponent {
	a: Radians;
	attachments: Component[];
	back: boolean;
	circle: boolean;
	game: Game;
	isFlat: true;
	layer: DisplayLayer;
	left: Radians;
	motion: Radians;
	r: Pixels;
	right: Radians;
	scale: number;
	sprite?: Texture;
	width: Radians;
	wallLeft?: Wall;
	wallRight?: Wall;
	z: Multiplier;

	/**
	 * Create a new Flat
	 * @param {Game} game game instance
	 * @param {Pixels} height height
	 * @param {Degrees} angle angle
	 * @param {Degrees} width width
	 * @param {number} motion motion
	 * @param {TextureName} texture texture name
	 */
	constructor(
		game: Game,
		{
			back,
			height,
			angle,
			width,
			motion = 0,
			texture,
		}: {
			back: boolean;
			height: Pixels;
			angle: Degrees;
			width: Degrees;
			motion?: number;
			texture?: TextureName;
		}
	) {
		this.circle = width >= 360;

		Object.assign(this, {
			isFlat: true,
			layer: zStructure,
			game,
			attachments: [],
			back,
			r: height,
			a: deg2rad(angle),
			z: getZ(back),
			width: deg2rad(width) / 2,
			motion: deg2rad(motion / 100),
		});

		this.left = this.a - this.width;
		this.right = this.a + this.width;

		if (texture) {
			this.sprite = game.textures[texture];
			this.scale = this.sprite.w / gHitboxScale;
			game.materials[texture].spawner(this);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			this.draw = () => {};
			this.scale = 0;
		}
	}

	/**
	 * Update position
	 * @param {Milliseconds} time time
	 */
	update(time: Milliseconds): void {
		if (this.motion) {
			this.a = wrapAngle(this.a + time * this.motion);
			this.left = this.a - this.width;
			this.right = this.a + this.width;
		}
	}

	/**
	 * Draw the Flat
	 * @param {CanvasRenderingContext2D} c image context
	 */
	draw(c: CanvasRenderingContext2D): void {
		const { left, right, r, game, scale, sprite, width, z } = this;
		const step = scaleWidth(scale, r, z),
			rotation = scaleWidth(scale / 2, r, z);
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

			draw3D(c, { a, r, z, game, sprite, rotation });

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
