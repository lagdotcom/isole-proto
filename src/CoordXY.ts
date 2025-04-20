import { Pixels } from './flavours';

export default interface CoordXY<T extends number = Pixels> {
	/** X Coordinate */
	x: T;

	/** Y Coordinate */
	y: T;
}
