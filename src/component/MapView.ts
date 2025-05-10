import Controller from '../Controller';
import DrawnComponent from '../DrawnComponent';
import { DisplayLayer, Pixels } from '../flavours';
import Game from '../Game';
import { InputButton } from '../InputMapper';
import { zUI } from '../layers';
import { NodeType } from '../MapNode';

const connection = '#444444',
	highlighted = '#ff4444';

export default class MapView implements DrawnComponent {
	back: boolean;
	bossIcon: Controller;
	current: number;
	debounced: InputButton;
	game: Game;
	icon: Controller;
	layer: DisplayLayer;
	selected: number;
	x: Pixels;
	y: Pixels;

	constructor(game: Game) {
		this.game = game;
		this.back = false;
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
		this.bossIcon = new Controller({
			img: game.resources['ui.mapboss'],
			w: 96,
			h: 96,
			xo: -48,
			yo: -48,
		});
	}

	update() {
		const { game, selected } = this;

		const key = this.debounce(
			InputButton.Up,
			InputButton.Down,
			InputButton.Swing
		);

		if (key === InputButton.Up) this.cycle(-1);
		else if (key === InputButton.Down) this.cycle(1);
		else if (key === InputButton.Swing) {
			game.fire('level.enter', { id: selected });
			this.current = selected;
			game.nodes[selected].visited = true;
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		const { current, game, selected, x, y } = this;

		const wd = ctx.lineWidth;
		ctx.lineWidth = 4;
		game.nodes.forEach(n => {
			n.connections.forEach(i => {
				const o = game.nodes[i];

				ctx.strokeStyle =
					current === n.id && selected === i
						? highlighted
						: connection;
				ctx.beginPath();
				ctx.moveTo(x + n.x, y + n.y);
				ctx.lineTo(x + o.x, y + o.y);
				ctx.stroke();
			});

			let icon: Controller;
			if (n.type === NodeType.Boss) {
				icon = this.bossIcon;
			} else {
				icon = this.icon;
				const type = n.hidden && !n.visited ? NodeType.Unknown : n.type;
				icon.show('type' + type, type, 0);
			}

			icon.draw(ctx, x + n.x, y + n.y);
		});
		ctx.lineWidth = wd;
	}

	debounce(...buttons: InputButton[]) {
		let pressed = InputButton.None;
		let found = false;

		for (const b of buttons) {
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

	cycle(delta: number) {
		const options = this.game.nodes[this.current].connections;
		const index = options.indexOf(this.selected);
		let newIndex = index + delta;

		if (newIndex < 0) newIndex += options.length;
		if (newIndex >= options.length) newIndex -= options.length;

		this.selected = options[newIndex];
	}
}
