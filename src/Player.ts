import Channel from './Channel';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import { Facing } from './dirs';
import Hitbox from './Hitbox';
import PlayerController from './spr/PlayerController';

export default interface Player extends DrawnComponent, Damageable {
	finishdeath(): void;
	getHitbox(): Hitbox;

	body: Channel;
	facing: Facing;
	sprite: PlayerController;
	va: number;
	vfa: number;
	vr: number;
	w: number;
}

export interface PlayerInit {
	a?: number;
	img?: string;
	r?: number;
}
