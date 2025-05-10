import { Milliseconds, Pixels } from './flavours';

export default interface Weapon {
	canUse: () => boolean;
	draw: (context: CanvasRenderingContext2D, x?: Pixels, y?: Pixels) => void;
	update?: (time: Milliseconds) => void;
	use: () => void;
}
