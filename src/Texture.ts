export default interface Texture {
	h: number;
	w: number;

	draw(context: CanvasRenderingContext2D): void;
	reset(): void;
	tile(name: string): void;
}

export type TileDataMap = Record<string, TileData>;

export interface TileData {
	c: number;
	cycle?: number;
	r: number;
}
