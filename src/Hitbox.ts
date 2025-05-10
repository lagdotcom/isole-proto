import { Multiplier, Pixels, Radians } from './flavours';

type Hitbox<
	Angle extends number = Radians,
	Distance extends number = Pixels,
	Fields extends string = 'top' | 'bot',
> = Record<Fields, HitSize<Angle, Distance>>;
export default Hitbox;

export interface HitSize<
	Angle extends number = Radians,
	Distance extends number = Pixels,
> {
	// Layer
	back: boolean;

	// Radius
	r: Distance;

	// Angle (middle)
	a: Angle;

	// Depth
	z: Multiplier;

	// Width (either side of middle)
	width: Angle;
}
