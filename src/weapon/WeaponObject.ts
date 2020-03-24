import { deg2rad, cart, piHalf, drawWedge, scalew } from '../tools';
import { zDecal } from '../layers';
import Game from '../Game';
import Weapon from '../Weapon';
import { cIgnore } from '../colours';
import Hitbox from '../Hitbox';
import { Pickup } from '../Pickup';

interface WeaponObjectInit {
	a: number;
	r: number;
	weapon: new (game: Game) => Weapon;
}

export default class WeaponObject implements Pickup {
	a: number;
	height: number;
	layer: number;
	r: number;
	weapon: Weapon;
	width: number;

	constructor(public game: Game, init: WeaponObjectInit) {
		this.a = deg2rad(init.a);
		this.height = 30;
		this.layer = zDecal;
		this.r = init.r;
		this.weapon = new init.weapon(game);
		this.width = 30;
	}

	take() {
		const { game, weapon } = this;

		const old = game.inventory.swap(weapon);
		if (!old) {
			game.remove(this);
			return true;
		}

		this.weapon = old;

		// TODO: necessary?
		this.a = game.player.a;
		this.r = game.player.r;

		return true;
	}

	draw(c: CanvasRenderingContext2D) {
		const { a, r, game, weapon } = this;
		const { cx, cy } = game;
		const normal = a + piHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		weapon.draw(c, 0, 0);

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
