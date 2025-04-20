import Damageable from '../Damageable';
import Enemy from '../Enemy';
import Game from '../Game';
import Hitbox from '../Hitbox';
import mel from '../makeElement';
import { deg2rad, jbr } from '../tools';

const gStunMultiplier = 200;

export default abstract class AbstractEnemy implements Enemy {
	a: number;
	alive: boolean;
	del: HTMLElement;
	game: Game;
	health: number;
	height: number;
	isEnemy: true;
	layer: number;
	name: string;
	r: number;
	stunmultiplier: number;
	stuntimer: number;
	va: number;
	vr: number;
	width: number;

	abstract draw(ctx: CanvasRenderingContext2D): void;
	abstract getHitbox(): Hitbox;

	constructor(options: any) {
		this.stunmultiplier = gStunMultiplier;
		this.stuntimer = 0;

		Object.assign(this, options);
		this.a = deg2rad(this.a);

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

	dostun(t: number) {
		if (this.stuntimer) {
			this.stuntimer -= t;
			if (this.stuntimer < 0) {
				t = -this.stuntimer;
				this.stuntimer = 0;
			} else t = 0;
		}

		return t;
	}

	die(by: Damageable) {
		if (this.del && this.game.options.debugContainer) {
			this.game.options.debugContainer.removeChild(this.del);
		}

		this.game.remove(this);
	}
}
