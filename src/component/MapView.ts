import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zUI } from '../layers';
import { pi2 } from '../tools';
import { kUp, kDown } from '../keys';
import { InputButton } from '../InputMapper';

const mapNode = '#888888',
	currentNode = '#00ff00',
	selectedNode = '#ffffff',
	connection = '#444444';

export default class MapView implements DrawnComponent {
	current: number;
	debounced: InputButton;
	game: Game;
	layer: number;
	selected: number;
	x: number;
	y: number;

	constructor(game: Game) {
		this.game = game;
		this.layer = zUI;
		this.x = 100;
		this.y = game.options.height / 2;
	}

	update(t: number) {
		const key = this.debounce(InputButton.Up, InputButton.Down);

		if (key === InputButton.Up) this.cycle(-1);
		else if (key === InputButton.Down) this.cycle(1);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const { current, game, selected, x, y } = this;

		game.nodes.forEach(n => {
			ctx.strokeStyle = connection;
			n.connections.forEach(i => {
				const o = game.nodes[i];

				ctx.beginPath();
				ctx.moveTo(x + n.x, y + n.y);
				ctx.lineTo(x + o.x, y + o.y);
				ctx.stroke();
			});

			ctx.strokeStyle =
				n.id === current
					? currentNode
					: n.id === selected
					? selectedNode
					: mapNode;
			ctx.beginPath();
			ctx.arc(x + n.x, y + n.y, 10, 0, pi2);
			ctx.stroke();
		});
	}

	debounce(...buttons: InputButton[]) {
		let pressed = InputButton.None;
		let found = false;

		for (let i = 0; i < buttons.length; i++) {
			const b = buttons[i];

			if (this.game.keys.has(b)) {
				found = true;
				if (this.debounced !== b) {
					pressed = b;
					this.debounced = b;
				}

				break;
			}
		}

		if (!found) this.debounced = InputButton.None;
		return pressed;
	}

	cycle(n: number) {
		const options = this.game.nodes[this.current].connections;
		const index = options.indexOf(this.selected);
		let newi = index + n;

		if (newi < 0) newi += options.length;
		if (newi >= options.length) newi -= options.length;

		this.selected = options[newi];
	}
}
