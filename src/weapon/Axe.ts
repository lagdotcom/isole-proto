import AnimController, { AnimSpecMap } from '../AnimController';
import { aAxe } from '../anims';
import Enemy from '../Enemy';
import Game from '../Game';
import { damage } from '../tools';
import GenericMelee, { aIdle, aSwing } from './GenericMelee';

const gCooldown = 700;

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

const controller = (img: HTMLImageElement, flip?: boolean) =>
	new AnimController({
		img,
		flip,
		w: 160,
		h: 160,
		xo: -80,
		yo: -110,
		animations,
	});

export default class AxeWeapon extends GenericMelee {
	constructor(game: Game) {
		super(
			game,
			controller,
			'weapon.axe',
			'weapon.axe',
			gCooldown,
			aAxe,
			(enemy: Enemy) => {
				// TODO: always 2?
				damage(enemy, this.swing!.owner, 2);
			}
		);
	}
}
