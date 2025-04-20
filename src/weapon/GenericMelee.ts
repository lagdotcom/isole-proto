import AnimController from '../AnimController';
import { aAxe } from '../anims';
import { cHit } from '../colours';
import CoordAR from '../CoordAR';
import DrawnComponent from '../DrawnComponent';
import Enemy from '../Enemy';
import { eAnimationEnded, ePlayerHurt } from '../events';
import { AnimName, ResourceName } from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import HitboxXYWH from '../HitboxXYWH';
import { zSpark } from '../layers';
import Player from '../Player';
import { cart, collides, displace, drawWedge, scalew, πHalf } from '../tools';
import Weapon from '../Weapon';

export const aIdle = 'idle',
	aSwing = 'swing';

type ControllerGen = (img: CanvasImageSource, flip?: boolean) => AnimController;
type OnEnemyHit = (enemy: Enemy) => void;

class Swing implements DrawnComponent {
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

	getPosition(): CoordAR {
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
		const { game, owner, sprite } = this;
		const { cx, cy } = game;
		const { a, r } = this.getPosition();

		const normal = a + πHalf;

		if (!owner.alive) return;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
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
		const { r, a, w, h } = this.getHitboxPosition(hitbox);
		const baw = scalew(w, r),
			taw = scalew(w, r + h);

		return {
			bot: {
				r,
				a,
				width: baw,
			},
			top: {
				r: r + h,
				a,
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

		game.on(ePlayerHurt, this.detach.bind(this));
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

	draw(c: CanvasRenderingContext2D, x: number, y: number): void {
		c.translate(x, y);
		this.sprite.draw(c);
		c.translate(-x, -y);
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
