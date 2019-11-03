import AnimController, { AnimSpecMap } from '../AnimController';
import { zSpark } from '../layers';
import {
	piHalf,
	cart,
	displace,
	scalew,
	collides,
	damage,
	dirv,
} from '../tools';
import { aAxe } from '../anims';
import { eAnimationEnded, ePlayerHurt } from '../events';
import { cHit } from '../colours';
import CoordAR from '../CoordAR';
import Game from '../Game';
import DrawnComponent from '../DrawnComponent';
import Enemy from '../Enemy';
import Hitbox from '../Hitbox';
import Player from '../Player';
import Weapon from '../Weapon';

const gCooldown = 700;

const aIdle = 'idle',
	aSwing = 'swing';

const animations: AnimSpecMap = {
	[aIdle]: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 600 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
		],
	},

	[aSwing]: {
		frames: [
			{ c: 1, r: 0, t: 225, hitbox: { x: -60, y: 15, w: 55, h: 53 } },
			{ c: 1, r: 1, t: 75, hitbox: { x: 65, y: -19, w: 55, h: 60 } },
			{ c: 1, r: 2, t: 75, hitbox: { x: 65, y: -19, w: 55, h: 60 } },
			{ c: 1, r: 3, t: 150 },
		],
	},
};

const controller = (img: CanvasImageSource, flip?: boolean) =>
	new AnimController({
		img,
		flip,
		w: 160,
		h: 160,
		xo: -80,
		yo: -110,
		animations,
	});

/*
ITEM BOBBLE: Frame 1 is 600 ms, Frame 2 & 3 are 75 ms

Swing - Angled frame 225 MS, smear swing frame 2 and 3 at 75 MS, final frame for 150 MS
*/

class Axe implements DrawnComponent {
	game: Game;
	hits: Enemy[];
	layer: number;
	owner: Player;
	sprite: AnimController;

	constructor(game: Game) {
		Object.assign(this, {
			game,
			owner: game.player,
			sprite: controller(
				game.resources['weapon.axe'],
				game.player.sprite.flip
			),
			layer: zSpark,
			hits: [],
		});

		this.sprite.play(aSwing, false, {
			[eAnimationEnded]: this.done.bind(this),
		});
	}

	update(ti: number): void {
		const me = this;
		this.sprite.next(ti);

		if (this.hasHitbox()) {
			const { b, t } = this.getHitbox();
			var enemy = null;
			this.game.enemies.forEach(e => {
				if (collides({ b, t }, e.getHitbox())) {
					me.hit(e);
				}
			});
		}
	}

	hit(enemy: Enemy): void {
		// don't hit the same enemy twice in one swing
		if (this.hits.includes(enemy)) return;
		this.hits.push(enemy);

		// TODO: this doesn't seem to be working
		const dv = dirv(this.owner, enemy);
		enemy.va += Math.sign(dv.a) * 2; // knock back a bit
		enemy.last = {}; // unstick krillna

		// TODO: always 2?
		damage(enemy, this.owner, 2);
	}

	getPosition(): CoordAR {
		const { game, owner, sprite } = this;

		return displace(
			owner,
			[owner.sprite.hotspot, sprite.hotspot],
			sprite.flip
		);
	}

	hasHitbox(): boolean {
		return !!this.sprite.acf.hitbox;
	}

	getHitboxPosition() {
		const { game, owner, sprite } = this;

		return {
			w: sprite.acf.hitbox!.w,
			h: sprite.acf.hitbox!.h,
			...displace(
				owner,
				[owner.sprite.hotspot, sprite.hotspot, sprite.acf.hitbox!],
				sprite.flip
			),
		};
	}

	draw(c: CanvasRenderingContext2D): void {
		const { game, owner, sprite } = this;
		const { cx, cy } = game;
		const { a, r } = this.getPosition();

		const normal = a + piHalf;

		if (!owner.alive) return;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		if (!this.hasHitbox()) return;

		const { game, sprite } = this;
		const { cx, cy } = game;
		const { b, t } = this.getHitbox();

		c.strokeStyle = cHit;
		c.beginPath();
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.arc(cx, cy, t.r, t.ar, t.al, true);
		c.arc(cx, cy, b.r, b.al, b.ar);
		c.stroke();
	}

	getHitbox(): Hitbox {
		const { r, a, w, h } = this.getHitboxPosition();
		const baw = scalew(w, r),
			taw = scalew(w, r + h);

		return {
			b: {
				r: r,
				aw: baw,
				al: a - baw,
				ar: a + baw,
			},
			t: {
				r: r + h,
				aw: taw,
				al: a - taw,
				ar: a + taw,
			},
		};
	}

	done(): void {
		const { game } = this;

		game.redraw = true;
		game.remove(this);
	}
}

export default class AxeWeapon implements Weapon {
	axe: Axe | null;
	cooldown: number;
	game: Game;
	sprite: AnimController;

	constructor(game: Game) {
		Object.assign(this, {
			game,
			sprite: controller(game.resources['weapon.axe']),
			cooldown: 0,
			axe: null,
		});

		game.on(ePlayerHurt, this.detach.bind(this));
	}

	update(t: number) {
		this.cooldown -= t;
	}

	canUse(): boolean {
		const player = this.game.player;
		return (
			this.cooldown <= 0 &&
			player.alive &&
			!player.sprite.flags.noAttack &&
			!player.sprite.flags.noControl
		);
	}

	draw(c: CanvasRenderingContext2D, x: number, y: number): void {
		c.translate(x, y);
		this.sprite.draw(c);
		c.translate(-x, -y);
	}

	use(): void {
		const { game } = this;

		this.cooldown = gCooldown;

		this.axe = new Axe(game);

		game.redraw = true;
		game.components.push(this.axe);

		game.player.sprite.play(aAxe);
	}

	detach(): void {
		if (this.axe) this.axe.done();
	}
}
