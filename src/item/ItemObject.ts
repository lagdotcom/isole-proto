import { cIgnore } from '../colours';
import {
	Degrees,
	DisplayLayer,
	Multiplier,
	Pixels,
	Radians,
} from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import Item from '../Item';
import { zDecal } from '../layers';
import { getZ } from '../nums';
import { Pickup } from '../Pickup';
import { draw3D } from '../rendering';
import { deg2rad, drawWedge, scaleWidth } from '../tools';

export type ItemConstructor = new (game: Game) => Item;
interface ItemObjectInit {
	back: boolean;
	a: Degrees;
	r: Pixels;
	item: ItemConstructor;
}

export default class ItemObject implements Pickup {
	a: Radians;
	back: boolean;
	height: Pixels;
	sprite: Item;
	itemConstructor: ItemConstructor;
	layer: DisplayLayer;
	r: Pixels;
	width: Pixels;
	z: Multiplier;

	constructor(
		public game: Game,
		init: ItemObjectInit
	) {
		this.back = init.back;
		this.z = getZ(this.back);
		this.a = deg2rad(init.a);
		this.height = 30;
		this.sprite = new init.item(game);
		this.itemConstructor = init.item;
		this.layer = zDecal;
		this.r = init.r;
		this.width = 30;
	}

	take() {
		const { game, itemConstructor } = this;

		if (game.inventory.add(itemConstructor)) {
			game.remove(this);
			return true;
		}

		return false;
	}

	draw(c: CanvasRenderingContext2D) {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { bot, top } = this.getHitbox();

		drawWedge(c, cIgnore, this.game.cx, this.game.cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { back, a, r, z, width, height } = this;

		return {
			bot: {
				back,
				a,
				r,
				z,
				width: scaleWidth(width, r, z),
			},
			top: {
				back,
				a,
				r: r + height * z,
				z,
				width: scaleWidth(width, r + height, z),
			},
		};
	}
}
