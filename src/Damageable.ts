import CoordAR from './CoordAR';
import DrawnComponent from './DrawnComponent';

export default interface Damageable extends CoordAR, DrawnComponent {
	alive: boolean;
	health: number;
	invincible?: boolean;

	die?: (inflicter: Damageable) => void;
	hit?: (victim: Damageable) => void;
	hurt?: (inflicter: Damageable, amount: number) => void;
}
