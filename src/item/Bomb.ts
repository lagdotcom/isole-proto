import { aThrow } from '../anims';
import { cHit } from '../colours';
import { dLeft } from '../dirs';
import { eThrow } from '../events';
import {
	gGravityStrength,
	gTimeScale,
	gWalkScale,
	gGroundFriction,
} from '../nums';
import {
	angledist,
	anglewrap,
	cart,
	collides,
	pi,
	piHalf,
	scalew,
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
import AnimController from '../AnimController';

const gBombTimer = 3000,
	gBombWarning = 1000,
	gBounciness = 0.6,
	gThrowVA = 0.4,
	gThrowVR = 0.6;

const animations = {
	idle: {
		extend: true,
		frames: [{ c: 0, r: 0, t: 1000 }],
	},

	lit: {
		loop: true,
		frames: [
			{ c: 1, r: 0, t: 75 },
			{ c: 1, r: 1, t: 75 },
			{ c: 1, r: 2, t: 75 },
			{ c: 1, r: 3, t: 75 },
		],
	},

	warning: {
		loop: true,
		frames: [
			{ c: 2, r: 0, t: 75 },
			{ c: 2, r: 1, t: 75 },
			{ c: 2, r: 2, t: 75 },
			{ c: 2, r: 3, t: 75 },
		],
	},
};

class BombController extends AnimController {
	constructor(img: CanvasImageSource) {
		super({
			animations,
			img,
			w: 60,
			h: 60,
			xo: -30,
			yo: -45,
			leftflip: false,
		});
	}

	idle(): void {
		this.play('idle');
	}

	lit(): void {
		this.play('lit');
	}

	warning(): void {
		this.play('warning');
	}
}

class Bomb implements DrawnComponent {
	a: number;
	game: Game;
	h: number;
	layer: number;
	owner: Player;
	sprite: BombController;
	r: number;
	timer: number;
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
				sprite: new BombController(game.resources['item.bomb']),
				w: 30,
				h: 30,
				vr: 0,
				vfa: 0,
				timer: gBombTimer,
				tscale: 0,
			},
			options
		);

		this.sprite.lit();
	}

	update(time: number): void {
		var { game, va, vfa, vr, a, r, timer } = this,
			{ enemies, floors, walls } = game,
			tscale = time / gTimeScale;

		const { bot, top } = this.getHitbox();
		var enemy = first(enemies, e => collides({ bot, top }, e.getHitbox()));

		this.tscale = tscale;

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

		if (wall) {
			va *= -gBounciness;
		}

		if (floor) {
			vfa = floor.motion;
			va *= gGroundFriction;
			vr *= -gBounciness;

			if (r < floor.r) r = floor.r;
		} else {
			vr -= gGravityStrength;
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

		this.timer = timer - time;
		if (this.timer <= gBombWarning && this.sprite.a !== 'warning') {
			this.sprite.warning();
		}

		if (this.timer <= 0) {
			// TODO
			this.game.remove(this);
		}

		this.sprite.next(time);
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
		var amod,
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

export default class BombItem implements Item {
	game: Game;
	sprite: BombController;
	xo: number;
	yo: number;

	constructor(game: Game) {
		Object.assign(this, {
			game,
			sprite: new BombController(game.resources['item.bomb']),
			thrown: this.thrown.bind(this),
		});

		this.sprite.idle();
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
		const dirVa = game.player.facing === dLeft ? -gThrowVA : gThrowVA;

		// TODO
		//game.inventory.remove(this);

		// TODO: change to use hotspot
		game.redraw = true;
		game.components.push(
			new Bomb(game, {
				r: game.player.r + 10,
				a: game.player.a,
				va: game.player.va + dirVa,
				vr: game.player.vr + gThrowVR,
				owner: game.player,
			})
		);
	}
}
