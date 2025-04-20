import { Pixels, SpriteColumn, SpriteRow, TileName } from './flavours';

export default interface Texture {
	h: Pixels;
	w: Pixels;

	draw(context: CanvasRenderingContext2D): void;
	reset(): void;
	tile(name: TileName): void;
}

export type TileDataMap = Record<TileName, TileData>;

export interface TileData {
	c: SpriteColumn;
	cycle?: number;
	r: SpriteRow;
}
