import Game from './Game';
import DrawnComponent from './DrawnComponent';
import { zFirst } from './layers';
import { cart } from './tools';

const gScale = 550,
	gVerticalMultiplier = 2;

export default class Zoomer implements DrawnComponent {
	game: Game;
	layer: number;
	max: number;
	min: number;
	pr: number;
	pa: number;
	ps: number;
	pc: number;

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
		const { player } = this.game;
		if (player.alive) {
			this.pr = player.r;
			this.pa = player.a;
			this.ps = Math.sin(player.a);
			this.pc = Math.cos(player.a);
		}
	}

	draw(context: CanvasRenderingContext2D) {
		let ss = Math.abs(this.pr * this.ps) * gVerticalMultiplier;
		let cs = Math.abs(this.pr * this.pc);

		let s = gScale / Math.max(ss, cs);
		if (s < this.min) s = this.min;
		if (s > this.max) s = this.max;

		const { width, height } = this.game.options;
		context.setTransform(s, 0, 0, s, 0, 0);

		const player = cart(this.pa, this.pr);

		this.game.cx = width / s / 2 - player.x;
		this.game.cy = height / s / 2 - player.y;
	}
}
