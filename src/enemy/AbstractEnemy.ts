import Damageable from '../Damageable';
import Enemy from '../Enemy';
import {
	DisplayLayer,
	Milliseconds,
	Multiplier,
	Pixels,
	Radians,
} from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import mel from '../makeElement';
import { getZ } from '../nums';
import { deg2rad, jbr } from '../tools';

const gStunMultiplier = 200;

export default abstract class AbstractEnemy implements Enemy {
	a: Radians;
	alive: boolean;
	del: HTMLElement;
	game: Game;
	health: number;
	height: Pixels;
	isEnemy: true;
	layer: DisplayLayer;
	name: string;
	r: Pixels;
	stunmultiplier: number;
	stuntimer: Milliseconds;
	va: number;
	vr: number;
	width: Pixels;
	z: Multiplier;

	abstract draw(ctx: CanvasRenderingContext2D): void;
	abstract getHitbox(): Hitbox;

	constructor(options: any) {
		this.stunmultiplier = gStunMultiplier;
		this.stuntimer = 0;

		Object.assign(this, options);
		this.z = getZ(options.back ?? false);
		this.a = deg2rad(options.a ?? 0);

		if (this.game.options.showDebug) {
			this.del = mel(this.game.options.debugContainer, 'div', {
				className: 'debug debug-enemy',
			});
		}
	}

	protected debug(data: Record<string, string>) {
		this.del.innerHTML = jbr(
			`<b>${this.name}</b>`,
			`stun: ${this.stuntimer}`,
			...Object.entries(data).map(([name, value]) => `${name}: ${value}`)
		);
	}

	hurt(by: Damageable, amount: number) {
		this.stuntimer = amount * this.stunmultiplier;
	}

	dostun(t: Milliseconds) {
		if (this.stuntimer) {
			this.stuntimer -= t;
			if (this.stuntimer < 0) {
				t = -this.stuntimer;
				this.stuntimer = 0;
			} else t = 0;
		}

		return t;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	die(by: Damageable) {
		if (this.del && this.game.options.debugContainer) {
			this.game.options.debugContainer.removeChild(this.del);
		}

		this.game.remove(this);
	}
}
