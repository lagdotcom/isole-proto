import AnimController from '../AnimController';
import { zSpark } from '../layers';
import { πHalf, cart, displace, scalew, collides, drawWedge } from '../tools';
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

export const aIdle = 'idle',
	aSwing = 'swing';

type ControllerGen = (img: CanvasImageSource, flip?: boolean) => AnimController;
type OnEnemyHit = (enemy: Enemy) => any;

class Swing implements DrawnComponent {
	game: Game;
	hits: Enemy[];
	layer: number;
	owner: Player;
	sprite: AnimController;
	onhit: OnEnemyHit;

	constructor(
		game: Game,
		resource: string,
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
		const me = this;
		this.sprite.next(ti);

		if (this.hasHitbox()) {
			const { bot, top } = this.getHitbox();
			var enemy = null;
			this.game.enemies.forEach(e => {
				if (collides({ bot, top }, e.getHitbox())) {
					me.hit(e);
				}
			});
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

	hasHitbox(): boolean {
		return !!this.sprite.acf.hitbox;
	}

	getHitboxPosition() {
		const { owner, sprite } = this;

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
		if (!this.hasHitbox()) return;

		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHit, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, w, h } = this.getHitboxPosition();
		const baw = scalew(w, r),
			taw = scalew(w, r + h);

		return {
			bot: {
				r: r,
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
	swingResource: string;
	onhit: OnEnemyHit;
	anim: string;

	constructor(
		game: Game,
		controllerGen: ControllerGen,
		resource: string,
		swingResource: string,
		cooldown: number,
		anim: string,
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
