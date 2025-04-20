import { Pixels, Radians } from './flavours';

type Hitbox<
	Angle extends number = Radians,
	Distance extends number = Pixels,
	Fields extends string = 'top' | 'bot',
> = Record<Fields, Hitsize<Angle, Distance>>;
export default Hitbox;

export interface Hitsize<
	Angle extends number = Radians,
	Distance extends number = Pixels,
> {
	// Radius
	r: Distance;

	// Angle (middle)
	a: Angle;

	// Width (either side of middle)
	width: Angle;
}
