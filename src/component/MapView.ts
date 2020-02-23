import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zUI } from '../layers';
import { pi2 } from '../tools';

export default class MapView implements DrawnComponent {
	game: Game;
	layer: number;
	x: number;
	y: number;

	constructor(game: Game) {
		this.game = game;
		this.layer = zUI;
		this.x = 100;
		this.y = game.options.height / 2;
	}

	draw(ctx: CanvasRenderingContext2D) {
		const { game, x, y } = this;
		ctx.strokeStyle = '#ffffff';

		game.nodes.forEach(n => {
			n.connections.forEach(i => {
				const o = game.nodes[i];

				ctx.beginPath();
				ctx.moveTo(x + n.x, y + n.y);
				ctx.lineTo(x + o.x, y + o.y);
				ctx.stroke();
			});

			ctx.beginPath();
			ctx.arc(x + n.x, y + n.y, 10, 0, pi2);
			ctx.stroke();
		});
	}
}
