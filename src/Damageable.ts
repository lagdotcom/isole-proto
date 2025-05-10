import CoordARZ from './CoordARZ';
import DrawnComponent from './DrawnComponent';

export default interface Damageable extends CoordARZ, DrawnComponent {
	alive: boolean;
	health: number;
	invincible?: boolean;

	die?: (inflicter: Damageable) => void;
	hit?: (victim: Damageable) => void;
	hurt?: (inflicter: Damageable, amount: number) => void;
}
