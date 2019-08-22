import Controller from './Controller';
import { eAnimationEnded } from './events';

export default class AnimController extends Controller {
	constructor(data) {
		super({
			...data,
			a: null,
			ac: { priority: -1 },
			acf: null,
			afi: 0,
			at: 0,
			ae: null,
			al: {},
			ar: null,
			flags: {},
		});

		// pre-calculations
		Object.values(data.animations).forEach(a => {
			a.last = a.frames.length - 1;
			a.priority = a.priority || 0;

			a.frames.forEach(f => {
				f.hotspot = f.hotspot || { x: 0, y: 0 };
			});
		});
	}

	play(animation, force = false, listeners = {}) {
		if (this.a !== animation) {
			if (
				!force &&
				this.animations[animation].priority < this.ac.priority
			) {
				this.ar = animation;
				return;
			}

			this.a = animation;
			this.ac = this.animations[animation];
			this.al = listeners;
			this.flags = this.ac.flags || {};
			this.frame(0);
		}
	}

	next(t) {
		const { a, ac, acf, ae, afi, ar } = this,
			last = afi === ac.last;
		this.at += t;

		if (this.at > acf.t) {
			if (last && !ac.extend) {
				if (ac.loop) {
					this.frame(0);
				} else {
					this.dispatch(eAnimationEnded, a);
					if (ar) this.play(ar, true);
				}
			} else if (!last) {
				this.frame(afi + 1);
			}
		}

		if (this.ae && ae !== this.ae) {
			this.dispatch(this.ae);
		}

		this.ar = null;
	}

	frame(n) {
		this.afi = n;
		this.at = 0;
		this.acf = this.ac.frames[this.afi];

		this.ae = this.acf.event;
		this.c = this.acf.c;
		this.r = this.acf.r;
		this.hotspot = this.acf.hotspot;
	}

	dispatch(e, details) {
		if (this.al[e]) this.al[e](details);
		if (this[e]) this[e](details);
	}
}
