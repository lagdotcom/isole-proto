import CoordAR from './CoordAR';
import DrawnComponent from './DrawnComponent';

export default interface Damageable extends CoordAR, DrawnComponent {
	alive: boolean;
	health: number;
	invincible?: boolean;

	die?: (inflictor: Damageable) => void;
	hit?: (victim: Damageable) => void;
	hurt?: (inflictor: Damageable, amount: number) => void;
}
