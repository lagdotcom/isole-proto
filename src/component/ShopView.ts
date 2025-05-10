import DrawnComponent from '../DrawnComponent';
import { DisplayLayer, Pixels } from '../flavours';
import Game from '../Game';
import Item from '../Item';
import { ItemConstructor } from '../item/ItemObject';
import { zBeforeUI } from '../layers';
import { drawCross } from '../tools';
import Weapon from '../Weapon';
import { WeaponConstructor } from '../weapon/WeaponObject';

const ItemGap = 200;

interface ItemOffer {
	type: 'item';
	cost: number;
	object: Item;
}
interface WeaponOffer {
	type: 'weapon';
	cost: number;
	object: Weapon;
}
type Offer = ItemOffer | WeaponOffer;

export default class ShopView implements DrawnComponent {
	back: boolean;
	bg: HTMLImageElement;
	game: Game;
	layer: DisplayLayer;
	offers: Offer[];
	midX: Pixels;
	offsetX: Pixels;
	offsetY: Pixels;

	constructor(game: Game) {
		this.bg = game.resources['shop.bg'];
		this.back = false;
		this.game = game;
		this.layer = zBeforeUI;
		this.midX = game.options.width / 2;
		this.offsetX = (game.options.width - this.bg.width) / 2;
		this.offsetY = (game.options.height - this.bg.height) / 2;

		this.clear();
	}

	offerLocations(c: CanvasRenderingContext2D) {
		let x = this.midX - ((this.offers.length - 1) * ItemGap) / 2;
		return this.offers.map(o => {
			const text = o.cost.toString();
			const size = c.measureText(text);

			const objectLocation = {
				image: o.object,
				text,
				itemLocation: { x, y: 560 },
				textLocation: { x: x - size.width / 2, y: 600 },
			};

			x += ItemGap;
			return objectLocation;
		});
	}

	draw(c: CanvasRenderingContext2D) {
		const { bg, offsetX, offsetY } = this;
		c.drawImage(bg, offsetX, offsetY);

		c.font = '20px sans-serif';
		c.fillStyle = '#ffffff';

		this.offerLocations(c).forEach(l => {
			l.image.draw(c, l.itemLocation.x, l.itemLocation.y);
			c.fillText(l.text, l.textLocation.x, l.textLocation.y);
		});
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		this.offerLocations(c).forEach(l => {
			drawCross(c, 'lime', l.itemLocation.x, l.itemLocation.y);
			drawCross(c, 'green', l.textLocation.x, l.textLocation.y);
		});
	}

	clear() {
		this.offers = [];
	}

	item(item: ItemConstructor, cost: number) {
		const offer: ItemOffer = {
			type: 'item',
			cost,
			object: new item(this.game),
		};
		this.offers.push(offer);
		return offer;
	}

	weapon(weapon: WeaponConstructor, cost: number) {
		const offer: WeaponOffer = {
			type: 'weapon',
			cost,
			object: new weapon(this.game),
		};
		this.offers.push(offer);
		return offer;
	}
}
