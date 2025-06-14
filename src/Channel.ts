import { ResourceName } from './flavours';
import Game from './Game';

type ChannelState = 'idle' | 'queued' | 'playing';

/** Audio channel */
export default class Channel {
	a: HTMLAudioElement;
	state: ChannelState;

	/**
	 * Create a new audio channel
	 * @param {Game} g game instance
	 * @param {string} name channel name
	 */
	constructor(
		public g: Game,
		public name: string
	) {
		this.a = new Audio();
		this.state = 'idle';

		this.a.addEventListener('ended', () => (this.state = 'idle'));
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

		// promise hasn't returned yet...
		if (this.state === 'queued') return;

		this.a.pause();

		this.a.src = snd.src;
		this.state = 'queued';
		this.a
			.play()
			.then(() => (this.state = 'playing'))
			.catch(() => (this.state = 'idle'));
	}
}
