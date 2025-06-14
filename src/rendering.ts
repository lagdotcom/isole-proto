import CoordARZ from './CoordARZ';
import CoordXY from './CoordXY';
import { Multiplier, Pixels, Radians } from './flavours';
import Game from './Game';
import { gBackZ, gFrontZ } from './nums';
import { cart, πHalf } from './tools';

interface HasDrawFunction {
	draw(c: CanvasRenderingContext2D): void;
}

type Draw3D = CoordARZ & {
	game: Game;
	sprite: HasDrawFunction;
	rotation?: Radians;
};

export function draw3D(
	c: CanvasRenderingContext2D,
	{ a, r, z, game, sprite, rotation = 0 }: Draw3D
) {
	const { cx, cy } = game;
	const normal = a + πHalf + rotation;
	const { x, y } = cart(a, r);

	drawSprite(c, sprite, { cx, cy, x, y, z, normal });
}

function drawSprite(
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
	scale?: Multiplier;
	rotation?: Radians;
};

export function draw2D(
	c: CanvasRenderingContext2D,
	{ x, y, game, sprite, back, scale, rotation }: Object2D
) {
	const { cx, cy } = game;

	c.save();
	c.translate(x + cx, y + cy);
	if (rotation) c.rotate(rotation);

	const finalScale = (scale ?? 1) * (back ? gBackZ : gFrontZ);
	c.scale(finalScale, finalScale);

	sprite.draw(c);

	c.restore();
}
