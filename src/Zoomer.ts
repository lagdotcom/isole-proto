import CoordXY from './CoordXY';
import DrawnComponent from './DrawnComponent';
import { DisplayLayer, Multiplier, Pixels } from './flavours';
import Game from './Game';
import { zFirst } from './layers';
import { cart } from './tools';

export default class Zoomer implements DrawnComponent {
	game: Game;
	layer: DisplayLayer;
	max: number;
	min: number;
	px: Pixels;
	py: Pixels;
	scale: Pixels;
	vert: Multiplier;
	currentScale: Multiplier;

	constructor(
		game: Game,
		min: number,
		max: number,
		scale: Pixels,
		vert: Multiplier
	) {
		this.layer = zFirst;
		this.game = game;
		this.min = min;
		this.max = max;
		this.scale = scale;
		this.vert = vert;
		this.currentScale = 1;
	}

	reset() {
		this.game.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	update() {
		const { player } = this.game;
		if (player.alive) {
			const xy = cart(player.a, player.r);
			this.px = xy.x;
			this.py = xy.y;

			const { x, y } = player.reticle;
			if (!isNaN(x)) {
				this.px += x / 10;
				this.py += y / 10;
			}
		}
	}

	draw(context: CanvasRenderingContext2D) {
		const ss = Math.abs(this.py) * this.vert;
		const cs = Math.abs(this.px);

		let s = this.scale / Math.max(ss, cs);
		if (s < this.min) s = this.min;
		if (s > this.max) s = this.max;
		this.currentScale = s;

		const { width, height } = this.game.options;
		context.setTransform(s, 0, 0, s, 0, 0);

		this.game.cx = width / s / 2 - this.px;
		this.game.cy = height / s / 2 - this.py;
	}

	convert(pos: CoordXY): CoordXY {
		const { currentScale, game } = this;
		return {
			x: pos.x / currentScale - game.cx,
			y: pos.y / currentScale - game.cy,
		};
	}

	bounds() {
		const min = this.convert({ x: 0, y: 0 });
		const max = this.convert({
			x: this.game.options.width,
			y: this.game.options.height,
		});

		return [min, max] as const;
	}
}
