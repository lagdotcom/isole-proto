import Component from './Component';

export default interface DrawnComponent extends Component {
	hidden?: boolean;
	layer: number;

	draw: (context: CanvasRenderingContext2D) => void;
	drawHitbox?: (context: CanvasRenderingContext2D) => void;
}
