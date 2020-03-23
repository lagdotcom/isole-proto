import controller from '../spr/jacques';
import Channel from '../Channel';
import Game from '../Game';
import { PlayerInit } from '../Player';
import AbstractPlayer from './AbstractPlayer';

export default class Jacques extends AbstractPlayer {
	getDefaultInit(game: Game, options: PlayerInit): any {
		return {
			body: new Channel(game, 'Jacques Body'),
			voice: new Channel(game, 'Jacques Voice'),
			name: 'Jacques',
			w: 30,
			h: 50,
			sprite: controller(
				this,
				game.resources[options.img || 'player.jacques']
			),
			deadSound: 'player.dead',
			hurtSound: 'jacques.hurt',
		};
	}
}
