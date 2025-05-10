import { aThrow } from '../anims';
import { cHit } from '../colours';
import Controller from '../Controller';
import { dLeft } from '../dirs';
import DrawnComponent from '../DrawnComponent';
import { eThrow } from '../events';
import { DisplayLayer, Multiplier, Pixels, Radians } from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import Item from '../Item';
import { zFlying } from '../layers';
import { gGravityStrength, gTimeScale, gWalkScale } from '../nums';
import physics from '../physics';
import Player from '../Player';
import { draw3D } from '../rendering';
import {
	collides,
	damage,
	displace,
	drawWedge,
	first,
	scaleWidth,
	wrapAngle,
	π,
} from '../tools';

const gFloatTime = 80,
	gWindLoss = 0.995;

const controller = (img: CanvasImageSource) =>
	new Controller({ img, w: 48, h: 48, xo: -24, yo: -36 });

class Rock implements DrawnComponent {
	a: Radians;
	back: boolean;
	float: number;
	game: Game;
	h: Pixels;
	layer: DisplayLayer;
	owner: Player;
	sprite: Controller;
	r: Pixels;
	tscale: number;
	va: number;
	vfa: number;
	vr: number;
	w: number;
	z: Multiplier;

	constructor(game: Game, options = {}) {
		Object.assign(
			this,
			{
				layer: zFlying,
				game,
				sprite: controller(game.resources['item.rock']),
				w: 28,
				h: 28,
				vr: 0,
				vfa: 0,
				tscale: 0,
			},
			options
		);
	}

	update(time: number): void {
		const { game, vfa } = this;
		let { va, vr, a, r, float } = this;
		const tscale = time / gTimeScale;

		const { bot, top } = this.getHitbox();
		const enemy = first(game.enemies, e =>
			collides({ bot, top }, e.getHitbox())
		);

		if (enemy) {
			// TODO: bounce etc
			game.remove(this);
			damage(enemy, this.owner, 1);
			return;
		}

		this.tscale = tscale;
		float -= tscale;

		if (float <= 0) vr -= gGravityStrength;
		va *= gWindLoss;

		// TODO check ceiling?
		const { floor, wall } = physics(this, time);

		if (floor || wall) {
			// TODO: bounce etc
			game.remove(this);
			return;
		}

		this.va = va;
		this.vfa = vfa;
		this.vr = vr;
		a += (va / r) * tscale * gWalkScale + vfa;
		r += vr * tscale;

		if (r < 0) {
			r *= -1;
			a += π;
		}

		this.a = wrapAngle(a);
		this.r = r;
		this.float = float;
	}

	draw(c: CanvasRenderingContext2D): void {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHit, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { back, r, a, z, va, vr, w, h, tscale } = this;
		const baw = scaleWidth(w, r, z),
			taw = scaleWidth(w, r + h, z);
		let amod: number,
			vbr = 0,
			vtr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr > 0) vtr = vr;
		else if (vr < 0) vbr = vr;

		return {
			bot: {
				back,
				r: r + vbr,
				a: amod,
				z,
				width: baw,
			},
			top: {
				back,
				r: r + h * z + vtr,
				a: amod,
				z,
				width: taw,
			},
		};
	}
}

export default class RockItem implements Item {
	game: Game;
	sprite: Controller;

	constructor(game: Game) {
		Object.assign(this, {
			game,
			sprite: controller(game.resources['item.rock']),
			thrown: this.thrown.bind(this),
		});
	}

	draw(c: CanvasRenderingContext2D, x?: Pixels, y?: Pixels) {
		this.sprite.draw(c, x, y);
	}

	canUse() {
		const player = this.game.player;
		return (
			player.alive &&
			!player.sprite.flags.noAttack &&
			!player.sprite.flags.noControl
		);
	}

	use() {
		this.game.player.sprite.play(aThrow, false, {
			[eThrow]: this.thrown.bind(this),
		});
	}

	thrown() {
		const { game } = this;
		const facingLeft = game.player.facing === dLeft;

		// TODO
		//game.inventory.remove(this);

		game.redraw = true;
		game.components.push(
			new Rock(game, {
				...displace(
					game.player,
					[game.player.sprite.hotspot],
					facingLeft
				),
				back: game.player.back,
				va: facingLeft ? -1 : 1,
				float: gFloatTime,
				owner: game.player,
			})
		);
	}
}
