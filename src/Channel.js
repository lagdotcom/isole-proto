export default class Channel {
	constructor(g, name) {
		Object.assign(this, { g, name, a: new Audio() });
	}

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
