import DrawnComponent from '../DrawnComponent';
import {
	Degrees,
	DisplayLayer,
	MaterialName,
	Milliseconds,
	Multiplier,
	Pixels,
	Radians,
} from '../flavours';
import Game from '../Game';
import { zStructure } from '../layers';
import { getZ, gHitboxScale } from '../nums';
import { draw3D } from '../rendering';
import Texture from '../Texture';
import { deg2rad, scaleWidth, wrapAngle } from '../tools';
import Flat from './Flat';
import Wall from './Wall';

export interface PlatformInit {
	back: boolean;
	h: Pixels;
	th: Pixels;
	a: Degrees;
	w: Degrees;
	motion?: number;
	material: MaterialName;
	walls?: boolean;
	ceiling?: boolean;
}

/** Full platform */
export default class Platform implements DrawnComponent {
	a: Radians;
	back: boolean;
	bottom: Pixels;
	ceiling?: Flat;
	circle: boolean;
	floor: Flat;
	game: Game;
	layer: DisplayLayer;
	left: Radians;
	motion: number;
	r: Pixels;
	right: Radians;
	scale: number;
	sprite: Texture;
	thickness: Pixels;
	width: Radians;
	wallLeft?: Wall;
	wallRight?: Wall;
	z: Multiplier;

	/**
	 * Create a new Platform
	 * @param {PlatformInit} init options structure
	 */
	constructor(init: PlatformInit & { game: Game }) {
		const {
			game,
			back,
			h,
			th,
			a,
			w,
			motion = 0,
			material,
			walls,
			ceiling,
		} = init;

		this.game = game;
		this.back = back;
		this.z = getZ(this.back);
		this.layer = zStructure;
		this.r = h;
		this.thickness = th;
		this.bottom = h - th;
		this.a = deg2rad(a);
		this.width = deg2rad(w) / 2;
		this.motion = deg2rad(motion) / 100;
		this.circle = w >= 360;
		this.left = this.a - this.width;
		this.right = this.a + this.width;
		this.sprite = game.textures[material];
		this.scale = this.sprite.w / gHitboxScale;

		this.floor = new Flat(game, {
			back,
			height: h,
			angle: a,
			width: w,
			motion,
		});
		this.floor.scale = this.scale;
		game.materials[material].spawner(this.floor);
		game.floors.push(this.floor);

		if (ceiling) {
			this.ceiling = new Flat(game, {
				back,
				height: this.bottom,
				angle: a,
				width: w,
				motion,
			});
			game.ceilings.push(this.ceiling);
		}

		if (walls && !this.circle) {
			this.wallLeft = new Wall(
				game,
				back,
				h,
				this.bottom,
				a - w / 2,
				1,
				motion
			);
			this.wallRight = new Wall(
				game,
				back,
				h,
				this.bottom,
				a + w / 2,
				-1,
				motion
			);

			this.floor.wallLeft = this.wallLeft;
			this.floor.wallRight = this.wallRight;

			if (this.ceiling) {
				this.ceiling.wallLeft = this.wallLeft;
				this.ceiling.wallRight = this.wallRight;
			}

			this.wallLeft.ceiling = this.ceiling;
			this.wallLeft.floor = this.floor;

			this.wallRight.ceiling = this.ceiling;
			this.wallRight.floor = this.floor;

			game.walls.push(this.wallLeft, this.wallRight);
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
		const { r, bottom } = this;
		const step = this.sprite.h,
			last = bottom + step;

		this.drawSlice(c, 't', r);

		let h = r - step;
		while (h > last) {
			this.drawSlice(c, 'm', h);
			h -= step;
		}

		if (last < r) this.drawSlice(c, 'b', last);
	}

	drawSlice(c: CanvasRenderingContext2D, row: string, r: number) {
		const { left, right, game, scale, sprite, width, z } = this;
		const step = scaleWidth(scale, r, z),
			rotation = scaleWidth(scale / 2, r, z);
		let remaining = width * 2,
			a = left;

		sprite.tile(row + (this.circle ? 'm' : 'l'));
		while (remaining > 0) {
			if (remaining < step) {
				if (!this.circle) sprite.tile(row + 'r');
				a = right - step;
			}

			draw3D(c, { a, r, z, game, sprite, rotation });

			remaining -= step;
			a += step;
			sprite.tile(row + 'm');
		}
	}

	/**
	 * Draw the Flat's hitbox
	 * @param {CanvasRenderingContext2D} c image context
	 */
	drawHitbox(c: CanvasRenderingContext2D): void {
		this.floor.drawHitbox(c);
		this.ceiling?.drawHitbox(c);
		this.wallLeft?.drawHitbox(c);
		this.wallRight?.drawHitbox(c);
	}
}
