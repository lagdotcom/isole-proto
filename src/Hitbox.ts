type Hitbox<T extends string = 'top' | 'bot'> = Record<T, Hitsize>;
export default Hitbox;

export interface Hitsize {
	// Radius
	r: number;

	// Angle (middle)
	a: number;

	// Width (either side of middle)
	width: number;
}
