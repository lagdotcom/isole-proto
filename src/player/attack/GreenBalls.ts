import AnimController, { AnimSpecMap } from '../../AnimController';
import { cHit } from '../../colours';
import DrawnComponent from '../../DrawnComponent';
import {
	DisplayLayer,
	Milliseconds,
	Pixels,
	ResourceName,
} from '../../flavours';
import Game from '../../Game';
import { zPlayerAttack } from '../../layers';
import { getZ } from '../../nums';
import { draw2D } from '../../rendering';
import {
	aimXYZatXYZ,
	collides,
	damage,
	displace,
	drawWedge,
	scaleWidth,
	toARZ,
	toXYZ,
} from '../../tools';
import PlayerAttack from './PlayerAttack';

const gLifetime: Milliseconds = 3000;
const gChargeSpeed = 1;
const gChargeRequired = 600;
const gSpeed: Pixels = 0.5;

const animations: AnimSpecMap = {
	normal: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 75 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
		],
	},
	bouncy: {
		loop: true,
		frames: [
			{ c: 1, r: 0, t: 75 },
			{ c: 1, r: 1, t: 75 },
			{ c: 1, r: 2, t: 75 },
			{ c: 1, r: 3, t: 75 },
		],
	},
	small: {
		loop: true,
		frames: [
			{ c: 2, r: 0, t: 75 },
			{ c: 2, r: 1, t: 75 },
			{ c: 2, r: 2, t: 75 },
		],
	},
};

type GreenBallType = 'normal' | 'bouncy' | 'small';

class GreenBallController extends AnimController {
	constructor(
		game: Game,
		type: GreenBallType,
		img: ResourceName = 'projectile.woody'
	) {
		super({
			img: game.resources[img],
			animations,
			w: 80,
			h: 80,
			xo: -40,
			yo: -52,
		});

		this.play(type);
	}
}

class GreenBall implements DrawnComponent {
	x: Pixels;
	y: Pixels;
	z: Pixels;
	vx: Pixels;
	vy: Pixels;
	vz: Pixels;
	w: Pixels;
	h: Pixels;
	lifetime: Milliseconds;
	sprite: GreenBallController;
	layer: DisplayLayer;
	ignoreGravity: boolean;

	constructor(public game: Game) {
		const { player } = game;

		this.layer = zPlayerAttack;
		this.w = 20;
		this.h = 20;

		const xyz = toXYZ(
			displace(player, [player.sprite.hotspot], player.sprite.flip)
		);
		this.x = xyz.x;
		this.y = xyz.y;
		this.z = xyz.z;

		const aim = aimXYZatXYZ(
			xyz,
			{
				x: player.reticle.x,
				y: player.reticle.y,
				z: getZ(player.reticle.back) as Pixels,
			},
			gSpeed
		);
		this.vx = aim.x;
		this.vy = aim.y;
		this.vz = aim.z;
		this.ignoreGravity = true;

		this.sprite = new GreenBallController(game, 'normal');
		this.lifetime = gLifetime;
	}

	getARZ() {
		return toARZ(this);
	}

	update(time: Milliseconds) {
		this.x += this.vx * time;
		this.y += this.vy * time;
		this.z += this.vz * time;

		this.lifetime -= time;
		if (this.lifetime <= 0 || this.z <= 0 || this.z >= 2) {
			this.game.remove(this);
			return;
		}

		const a = this.getHitbox();
		for (const enemy of this.game.enemies) {
			if (collides(a, enemy.getHitbox())) {
				damage(enemy, this.game.player, 1);
				this.game.remove(this);
				return;
			}
		}

		this.sprite.next(time);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const { x, y, z, game, sprite } = this;
		const arz = toARZ({ x, y, z });

		draw2D(ctx, { x, y, game, sprite, scale: arz.z });
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHit, cx, cy, bot, top);
	}

	getHitbox() {
		const { a, r, z } = this.getARZ();
		const { w, h } = this;
		const baw = scaleWidth(w, r, z),
			taw = scaleWidth(w, r + h, z);

		return {
			bot: {
				r,
				a,
				z,
				width: baw,
			},
			top: {
				r: r + h * z,
				a,
				z,
				width: taw,
			},
		};
	}
}

export default class GreenBalls implements PlayerAttack {
	charge: number;

	constructor(public game: Game) {
		this.charge = gChargeRequired;
	}

	update(time: Milliseconds, firing: boolean) {
		this.charge += gChargeSpeed * time;
		if (firing && this.charge >= gChargeRequired) {
			this.charge = 0;

			const projectile = new GreenBall(this.game);
			this.game.components.push(projectile);
			this.game.redraw = true;
		}
	}
}
