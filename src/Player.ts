import AnimController from './AnimController';
import Channel from './Channel';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import { Facing } from './dirs';
import Hitbox from './Hitbox';

export default interface Player extends DrawnComponent, Damageable {
	finishdeath(): void;
	getHitbox(): Hitbox;

	body: Channel;
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
