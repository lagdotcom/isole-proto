import Channel from './Channel';
import Damageable from './Damageable';
import { Facing } from './dirs';
import DrawnComponent from './DrawnComponent';
import { Degrees, Pixels, ResourceName } from './flavours';
import Hitbox from './Hitbox';
import ShootingReticle from './player/ShootingReticle';
import SpellCircle from './player/SpellCircle';
import PlayerController from './spr/PlayerController';

export default interface Player extends DrawnComponent, Damageable {
	finishDeath(): void;
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
	spellCircle: SpellCircle;
}

export interface PlayerInit {
	back?: boolean;
	a?: Degrees;
	img?: ResourceName;
	r?: Pixels;
}
