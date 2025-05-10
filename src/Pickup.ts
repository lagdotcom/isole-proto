import CoordARZ from './CoordARZ';
import DrawnComponent from './DrawnComponent';
import Hitbox from './Hitbox';

export interface Pickup extends CoordARZ, DrawnComponent {
	getHitbox(): Hitbox;
	take(): boolean;
}
