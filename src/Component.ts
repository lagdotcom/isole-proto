import { Milliseconds } from './flavours';
import Game from './Game';

export default interface Component {
	attachments?: Component[];
	game: Game;
	isEnemy?: boolean;

	draw?: (context: CanvasRenderingContext2D) => void;
	update?: (time: Milliseconds) => void;
}
