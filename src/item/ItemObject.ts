import { deg2rad, cart, piHalf, drawWedge, scalew } from '../tools';
import { zDecal } from '../layers';
import Game from '../Game';
import Item from '../Item';
import { cIgnore } from '../colours';
import Hitbox from '../Hitbox';
import { Pickup } from '../Pickup';

export type ItemConstructor = new (game: Game) => Item;
interface ItemObjectInit {
	a: number;
	item: ItemConstructor;
	r: number;
}

export default class ItemObject implements Pickup {
	a: number;
	height: number;
	item: Item;
	itemconst: ItemConstructor;
	layer: number;
	r: number;
	width: number;

	constructor(public game: Game, init: ItemObjectInit) {
		this.a = deg2rad(init.a);
		this.height = 30;
		this.item = new init.item(game);
		this.itemconst = init.item;
		this.layer = zDecal;
		this.r = init.r;
		this.width = 30;
	}

	take() {
		const { game, itemconst } = this;

		if (game.inventory.add(itemconst)) {
			game.remove(this);
			return true;
		}

		return false;
	}

	draw(c: CanvasRenderingContext2D) {
		const { a, r, game, item } = this;
		const { cx, cy } = game;
		const normal = a + piHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		item.draw(c, 0, 0);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { bot, top } = this.getHitbox();

		drawWedge(c, cIgnore, this.game.cx, this.game.cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { a, r, width, height } = this;

		return {
			bot: {
				a,
				r,
				width: scalew(width, r),
			},
			top: {
				a,
				r: r + height,
				width: scalew(width, r + height),
			},
		};
	}
}
