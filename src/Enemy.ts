import CoordAR from './CoordAR';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import Hitbox from './Hitbox';

export default interface Enemy extends CoordAR, DrawnComponent, Damageable {
	damage?: number;
	isEnemy: true;
	name: string;

	getHitbox(): Hitbox;
}
