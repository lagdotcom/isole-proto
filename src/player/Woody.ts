import Channel from '../Channel';
import Game from '../Game';
import { PlayerInit } from '../Player';
import controller from '../spr/woody';
import AbstractPlayer from './AbstractPlayer';

export default class Woody extends AbstractPlayer {
	getDefaultInit(game: Game, options: PlayerInit): any {
		return {
			body: new Channel(game, 'Woody Body'),
			voice: new Channel(game, 'Woody Voice'),
			name: 'Woody',
			w: 30,
			h: 34,
			sprite: controller(
				this,
				game.resources[options.img || 'player.woody']
			),
			deadSound: 'player.dead',
			hurtSound: 'woody.hurt',
		};
	}
}
