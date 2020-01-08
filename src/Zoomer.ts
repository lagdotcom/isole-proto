import Game from './Game';
import DrawnComponent from './DrawnComponent';
import { zFirst } from './layers';

export default class Zoomer implements DrawnComponent {
	game: Game;
	layer: number;
	max: number;
	min: number;
	pr: number;

	constructor(game: Game, min: number, max: number) {
		this.layer = zFirst;
		this.game = game;
		this.min = min;
		this.max = max;
	}

	reset() {
		this.game.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	update(t: number) {
		if (this.game.player.alive) {
			this.pr = this.game.player.r;
		}
	}

	draw(context: CanvasRenderingContext2D) {
		let s = 500 / this.pr;
		if (s < this.min) s = this.min;
		if (s > this.max) s = this.max;

		const { width, height } = this.game.options;
		context.setTransform(s, 0, 0, s, 0, 0);

		this.game.cx = this.game.options.width / s / 2;
		this.game.cy = this.game.options.height / s / 2;
	}
}
