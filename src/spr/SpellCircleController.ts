import AnimController from '../AnimController';
import { Milliseconds, ResourceName } from '../flavours';
import Game from '../Game';

export default class SpellCircleController extends AnimController {
	constructor(game: Game, img: ResourceName) {
		super({
			img: game.resources[img],
			animations: {
				idle: {
					loop: true,
					frames: [
						{ c: 0, r: 0, t: 75 },
						{ c: 0, r: 1, t: 75 },
						{ c: 0, r: 2, t: 75 },
						{ c: 0, r: 3, t: 75 },
					],
				},
			},
			w: 158,
			h: 158,
			xo: -79,
			yo: -79,
		});

		this.play('idle');
	}

	update(t: Milliseconds) {
		this.next(t);
	}
}
