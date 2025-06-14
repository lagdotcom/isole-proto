import CoordARZ from './CoordARZ';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import Hitbox from './Hitbox';

export default interface Enemy extends CoordARZ, DrawnComponent, Damageable {
	damage?: number;
	isEnemy: boolean;
	name: string;

	getHitbox(): Hitbox;
}
