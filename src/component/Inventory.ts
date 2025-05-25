import DrawnComponent from '../DrawnComponent';
import { DisplayLayer, Milliseconds } from '../flavours';
import Game from '../Game';
import { InputButton } from '../InputMapper';
import Item from '../Item';
import { zUI } from '../layers';
import { drawCross } from '../tools';
import Weapon from '../Weapon';

export default class Inventory implements DrawnComponent {
	cycling: boolean;
	game: Game;
	health: number;
	img: CanvasImageSource;
	items: (Item | undefined)[];
	keys: number;
	layer: DisplayLayer;
	money: number;
	weapon?: Weapon;

	constructor(game: Game, size = 3) {
		Object.assign(this, {
			layer: zUI,
			game,
			items: new Array(size),
			weapon: null,
			cycling: false,
			money: 0,
			health: 5,
			keys: 0,
			img: game.resources['ui.icons'],
		});

		this.clear();
	}

	clear(): void {
		this.items.fill(undefined);
		this.weapon = undefined;
	}

	swap(weapon: Weapon): Weapon | undefined {
		const old = this.weapon;
		this.weapon = weapon;
		return old;
	}

	add(cls: new (game: Game) => Item): boolean {
		const i = this.items.indexOf(undefined);
		if (i > -1) {
			this.items[i] = new cls(this.game);
			return true;
		}

		return false;
	}

	remove(item: Item): boolean {
		const i = this.items.indexOf(item);
		if (i > -1) {
			this.items[i] = undefined;
			return true;
		}

		return false;
	}

	update(t: Milliseconds): void {
		const { game, weapon } = this;
		const ok = game.mode === 'level';

		if (weapon && weapon.update) weapon.update(t);

		if (ok && game.keys.has(InputButton.Swing)) {
			if (weapon && weapon.canUse()) {
				weapon.use();
			}
		}

		if (ok && game.keys.has(InputButton.Throw)) {
			if (this.canThrow()) {
				this.throw();
			}

			// TODO
			// else {
			// 	this.game.player.sprite.play('shrug');
			// }
		}

		if (ok && game.keys.has(InputButton.Cycle)) {
			if (!this.cycling) {
				this.cycle();
				this.cycling = true;
			}
		} else {
			this.cycling = false;
		}

		if (game.keys.has(InputButton.FreeMoney)) {
			this.money = 10000;
		}
	}

	draw(c: CanvasRenderingContext2D): void {
		const { game, items, money, health, keys, img, weapon } = this;

		const y = game.options.height - 48;
		let x = 60;

		if (weapon) weapon.draw(c, game.options.width - 48, y);

		items.forEach(i => {
			if (i && i.draw) i.draw(c, x, y);
			x += 48;
		});

		c.font = '20px sans-serif';
		c.fillStyle = '#ffffff';

		// icons image: mana, health, keys, money (each 32x32)

		x = 0;
		for (let i = 0; i < health; i++) {
			c.drawImage(img, 32, 0, 32, 32, x, 0, 32, 32);
			x += 32;
		}

		c.drawImage(img, 0, 0, 32, 32, 0, 32, 32, 32);
		c.fillText('manabar', 40, 54);

		c.drawImage(img, 96, 0, 32, 32, 0, 64, 32, 32);
		c.fillText(money.toString(), 40, 88);

		c.drawImage(img, 64, 0, 32, 32, 128, 64, 32, 32);
		c.fillText(keys.toString(), 168, 88);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { game } = this;
		const y = game.options.height - 48;

		// weapon position
		drawCross(c, 'lime', game.options.width - 48, y);

		// item positions
		const x = 60;
		drawCross(c, 'lime', x, y);
		drawCross(c, 'lime', x + 48, y);
		drawCross(c, 'lime', x + 48 + 48, y);

		// icon positions
		drawCross(c, 'green', 0, 0);
		drawCross(c, 'green', 0, 32);
		drawCross(c, 'green', 0, 64);
		drawCross(c, 'green', 128, 64);
	}

	canThrow(): boolean {
		return this.items[0] ? this.items[0].canUse() : false;
	}

	throw(): void {
		return this.items[0] && this.items[0].use();
	}

	cycle(): void {
		const first = this.items.shift();
		this.items = [...this.items, first];
	}
}
