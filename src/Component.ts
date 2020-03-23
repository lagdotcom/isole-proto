import Game from './Game';

export default interface Component {
	attachments?: Component[];
	game: Game;
	isEnemy?: boolean;

	draw?: (context: CanvasRenderingContext2D) => void;
	update?: (time: number) => void;
}
