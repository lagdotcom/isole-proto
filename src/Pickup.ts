import CoordAR from './CoordAR';
import DrawnComponent from './DrawnComponent';
import Hitbox from './Hitbox';

export interface Pickup extends CoordAR, DrawnComponent {
	getHitbox(): Hitbox;
	take(): boolean;
}
