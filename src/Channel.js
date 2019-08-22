export default class Channel {
	constructor(g, name) {
		Object.assign(this, { g, name, a: new Audio() });
	}

	play(name) {
		if (this.a) {
			if (!this.a.ended) this.a.pause();
		}

		this.a.src = this.g.resources[name].src;
		this.a.play();
	}
}
