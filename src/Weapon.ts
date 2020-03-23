export default interface Weapon {
	canUse: () => boolean;
	draw: (context: CanvasRenderingContext2D, x: number, y: number) => void;
	update?: (time: number) => void;
	use: () => void;
}
