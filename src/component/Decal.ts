import { cIgnore } from '../colours';
import Component from '../Component';
import Controller from '../Controller';
import PointAR from '../CoordAR';
import { ObjectName } from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zBackground } from '../layers';
import { gTimeScale } from '../nums';
import { anglewrap, cart, deg2rad, drawWedge, scalew, πHalf } from '../tools';

export type DecalPosition = 'normal' | 'static';

interface DecalInit extends PointAR {
	layer?: number;
	motion?: number;
	object: ObjectName;
	parallax?: number;
	position?: DecalPosition;
}

export default class Decal implements Component {
	a: number;
	game: Game;
	height: number;
	isDecal: true;
	layer: number;
	motion: number;
	parallax: number;
	position: DecalPosition;
	r: number;
	sprite: Controller;
	x: number;
	width: number;
	y: number;

	constructor(
		game: Game,
		{
			object,
			layer = zBackground,
			a = 0,
			r = 0,
			motion = 0,
			parallax = 0,
			position = 'normal',
		}: DecalInit
	) {
		const sprite = game.objects[object];

		this.isDecal = true;
		this.layer = layer;
		this.game = game;
		this.r = r;
		this.a = anglewrap(deg2rad(a));
		this.motion = deg2rad(motion / 100);
		this.parallax = parallax / 10;
		this.position = position;
		this.sprite = sprite;
		this.width = sprite.w;
		this.height = sprite.h;
		this.x = a;
		this.y = r;

		if (this.position === 'static') {
			this.update = undefined;
			this.draw = this.drawStatic;
			this.drawHitbox = undefined;
		}
	}

	update?(time: number): void {
		const { a, game, motion, parallax } = this;
		let amod = 0;

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
		const normal = a + πHalf;

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
				r,
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
