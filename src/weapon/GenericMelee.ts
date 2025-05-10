import AnimController from '../AnimController';
import { aAxe } from '../anims';
import { cHit } from '../colours';
import CoordARZ from '../CoordARZ';
import DrawnComponent from '../DrawnComponent';
import Enemy from '../Enemy';
import { eAnimationEnded } from '../events';
import { AnimName, Pixels, ResourceName } from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import HitboxXYWH from '../HitboxXYWH';
import { zSpark } from '../layers';
import Player from '../Player';
import { drawSprite } from '../rendering';
import {
	cart,
	collides,
	displace,
	drawWedge,
	scaleWidth,
	πHalf,
} from '../tools';
import Weapon from '../Weapon';

export const aIdle = 'idle',
	aSwing = 'swing';

type ControllerGen = (img: CanvasImageSource, flip?: boolean) => AnimController;
type OnEnemyHit = (enemy: Enemy) => void;

class Swing implements DrawnComponent {
	back: boolean;
	game: Game;
	hits: Enemy[];
	layer: number;
	owner: Player;
	sprite: AnimController;
	onhit: OnEnemyHit;

	constructor(
		game: Game,
		resource: ResourceName,
		controllerGen: ControllerGen,
		onhit: OnEnemyHit
	) {
		this.game = game;
		this.owner = game.player;
		this.back = this.owner.back;
		this.sprite = controllerGen(
			game.resources[resource],
			game.player.sprite.flip
		);
		this.layer = zSpark;
		this.hits = [];
		this.onhit = onhit;

		this.sprite.play(aSwing, false, {
			[eAnimationEnded]: this.done.bind(this),
		});
	}

	update(ti: number): void {
		this.sprite.next(ti);

		if (this.sprite.acf.hitbox) {
			const { bot, top } = this.getHitbox(this.sprite.acf.hitbox);
			for (const e of this.game.enemies) {
				if (collides({ bot, top }, e.getHitbox())) {
					this.hit(e);
				}
			}
		}
	}

	hit(enemy: Enemy): void {
		// don't hit the same enemy twice in one swing
		if (this.hits.includes(enemy)) return;
		this.hits.push(enemy);

		this.onhit(enemy);
	}

	getPosition(): CoordARZ {
		const { owner, sprite } = this;

		return displace(
			owner,
			[owner.sprite.hotspot, sprite.hotspot],
			sprite.flip
		);
	}

	getHitboxPosition(hitbox: HitboxXYWH) {
		const { owner, sprite } = this;

		return {
			back: owner.back ?? false,
			w: hitbox.w,
			h: hitbox.h,
			...displace(
				owner,
				[owner.sprite.hotspot, sprite.hotspot, hitbox],
				sprite.flip
			),
		};
	}

	draw(c: CanvasRenderingContext2D): void {
		if (!this.owner.alive) return;

		const { game, sprite } = this;
		const { cx, cy } = game;
		const { a, r, z } = this.getPosition();

		const normal = a + πHalf;

		const { x, y } = cart(a, r);

		drawSprite(c, sprite, { cx, cy, x, y, z, normal });
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const hitbox = this.sprite.acf.hitbox;
		if (!hitbox) return;

		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox(hitbox);

		drawWedge(c, cHit, cx, cy, bot, top);
	}

	getHitbox(hitbox: HitboxXYWH): Hitbox {
		const { back, r, a, z, w, h } = this.getHitboxPosition(hitbox);
		const baw = scaleWidth(w, r, z),
			taw = scaleWidth(w, r + h, z);

		return {
			bot: {
				back,
				r,
				a,
				z,
				width: baw,
			},
			top: {
				back,
				r: r + h * z,
				a,
				z,
				width: taw,
			},
		};
	}

	done(): void {
		const { game } = this;

		game.redraw = true;
		game.remove(this);
	}
}

export default class GenericMelee implements Weapon {
	swing?: Swing;
	cooldown: number;
	timer: number;
	game: Game;
	sprite: AnimController;
	controllerGen: ControllerGen;
	swingResource: ResourceName;
	onhit: OnEnemyHit;
	anim: AnimName;

	constructor(
		game: Game,
		controllerGen: ControllerGen,
		resource: ResourceName,
		swingResource: ResourceName,
		cooldown: number,
		anim: AnimName,
		onhit: OnEnemyHit
	) {
		this.game = game;
		this.controllerGen = controllerGen;
		this.sprite = controllerGen(game.resources[resource]);
		this.cooldown = cooldown;
		this.timer = 0;
		this.swingResource = swingResource;
		this.onhit = onhit.bind(this);
		this.anim = anim;

		game.on('player.hurt', this.detach.bind(this));
	}

	update(t: number) {
		this.timer -= t;
	}

	canUse(): boolean {
		const player = this.game.player;
		return (
			this.timer <= 0 &&
			player.alive &&
			!player.sprite.flags.noAttack &&
			!player.sprite.flags.noControl
		);
	}

	draw(c: CanvasRenderingContext2D, x?: Pixels, y?: Pixels): void {
		this.sprite.draw(c, x, y);
	}

	use(): void {
		const { game } = this;

		this.timer = this.cooldown;

		this.swing = new Swing(
			game,
			this.swingResource,
			this.controllerGen,
			this.onhit
		);

		game.redraw = true;
		game.components.push(this.swing);

		game.player.sprite.play(aAxe);
	}

	detach(): void {
		if (this.swing) this.swing.done();
	}
}
