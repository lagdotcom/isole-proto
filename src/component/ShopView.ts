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
	bg: HTMLImageElement;
	game: Game;
	layer: DisplayLayer;
	offers: Offer[];
	xmid: Pixels;
	xoff: Pixels;
	yoff: Pixels;

	constructor(game: Game) {
		this.bg = game.resources['shop.bg'];
		this.game = game;
		this.layer = zBeforeUI;
		this.xmid = game.options.width / 2;
		this.xoff = (game.options.width - this.bg.width) / 2;
		this.yoff = (game.options.height - this.bg.height) / 2;

		this.clear();
	}

	offerLocations(c: CanvasRenderingContext2D) {
		let x = this.xmid - ((this.offers.length - 1) * ItemGap) / 2;
		return this.offers.map(o => {
			const text = o.cost.toString();
			const size = c.measureText(text);

			const oloc = {
				image: o.object,
				text,
				iloc: { x, y: 560 },
				tloc: { x: x - size.width / 2, y: 600 },
			};

			x += ItemGap;
			return oloc;
		});
	}

	draw(c: CanvasRenderingContext2D) {
		const { bg, xoff, yoff } = this;
		c.drawImage(bg, xoff, yoff);

		c.font = '20px sans-serif';
		c.fillStyle = '#ffffff';

		this.offerLocations(c).forEach(l => {
			l.image.draw(c, l.iloc.x, l.iloc.y);
			c.fillText(l.text, l.tloc.x, l.tloc.y);
		});
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		this.offerLocations(c).forEach(l => {
			drawCross(c, 'lime', l.iloc.x, l.iloc.y);
			drawCross(c, 'green', l.tloc.x, l.tloc.y);
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
