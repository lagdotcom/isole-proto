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
import { zDecal } from '../layers';
import { getZ } from '../nums';
import { Pickup } from '../Pickup';
import { draw3D } from '../rendering';
import { deg2rad, drawWedge, scaleWidth } from '../tools';
import Weapon from '../Weapon';

export type WeaponConstructor = new (game: Game) => Weapon;
interface WeaponObjectInit {
	back: boolean;
	a: Degrees;
	r: Pixels;
	weapon: WeaponConstructor;
}

export default class WeaponObject implements Pickup {
	a: Radians;
	height: Pixels;
	layer: DisplayLayer;
	r: Pixels;
	sprite: Weapon;
	width: Pixels;
	z: Multiplier;

	constructor(
		public game: Game,
		init: WeaponObjectInit
	) {
		this.z = getZ(init.back);
		this.a = deg2rad(init.a);
		this.height = 30;
		this.layer = zDecal;
		this.r = init.r;
		this.sprite = new init.weapon(game);
		this.width = 30;
	}

	take() {
		const { game, sprite } = this;

		const old = game.inventory.swap(sprite);
		if (!old) {
			game.remove(this);
			return true;
		}

		this.sprite = old;

		// TODO: necessary?
		this.a = game.player.a;
		this.r = game.player.r;
		this.z = game.player.z;

		return true;
	}

	draw(c: CanvasRenderingContext2D) {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { bot, top } = this.getHitbox();

		drawWedge(c, cIgnore, this.game.cx, this.game.cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { a, r, z, width, height } = this;

		return {
			bot: {
				a,
				r,
				z,
				width: scaleWidth(width, r, z),
			},
			top: {
				a,
				r: r + height * z,
				z,
				width: scaleWidth(width, r + height, z),
			},
		};
	}
}
