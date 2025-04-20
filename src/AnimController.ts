import Controller, { ControllerInit } from './Controller';
import PointXY from './CoordXY';
import { eAnimationEnded } from './events';
import HitboxXYWH from './HitboxXYWH';

export interface AnimInit extends ControllerInit {
	animations: AnimSpecMap;
}

export interface AnimSpec {
	extend?: boolean;
	flags?: Record<string, boolean>;
	frames: FrameSpec[];
	loop?: boolean;
	loopTo?: number;
	priority?: number;
}

export interface Anim {
	extend: boolean;
	flags: Record<string, boolean>;
	frames: Frame[];
	last: number;
	loop: boolean;
	loopTo: number;
	priority: number;
}

export interface FrameSpec {
	c: number;
	event?: string;
	hitbox?: HitboxXYWH;
	hotspot?: PointXY;
	r: number;
	t: number;
}

export interface Frame {
	c: number;
	event?: string;
	hitbox?: HitboxXYWH;
	hotspot: PointXY;
	r: number;
	t: number;
}

export type AnimMap = Record<string, Anim>;
export type AnimSpecMap = Record<string, AnimSpec>;
export type Listener = (details: unknown) => void;
export type ListenerMap = Record<string, Listener>;

export default class AnimController extends Controller {
	/** Current animation name */
	a = '';

	/** Current animation */
	ac?: Anim;

	/** Current frame */
	acf: Frame = { c: 0, hotspot: { x: 0, y: 0 }, r: 0, t: 0 };

	/** Current frame index */
	afi = 0;

	/** Current event */
	ae?: string;

	/** Current listener map */
	al?: ListenerMap;

	/** Animation map */
	animations: AnimMap;

	/** Animation name to return to after pre-empt */
	ar?: string;

	/** Animation timer */
	at: number;

	/** Animation flags */
	flags: Record<string, boolean>;

	/** Frame hotspot */
	hotspot: PointXY;

	/**
	 * Make a new AnimController
	 * @param {AnimInit} options options
	 */
	constructor(options: AnimInit) {
		super(options);
		this.animations = {};
		this.flags = {};
		this.hotspot = { x: 0, y: 0 };

		// pre-calculations
		for (const key in options.animations) {
			const spec = options.animations[key];
			this.animations[key] = {
				extend: spec.extend ?? false,
				flags: spec.flags ?? {},
				frames: spec.frames.map(
					(f: FrameSpec): Frame => ({
						...f,
						hotspot: f.hotspot ?? { x: 0, y: 0 },
					})
				),
				last: spec.frames.length - 1,
				loop: spec.loop ?? false,
				loopTo: spec.loopTo ?? 0,
				priority: spec.priority ?? 0,
			};
		}
	}

	/**
	 * Play an animation
	 * @param {string} animation name
	 * @param {boolean} force always play
	 * @param {ListenerMap} listeners event listener map
	 */
	play(animation: string, force = false, listeners?: ListenerMap): void {
		if (this.a !== animation) {
			if (
				!force &&
				this.ac &&
				this.animations[animation].priority < this.ac.priority
			) {
				this.ar = animation;
				return;
			}

			this.a = animation;

			const anim = this.animations[animation];
			this.ac = anim;
			this.al = listeners;
			this.flags = anim.flags || {};
			this.frame(0);
		}
	}

	/**
	 * Continue the current animation
	 * @param {number} t time
	 */
	next(t: number): void {
		const { a, ac, acf, ae, afi, ar } = this;
		if (!ac) return;

		const last = afi === ac.last;
		this.at += t;

		if (this.at > acf.t) {
			if (last && !ac.extend) {
				if (ac.loop) {
					this.frame(ac.loopTo);
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

		this.ar = undefined;
	}

	/**
	 * Change current frame
	 * @param {number} n frame index
	 */
	frame(n: number): void {
		if (!this.ac) return;

		this.afi = n;
		this.at = 0;
		this.acf = this.ac.frames[this.afi];

		this.ae = this.acf.event;
		this.c = this.acf.c;
		this.r = this.acf.r;
		this.hotspot = this.acf.hotspot;
	}

	/**
	 * Fire an event
	 * @param {string} e event name
	 * @param {unknown} details event details
	 */
	dispatch(e: string, details: unknown = null): void {
		if (this.al && this.al[e]) this.al[e](details);
		if (this[e]) this[e](details);
	}
}
