export default interface Hitbox {
	b: Quad;
	t: Quad;

	// allow arbitrary extension
	[field: string]: any;
}

export interface Quad {
	r: number;
	aw: number;
	al: number;
	ar: number;
}
