import { TileName } from './flavours';

export default interface Texture {
	h: number;
	w: number;

	draw(context: CanvasRenderingContext2D): void;
	reset(): void;
	tile(name: TileName): void;
}

export type TileDataMap = Record<TileName, TileData>;

export interface TileData {
	c: number;
	cycle?: number;
	r: number;
}
