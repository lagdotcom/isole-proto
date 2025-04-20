import Controller from '../Controller';
import { Facing } from '../dirs';
import { ResourceName } from '../flavours';
import Game from '../Game';
import Player from '../Player';
import Buster from './Buster';

class BoosterController extends Controller {
	constructor(img: CanvasImageSource) {
		super({
			img,
			w: 84,
			h: 56,
			xo: -42,
			yo: -52,
		});
	}

	idle(t: number) {}
	near(t: number) {}

	jump(t: number) {
		if (this.show('jump', 0, 0)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 1) {
				this.r++;
				this.timer = 0;
			}
		}
	}

	rise(t: number) {
		if (this.show('rise', 0, 2)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 3) {
				this.r++;
				this.timer = 0;
			}
		}
	}

	fall(t: number) {
		if (this.show('fall', 0, 4)) {
			this.timer += t;
			if (this.timer >= 75 && this.r < 7) {
				this.r++;
				this.timer = 0;
			}
		}
	}
}

interface BoosterOptions {
	dir?: Facing;
	img?: ResourceName;
}

export default class Booster extends Buster {
	dir: Facing;

	constructor(
		game: Game,
		{ dir = 'L', img = 'enemy.booster' }: BoosterOptions = {}
	) {
		super(game, {
			jumpfatigue: 1,
			sprite: new BoosterController(game.resources[img]),
		});

		this.name = 'Booster';
		this.dir = dir;
	}

	canAttack(player: Player, playerDist: number) {
		return true;
	}

	getJumpSide() {
		return this.dir === 'R' ? 1 : -1;
	}
}
