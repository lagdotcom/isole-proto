import Channel from './Channel';
import Damageable from './Damageable';
import { Facing } from './dirs';
import DrawnComponent from './DrawnComponent';
import Hitbox from './Hitbox';
import PlayerController from './spr/PlayerController';

export default interface Player extends DrawnComponent, Damageable {
	finishdeath(): void;
	getHitbox(): Hitbox;

	body: Channel;
	facing: Facing;
	removecontrol: boolean;
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
