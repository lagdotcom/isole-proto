export default interface Hitbox {
	// Bottom
	bot: Hitsize;

	// Top
	top: Hitsize;

	// allow arbitrary extension
	[field: string]: unknown;
}

export interface Hitsize {
	// Radius
	r: number;

	// Angle (middle)
	a: number;

	// Width (either side of middle)
	width: number;
}
