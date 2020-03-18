import Controller from '../Controller';
import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zUI } from '../layers';
import { InputButton } from '../InputMapper';
import { eLevelEnter } from '../events';
import { NodeType } from '../MapNode';

const connection = '#444444';

export default class MapView implements DrawnComponent {
	bossicon: Controller;
	current: number;
	debounced: InputButton;
	game: Game;
	icon: Controller;
	layer: number;
	selected: number;
	x: number;
	y: number;

	constructor(game: Game) {
		this.game = game;
		this.layer = zUI;
		this.x = 100;
		this.y = game.options.height / 2;

		this.icon = new Controller({
			img: game.resources['ui.mapicons'],
			w: 48,
			h: 48,
			xo: -24,
			yo: -24,
		});
		this.bossicon = new Controller({
			img: game.resources['ui.mapboss'],
			w: 96,
			h: 96,
			xo: -48,
			yo: -48,
		});
	}

	update(t: number) {
		const { game, selected } = this;

		const key = this.debounce(
			InputButton.Up,
			InputButton.Down,
			InputButton.Swing
		);

		if (key === InputButton.Up) this.cycle(-1);
		else if (key === InputButton.Down) this.cycle(1);
		else if (key === InputButton.Swing) {
			game.fire(eLevelEnter, { id: selected });
			this.current = selected;
			game.nodes[selected].visited = true;
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		const { game, selected, x, y } = this;

		game.nodes.forEach(n => {
			ctx.globalAlpha = 1;
			ctx.strokeStyle = connection;
			n.connections.forEach(i => {
				const o = game.nodes[i];

				ctx.beginPath();
				ctx.moveTo(x + n.x, y + n.y);
				ctx.lineTo(x + o.x, y + o.y);
				ctx.stroke();
			});

			let icon: Controller;
			if (n.type === NodeType.Boss) {
				icon = this.bossicon;
			} else {
				icon = this.icon;
				const type = n.hidden && !n.visited ? NodeType.Unknown : n.type;
				icon.show('type' + type, type, 0);
			}

			ctx.globalAlpha = selected === n.id ? 1 : 0.5;
			icon.draw(ctx, x + n.x, y + n.y);
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
