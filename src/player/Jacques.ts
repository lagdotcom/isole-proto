import Channel from '../Channel';
import Game from '../Game';
import { PlayerInit } from '../Player';
import controller from '../spr/jacques';
import AbstractPlayer from './AbstractPlayer';

export default class Jacques extends AbstractPlayer {
	getDefaultInit(game: Game, { img = 'player.jacques' }: PlayerInit): any {
		return {
			body: new Channel(game, 'Jacques Body'),
			voice: new Channel(game, 'Jacques Voice'),
			name: 'Jacques',
			w: 38,
			h: 50,
			sprite: controller(this, game.resources[img]),
			deadSound: 'player.dead',
			hurtSound: 'jacques.hurt',
		};
	}
}
