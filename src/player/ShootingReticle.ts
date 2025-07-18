import DrawnComponent from '../DrawnComponent';
import {
	DisplayLayer,
	Milliseconds,
	Multiplier,
	Pixels,
	Radians,
} from '../flavours';
import Game from '../Game';
import { InputButton } from '../InputMapper';
import { zBeforeUI } from '../layers';
import { getBack } from '../nums';
import { draw2D } from '../rendering';
import ReticleController from '../spr/ReticleController';
import SpellCircleController from '../spr/SpellCircleController';
import { cart, clamp, wrapAngle } from '../tools';

const gMoveSpeed: Pixels = 1;
const gRotationSpeed: Radians = 0.001;
const gSizeChange = 0.08;

export default class ShootingReticle implements DrawnComponent {
	x: Pixels;
	y: Pixels;
	back: boolean;
	layer: DisplayLayer;
	reticle: ReticleController;
	rotation: Radians;
	sp1: SpellCircleController;
	sp2: SpellCircleController;
	sp3: SpellCircleController;
	sp4: SpellCircleController;
	scale: Multiplier;

	constructor(
		public game: Game,
		a: Radians,
		r: Pixels,
		z: Multiplier
	) {
		const { x, y } = cart(a, r);
		this.x = x;
		this.y = y;
		this.back = getBack(z);
		this.layer = zBeforeUI;

		this.reticle = new ReticleController(game);
		this.sp1 = new SpellCircleController(game, 'player.spell.1');
		this.sp2 = new SpellCircleController(game, 'player.spell.2');
		this.sp3 = new SpellCircleController(game, 'player.spell.3');
		this.sp4 = new SpellCircleController(game, 'player.spell.4');
		this.rotation = 0;
		this.scale = 0;
	}

	update(time: Milliseconds) {
		this.reticle.update(time);
		this.sp1.update(time);
		this.sp2.update(time);
		this.sp3.update(time);
		this.sp4.update(time);
		this.rotation = wrapAngle(this.rotation + time * gRotationSpeed);

		const { keys, mousePosition, player, zoomer } = this.game;
		let { x, y } = this;

		if (keys.has(InputButton.AimAtMouse)) {
			const mouse = zoomer.convert(mousePosition);
			x = mouse.x;
			y = mouse.y;
		}

		let dScale = -gSizeChange;
		const aim = player.getAim();
		if (aim.active) {
			this.back = aim.back;
			dScale = gSizeChange;
		}

		let dx = 0;
		if (keys.has(InputButton.AimLeft)) dx = -gMoveSpeed * time;
		if (keys.has(InputButton.AimRight)) dx = gMoveSpeed * time;

		let dy = 0;
		if (keys.has(InputButton.AimUp)) dy = -gMoveSpeed * time;
		if (keys.has(InputButton.AimDown)) dy = gMoveSpeed * time;

		const [min, max] = zoomer.bounds();
		this.x = clamp(x + dx, min.x, max.x);
		this.y = clamp(y + dy, min.y, max.y);

		this.scale = clamp(this.scale + dScale, 0, 1);
	}

	draw(ctx: CanvasRenderingContext2D) {
		const {
			back,
			game,
			reticle,
			rotation,
			sp1,
			sp2,
			sp3,
			sp4,
			scale,
			x,
			y,
		} = this;

		const args = { x, y, game, back };

		const reticleScale = 1 - scale;
		if (reticleScale > 0) {
			draw2D(ctx, { ...args, sprite: reticle, scale: reticleScale });
		}

		if (scale > 0) {
			draw2D(ctx, { ...args, sprite: sp1, scale, rotation });
			draw2D(ctx, { ...args, sprite: sp2, scale, rotation: -rotation });
			draw2D(ctx, { ...args, sprite: sp3, scale, rotation });
			draw2D(ctx, { ...args, sprite: sp4, scale, rotation: -rotation });
		}
	}
}
