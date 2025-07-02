import { Facing } from '../dirs';
import { ResourceName } from '../flavours';
import Game from '../Game';
import BusterController from '../spr/buster';
import Buster from './Buster';

class BoosterController extends BusterController {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	idle() {}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	near() {}
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
			jumpFatigue: 1,
			sprite: new BoosterController(game.resources[img]),
		});

		this.name = 'Booster';
		this.dir = dir;
	}

	canAttack() {
		return true;
	}

	getJumpSide() {
		return this.dir === 'R' ? 1 : -1;
	}
}
