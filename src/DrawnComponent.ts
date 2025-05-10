import Component from './Component';
import { DisplayLayer } from './flavours';

export default interface DrawnComponent extends Component {
	back: boolean;
	hidden?: boolean;
	layer: DisplayLayer;

	draw: (context: CanvasRenderingContext2D) => void;
	drawHitbox?: (context: CanvasRenderingContext2D) => void;
}
