/** Audio channel */
export default class Channel {
	/**
	 * Create a new audio channel
	 * @param {Game} g game instance
	 * @param {string} name channel name
	 */
	constructor(g, name) {
		Object.assign(this, { g, name, a: new Audio() });
	}

	/**
	 * Play a sound on the channel
	 * @param {string} name resource name
	 */
	play(name) {
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
