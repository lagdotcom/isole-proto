import { Pixels } from './flavours';

export default interface CoordXYZ<T extends number = Pixels> {
	x: T;
	y: T;
	z: T;
}
