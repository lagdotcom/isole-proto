import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zStructure } from '../layers';
import { gHitboxScale } from '../nums';
import Texture from '../Texture';
import { anglewrap, cart, deg2rad, scalew, πHalf } from '../tools';
import Flat from './Flat';
import Wall from './Wall';

export interface PlatformInit {
	h: number;
	th: number;
	a: number;
	w: number;
	motion?: number;
	material: string;
	walls?: boolean;
	ceiling?: boolean;
}

/** Full platform */
export default class Platform implements DrawnComponent {
	a: number;
	bottom: number;
	ceiling?: Flat;
	circle: boolean;
	floor: Flat;
	game: Game;
	layer: number;
	left: number;
	motion: number;
	r: number;
	right: number;
	scale: number;
	sprite: Texture;
	thickness: number;
	width: number;
	wleft?: Wall;
	wright?: Wall;

	/**
	 * Create a new Platform
	 * @param {PlatformInit} init options structure
	 */
	constructor(init: PlatformInit & { game: Game }) {
		const { game, h, th, a, w, motion, material, walls, ceiling } = init;

		this.game = game;
		this.layer = zStructure;
		this.r = h;
		this.thickness = th;
		this.bottom = h - th;
		this.a = deg2rad(a);
		this.width = deg2rad(w) / 2;
		this.motion = deg2rad(motion || 0) / 100;
		this.circle = w >= 360;
		this.left = this.a - this.width;
		this.right = this.a + this.width;
		this.sprite = game.textures[material];
		this.scale = this.sprite.w / gHitboxScale;

		this.floor = new Flat(game, h, a, w, motion);
		this.floor.scale = this.scale;
		game.materials[material].spawner(this.floor);
		game.floors.push(this.floor);

		if (ceiling) {
			this.ceiling = new Flat(game, this.bottom, a, w, motion);
			game.ceilings.push(this.ceiling);
		}

		if (walls && !this.circle) {
			this.wleft = new Wall(game, h, this.bottom, a - w / 2, 1, motion);
			this.wright = new Wall(game, h, this.bottom, a + w / 2, -1, motion);

			this.floor.wleft = this.wleft;
			this.floor.wright = this.wright;

			if (this.ceiling) {
				this.ceiling.wleft = this.wleft;
				this.ceiling.wright = this.wright;
			}

			this.wleft.ceiling = this.ceiling;
			this.wleft.floor = this.floor;

			this.wright.ceiling = this.ceiling;
			this.wright.floor = this.floor;

			game.walls.push(this.wleft, this.wright);
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
		const { left, right, game, scale, sprite, width } = this;
		const { cx, cy } = game;
		const step = scalew(scale, r),
			offset = scalew(scale / 2, r);
		let remaining = width * 2,
			a = left;

		sprite.tile(row + (this.circle ? 'm' : 'l'));
		while (remaining > 0) {
			if (remaining < step) {
				if (!this.circle) sprite.tile(row + 'r');
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
			sprite.tile(row + 'm');
		}
	}

	/**
	 * Draw the Flat's hitbox
	 * @param {CanvasRenderingContext2D} c image context
	 */
	drawHitbox(c: CanvasRenderingContext2D): void {
		this.floor.drawHitbox(c);
		if (this.ceiling) this.ceiling.drawHitbox(c);
		if (this.wleft) this.wleft.drawHitbox(c);
		if (this.wright) this.wright.drawHitbox(c);
	}
}
