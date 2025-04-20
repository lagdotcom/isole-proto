import { Pixels } from './flavours';

export default interface HitboxXYWH<T extends number = Pixels> {
	x: T;
	y: T;
	w: T;
	h: T;
}
