import Channel from './Channel';
import Damageable from './Damageable';
import { Facing } from './dirs';
import DrawnComponent from './DrawnComponent';
import { AnimName, Degrees, Pixels, ResourceName } from './flavours';
import Hitbox from './Hitbox';
import ShootingReticle from './player/ShootingReticle';
import PlayerController from './spr/PlayerController';

export default interface Player extends DrawnComponent, Damageable {
	finishDeath(): void;
	getAim(): AimData;
	getHitbox(): Hitbox;

	body: Channel;
	facing: Facing;
	removeControl: boolean;
	sprite: PlayerController;
	va: number;
	vfa: number;
	vr: number;
	w: Pixels;
	reticle: ShootingReticle;
}

export interface AimData {
	active: boolean;
	animation: AnimName;
	back: boolean;
	facing: 1 | -1;
}

export interface PlayerInit {
	back?: boolean;
	a?: Degrees;
	img?: ResourceName;
	r?: Pixels;
}
