import Controller from '../Controller';
import { aThrow } from '../anims';
import { cHit } from '../colours';
import { dLeft } from '../dirs';
import { eThrow } from '../events';
import { gGravityStrength, gTimeScale, gWalkScale } from '../nums';
import {
	angledist,
	anglewrap,
	cart,
	collides,
	pi,
	piHalf,
	scalew,
	damage,
	first,
	drawWedge,
	anglecollides,
} from '../tools';
import { zFlying } from '../layers';
import Item from '../Item';
import Game from '../Game';
import DrawnComponent from '../DrawnComponent';
import Flat from '../component/Flat';
import Player from '../Player';
import Wall from '../component/Wall';
import Hitbox from '../Hitbox';

const gFloatTime = 80,
	gWindLoss = 0.995;

const controller = (img: CanvasImageSource) =>
	new Controller({ img, w: 48, h: 48 });

class Rock implements DrawnComponent {
	a: number;
	float: number;
	game: Game;
	h: number;
	layer: number;
	owner: Player;
	sprite: Controller;
	r: number;
	tscale: number;
	va: number;
	vfa: number;
	vr: number;
	w: number;

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

		this.sprite.xo = -24;
		this.sprite.yo = -36;
	}

	update(time: number): void {
		var { game, va, vfa, vr, a, r, float } = this,
			{ enemies, floors, walls } = game,
			tscale = time / gTimeScale;

		const { bot, top } = this.getHitbox();
		var enemy = first(enemies, e => collides({ bot, top }, e.getHitbox()));

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

		var floor: Flat | null = null;
		if (vr < 0) {
			floor = first(floors, f => {
				var da = angledist(a, f.a);
				return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
			});
		}

		var wall: Wall | null = null;
		wall = first(walls, w => {
			return top.r >= w.bottom && bot.r <= w.top && anglecollides(bot, w);
		});

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
			a += pi;
		}

		this.a = anglewrap(a);
		this.r = r;
		this.float = float;
	}

	draw(c: CanvasRenderingContext2D): void {
		const { a, r, game, sprite } = this;
		const { cx, cy } = game;
		const normal = a + piHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHit, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, va, vr, w, h, tscale } = this;
		const baw = scalew(w, r),
			taw = scalew(w, r + h);
		var amod: number,
			vbr = 0,
			vtr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr > 0) vtr = vr;
		else if (vr < 0) vbr = vr;

		return {
			bot: {
				r: r + vbr,
				a: amod,
				width: baw,
			},
			top: {
				r: r + h + vtr,
				a: amod,
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

	draw(c: CanvasRenderingContext2D, x: number, y: number) {
		c.translate(x, y);
		this.sprite.draw(c);
		c.translate(-x, -y);
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
		this.game.player.sprite.play(aThrow, false, { [eThrow]: this.thrown });
	}

	thrown() {
		const { game } = this;

		// TODO
		//game.inventory.remove(this);

		// TODO: change to use hotspot
		game.redraw = true;
		game.components.push(
			new Rock(game, {
				r: game.player.r + 10,
				a: game.player.a,
				va: game.player.facing === dLeft ? -1 : 1,
				float: gFloatTime,
				owner: game.player,
			})
		);
	}
}
