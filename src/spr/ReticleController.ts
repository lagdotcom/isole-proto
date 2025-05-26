import AnimController from '../AnimController';
import { ResourceName } from '../flavours';
import Game from '../Game';

export default class ReticleController extends AnimController {
	constructor(game: Game, img: ResourceName = 'reticle') {
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
			w: 128,
			h: 128,
			xo: -64,
			yo: -64,
		});

		this.play('idle');
	}

	update(t: number) {
		this.next(t);
	}
}
