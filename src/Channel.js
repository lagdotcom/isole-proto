export default class Channel {
	constructor(g, name) {
		Object.assign(this, { g, name });
	}

	play(name) {
		if (this.a) {
			if (!this.a.ended) this.a.pause();
		}

		this.a = new Audio(this.g.resources[name].src);
		this.a.play();
	}
}
