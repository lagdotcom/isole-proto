import { Multiplier, Pixels, Radians } from './flavours';

export default interface CoordARZ<
	Angle extends number = Radians,
	Distance extends number = Pixels,
> {
	/** Angle */
	a: Angle;

	/** Radius */
	r: Distance;

	/** Depth */
	z: Multiplier;
}
