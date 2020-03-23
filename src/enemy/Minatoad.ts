import Game from '../Game';
import Buster from './Buster';
import Controller from '../Controller';
import { Facing } from '../dirs';

// IDLE - 75ms, activates when player is within a certain distance, stays on first frame if player is far
// JUMP - 75ms & halt on final ascent til apex and descent frames til landing, activates when player is close
// TRUNK SHOT - 75 ms for the first 4 frames, 300 ms on the 5th, 75ms on frames 6 through 9, hold for 300 ms on the 10th. 75ms on frames 11 and 12 to return to the idle stance.
//     NOTE: Frames 6 through 10 are able to be repeated, the idea being the boss can shoot things from the trunk multiple times in a row if need be.

class MinatoadController extends Controller {
	constructor(img: CanvasImageSource) {
		super({
			img,
			w: 240,
			h: 240,
			xo: -120,
			yo: -170,
		});
	}

	idle(t: number) {
		this.show('idle', 0, 0);
	}

	near(t: number) {
		if (this.show('near', 0, 0)) {
			this.timer += t;
			if (this.timer >= 75) {
				this.r++;
				this.timer = 0;
				if (this.r >= 6) this.r = 0;
			}
		}
	}

	jump(t: number) {
		if (this.show('jump', 1, 0)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 1) {
				this.r++;
				this.timer = 0;
			}
		}
	}

	rise(t: number) {
		if (this.show('rise', 1, 2)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 3) {
				this.r++;
				this.timer = 0;
			}
		}
	}

	fall(t: number) {
		if (this.show('fall', 1, 4)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 7) {
				this.r++;
				this.timer = 0;
			}
		}
	}
}

interface MinatoadOptions {
	facing?: Facing;
	img?: string;
}

export default class Minatoad extends Buster {
	facing: Facing;

	constructor(game: Game, options: MinatoadOptions = {}) {
		super(game, {
			...options,
			width: 80,
			height: 80,
			sprite: new MinatoadController(
				game.resources[options.img || 'enemy.minatoad']
			),
		});

		this.name = 'Minatoad';
		this.facing = options.facing || 'L';
	}
}
