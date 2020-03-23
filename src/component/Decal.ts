import Controller from '../Controller';
import { cIgnore } from '../colours';
import { gTimeScale } from '../nums';
import { anglewrap, cart, deg2rad, piHalf, scalew, drawWedge } from '../tools';
import { zBackground } from '../layers';
import Game from '../Game';
import PointAR from '../CoordAR';
import Component from '../Component';
import Hitbox from '../Hitbox';

export const normalPosition = 'normal';
export const staticPosition = 'static';

interface DecalInit extends PointAR {
	layer?: number;
	motion?: number;
	object: string;
	parallax?: number;
	position?: string;
}

export default class Decal implements Component {
	a: number;
	game: Game;
	height: number;
	isDecal: true;
	layer: number;
	motion: number;
	parallax: number;
	position: string;
	r: number;
	sprite: Controller;
	x: number;
	width: number;
	y: number;

	constructor(game: Game, options: DecalInit) {
		const sprite = game.objects[options.object];

		this.isDecal = true;
		this.layer = options.layer || zBackground;
		this.game = game;
		this.r = options.r || 0;
		this.a = anglewrap(deg2rad(options.a || 0));
		this.motion = deg2rad((options.motion || 0) / 100);
		this.parallax = (options.parallax || 0) / 10;
		this.position = options.position || normalPosition;
		this.sprite = sprite;
		this.width = sprite.w;
		this.height = sprite.h;
		this.x = options.a || 0;
		this.y = options.r || 0;

		if (this.position === staticPosition) {
			this.update = undefined;
			this.draw = this.drawStatic;
			this.drawHitbox = undefined;
		}
	}

	update?(time: number): void {
		const { a, game, motion, parallax } = this;
		var amod = 0;

		if (motion) {
			amod += time * motion;
		}

		if (parallax && game.player.alive) {
			amod += (game.player.va / gTimeScale + game.player.vfa) * parallax;
		}

		this.a = anglewrap(a + amod);
	}

	draw(c: CanvasRenderingContext2D): void {
		const { a, r, game, sprite } = this;
		const { cx, cy } = game;
		const normal = a + piHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawStatic(c: CanvasRenderingContext2D): void {
		const { x, y, game, sprite } = this;
		const { cx, cy } = game;

		c.translate(x + cx, y + cy);

		sprite.draw(c);

		c.translate(-x - cx, -y - cy);
	}

	drawHitbox?(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cIgnore, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, width, height } = this;
		const baw = scalew(width, r),
			taw = scalew(width, r + height);

		return {
			bot: {
				r: r,
				a,
				width: baw,
			},
			top: {
				r: r + height,
				a,
				width: taw,
			},
		};
	}
}
