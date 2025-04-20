import { Pixels, Radians } from './flavours';

export default interface CoordAR<
	A extends number = Radians,
	R extends number = Pixels,
> {
	/** Angle */
	a: A;

	/** Radius */
	r: R;
}
