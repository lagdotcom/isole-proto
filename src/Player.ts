import AnimController from './AnimController';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import { Facing } from './dirs';
import Game from './Game';
import Hitbox from './Hitbox';

export default interface Player extends DrawnComponent, Damageable {
	getHitbox(): Hitbox;

	facing: Facing;
	sprite: AnimController;
	va: number;
	vfa: number;
	w: number;
}

export interface PlayerInit {
	a?: number;
	img?: string;
	r?: number;
}
