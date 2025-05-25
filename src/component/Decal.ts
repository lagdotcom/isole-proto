import { cIgnore } from '../colours';
import Component from '../Component';
import Controller from '../Controller';
import {
	Degrees,
	DisplayLayer,
	Multiplier,
	ObjectName,
	Pixels,
	Radians,
} from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zBackground } from '../layers';
import { getZ, gTimeScale } from '../nums';
import { draw2D, draw3D } from '../rendering';
import { deg2rad, drawWedge, scaleWidth, wrapAngle } from '../tools';

export type DecalPosition = 'normal' | 'static';

interface DecalInit {
	back?: boolean;
	a: Degrees;
	r: Pixels;
	layer?: DisplayLayer;
	motion?: number;
	object: ObjectName;
	parallax?: number;
	position?: DecalPosition;
}

export default class Decal implements Component {
	a: Radians;
	game: Game;
	height: Pixels;
	isDecal: true;
	layer: number;
	motion: number;
	parallax: number;
	position: DecalPosition;
	r: Pixels;
	sprite: Controller;
	x: Pixels;
	width: Pixels;
	y: Pixels;
	z: Multiplier;

	constructor(
		game: Game,
		{
			object,
			layer = zBackground,
			back = false,
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
		this.z = getZ(back);
		this.r = r;
		this.a = wrapAngle(deg2rad(a));
		this.motion = deg2rad(motion / 100);
		this.parallax = parallax / 10;
		this.position = position;
		this.sprite = sprite;
		this.width = sprite.w;
		this.height = sprite.h;
		this.x = a as Pixels;
		this.y = r;

		if (this.position === 'static') {
			this.update = undefined;
			this.draw = this.drawStatic;
			this.drawHitbox = undefined;
		}
	}

	update?(time: number): void {
		const { a, game, motion, parallax } = this;
		let amod: Radians = 0;

		if (motion) {
			amod += time * motion;
		}

		if (parallax && game.player.alive) {
			amod += (game.player.va / gTimeScale + game.player.vfa) * parallax;
		}

		this.a = wrapAngle(a + amod);
	}

	draw(c: CanvasRenderingContext2D): void {
		draw3D(c, this);
	}

	drawStatic(c: CanvasRenderingContext2D): void {
		draw2D(c, this);
	}

	drawHitbox?(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cIgnore, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, z, width, height } = this;
		const baw = scaleWidth(width, r, z),
			taw = scaleWidth(width, r + height, z);

		return {
			bot: {
				r,
				a,
				z,
				width: baw,
			},
			top: {
				r: r + height * z,
				a,
				z,
				width: taw,
			},
		};
	}
}
