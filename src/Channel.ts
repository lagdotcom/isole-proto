import { ResourceName } from './flavours';
import Game from './Game';

/** Audio channel */
export default class Channel {
	a: HTMLAudioElement;
	g: Game;
	name: string;

	/**
	 * Create a new audio channel
	 * @param {Game} g game instance
	 * @param {string} name channel name
	 */
	constructor(g: Game, name: string) {
		Object.assign(this, { g, name, a: new Audio() });
	}

	/**
	 * Play a sound on the channel
	 * @param {ResourceName} name resource name
	 */
	play(name: ResourceName): void {
		const snd = this.g.resources[name];
		if (!snd) {
			console.log('resource not loaded:', name);
			return;
		}

		this.a.pause();

		this.a.src = snd.src;
		this.a.play();
	}
}
