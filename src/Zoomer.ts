import DrawnComponent from './DrawnComponent';
import { DisplayLayer } from './flavours';
import Game from './Game';
import { zFirst } from './layers';
import { cart } from './tools';

export default class Zoomer implements DrawnComponent {
	game: Game;
	layer: DisplayLayer;
	max: number;
	min: number;
	px: number;
	py: number;
	scale: number;
	vert: number;

	constructor(
		game: Game,
		min: number,
		max: number,
		scale: number,
		vert: number
	) {
		this.layer = zFirst;
		this.game = game;
		this.min = min;
		this.max = max;
		this.scale = scale;
		this.vert = vert;
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
		}
	}

	draw(context: CanvasRenderingContext2D) {
		const ss = Math.abs(this.py) * this.vert;
		const cs = Math.abs(this.px);

		let s = this.scale / Math.max(ss, cs);
		if (s < this.min) s = this.min;
		if (s > this.max) s = this.max;

		const { width, height } = this.game.options;
		context.setTransform(s, 0, 0, s, 0, 0);

		this.game.cx = width / s / 2 - this.px;
		this.game.cy = height / s / 2 - this.py;
	}
}
