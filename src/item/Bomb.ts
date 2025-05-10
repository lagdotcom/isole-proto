import AnimController from '../AnimController';
import { aThrow } from '../anims';
import { cHit } from '../colours';
import { dLeft } from '../dirs';
import DrawnComponent from '../DrawnComponent';
import { eThrow } from '../events';
import { Multiplier, Pixels } from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import Item from '../Item';
import { zFlying } from '../layers';
import {
	gGravityStrength,
	gGroundFriction,
	gTimeScale,
	gWalkScale,
} from '../nums';
import physics from '../physics';
import Player from '../Player';
import { draw3D } from '../rendering';
import {
	collides,
	displace,
	drawWedge,
	first,
	scaleWidth,
	wrapAngle,
	π,
} from '../tools';

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
			leftFlip: false,
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
	back: boolean;
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
	z: Multiplier;

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
		const { game, timer } = this;
		let { va, vfa, vr, a, r } = this;
		const tscale = time / gTimeScale;

		const { bot, top } = this.getHitbox();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const enemy = first(game.enemies, e =>
			collides({ bot, top }, e.getHitbox())
		);

		this.tscale = tscale;

		// TODO check ceiling?
		const { floor, wall } = physics(this, time);

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
			a += π;
		}

		this.a = wrapAngle(a);
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
		let amod,
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
		this.game.player.sprite.play(aThrow, false, { [eThrow]: this.thrown });
	}

	thrown() {
		const { game } = this;
		const facingLeft = game.player.facing === dLeft;

		// TODO
		//game.inventory.remove(this);

		game.redraw = true;
		game.components.push(
			new Bomb(game, {
				...displace(
					game.player,
					[game.player.sprite.hotspot],
					facingLeft
				),
				back: game.player.back,
				va: game.player.va + (facingLeft ? -gThrowVA : gThrowVA),
				vr: game.player.vr + gThrowVR,
				owner: game.player,
			})
		);
	}
}
