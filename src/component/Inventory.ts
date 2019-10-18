import { kCycle, kThrow, kSwing } from '../keys';
import { zUI } from '../layers';
import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import Weapon from '../Weapon';
import Item from '../Item';

export default class Inventory implements DrawnComponent {
	cycling: boolean;
	game: Game;
	health: number;
	img: CanvasImageSource;
	items: (Item | undefined)[];
	keys: number;
	layer: number;
	money: number;
	weapon: Weapon;

	constructor(game: Game, size: number = 3) {
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
	}

	add(cls): void {
		const i = this.items.indexOf(undefined);
		if (i > -1) this.items[i] = new cls(this.game);
	}

	remove(item: Item): void {
		this.items = this.items.filter(i => i != item);
	}

	update(t: number): void {
		const { game, weapon } = this;

		if (weapon && weapon.update) weapon.update(t);

		if (game.keys[kSwing]) {
			if (weapon && weapon.canUse()) {
				weapon.use();
			}
		}

		if (game.keys[kThrow]) {
			if (this.canThrow()) {
				this.throw();
			}

			// TODO
			// else {
			// 	this.game.player.sprite.play('shrug');
			// }
		}

		if (game.keys[kCycle]) {
			if (!this.cycling) {
				this.cycle();
				this.cycling = true;
			}
		} else {
			this.cycling = false;
		}
	}

	draw(c: CanvasRenderingContext2D): void {
		const { game, items, money, health, keys, img, weapon } = this;

		const y = game.options.height - 48;
		var x = 0;

		if (weapon) weapon.draw(c, game.options.width - 48, y);

		items.forEach(i => {
			if (i && i.draw) i.draw(c, x, y);
			x += 48;
		});

		c.font = '20px sans-serif';
		c.fillStyle = '#ffffff';

		x = 0;
		for (var i = 0; i < health; i++) {
			c.drawImage(img, 36, 0, 36, 36, x, 0, 36, 36);
			x += 27;
		}

		c.drawImage(img, 0, 0, 36, 36, 0, 36, 36, 36);
		c.fillText(money.toString(), 40, 60);

		c.drawImage(img, 72, 0, 36, 36, 0, 72, 36, 36);
		c.fillText(keys.toString(), 40, 96);
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
