import CoordARZ from './CoordARZ';
import CoordXY from './CoordXY';
import { Multiplier, Pixels, Radians } from './flavours';
import Game from './Game';
import { gBackZ } from './nums';
import { cart, πHalf } from './tools';

interface HasDrawFunction {
	draw(c: CanvasRenderingContext2D): void;
}

type Object3D = CoordARZ & { game: Game; sprite: HasDrawFunction };

export function draw3D(
	c: CanvasRenderingContext2D,
	{ a, r, z, game, sprite }: Object3D
) {
	const { cx, cy } = game;
	const normal = a + πHalf;
	const { x, y } = cart(a, r);

	drawSprite(c, sprite, { cx, cy, x, y, z, normal });
}

export function drawSprite(
	c: CanvasRenderingContext2D,
	sprite: HasDrawFunction,
	{
		cx,
		cy,
		x,
		y,
		z,
		normal,
	}: {
		cx: Pixels;
		cy: Pixels;
		x: Pixels;
		y: Pixels;
		z: Multiplier;
		normal: Radians;
	}
) {
	c.save();
	c.translate(x + cx, y + cy);
	c.rotate(normal);
	c.scale(z, z);

	sprite.draw(c);

	c.restore();
}

type Object2D = CoordXY & {
	game: Game;
	sprite: HasDrawFunction;
	back?: boolean;
};

export function draw2D(
	c: CanvasRenderingContext2D,
	{ x, y, game, sprite, back }: Object2D
) {
	const { cx, cy } = game;

	c.save();
	c.translate(x + cx, y + cy);
	if (back) c.scale(gBackZ, gBackZ);
	sprite.draw(c);

	c.restore();
}
