import { aBackgroundAttack, aForegroundAttack, aSideAttack } from '../anims';
import CoordARZ from '../CoordARZ';
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
import { cart, clamp, isRightOf, uncart } from '../tools';

const gSpeed: Pixels = 1;

export default class ShootingReticle implements DrawnComponent {
	x: Pixels;
	y: Pixels;
	back: boolean;
	layer: DisplayLayer;
	sprite: ReticleController;

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
		this.sprite = new ReticleController(game);
	}

	update(time: Milliseconds) {
		this.sprite.update(time);
	}

	draw(ctx: CanvasRenderingContext2D) {
		draw2D(ctx, this);
	}

	adjust(owner: CoordARZ, time: Milliseconds) {
		const { game } = this;
		const { keys } = game;

		const aimBack = keys.has(InputButton.AimBack);
		const aimFront = keys.has(InputButton.AimFront);

		if (aimBack) this.back = true;
		else if (aimFront) this.back = false;

		if (keys.has(InputButton.AimAtMouse)) {
			const { x, y } = game.zoomer.convert(game.mousePosition);
			this.x = x;
			this.y = y;
		}

		let mx = 0;
		if (keys.has(InputButton.AimLeft)) mx = -gSpeed * time;
		if (keys.has(InputButton.AimRight)) mx = gSpeed * time;

		let my = 0;
		if (keys.has(InputButton.AimUp)) my = -gSpeed * time;
		if (keys.has(InputButton.AimDown)) my = gSpeed * time;

		const [min, max] = game.zoomer.bounds();
		this.x = clamp(this.x + mx, min.x, max.x);
		this.y = clamp(this.y + my, min.y, max.y);

		return {
			active: aimBack || aimFront,
			animation:
				this.back === getBack(owner.z)
					? aSideAttack
					: this.back
						? aBackgroundAttack
						: aForegroundAttack,
			facing: this.getFacing(owner),
		};
	}

	getFacing(owner: CoordARZ): 1 | -1 {
		const me = uncart(this.x, this.y, this.back);
		return isRightOf(owner.a, me.a) ? 1 : -1;
	}
}
