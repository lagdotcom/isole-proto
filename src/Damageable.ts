import DrawnComponent from './DrawnComponent';
import CoordAR from './CoordAR';

export default interface Damageable extends CoordAR, DrawnComponent {
	alive: boolean;
	health: number;
	invincible?: boolean;

	die?: (inflictor: Damageable) => void;
	hit?: (victim: Damageable) => void;
	hurt?: (inflictor: Damageable, amount: number) => void;
}
