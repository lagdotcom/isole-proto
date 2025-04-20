import Controller, { ControllerInit } from './Controller';
import PointXY from './CoordXY';
import { eAnimationEnded } from './events';
import {
	AnimEvent,
	AnimName,
	AnimPriority,
	FrameIndex,
	Milliseconds,
	SpriteColumn,
	SpriteRow,
} from './flavours';
import HitboxXYWH from './HitboxXYWH';

export interface AnimInit extends ControllerInit {
	animations: AnimSpecMap;
}

export interface AnimSpec {
	extend?: boolean;
	flags?: Record<string, boolean>;
	frames: FrameSpec[];
	loop?: boolean;
	loopTo?: FrameIndex;
	priority?: AnimPriority;
}

export interface Anim {
	extend: boolean;
	flags: Record<string, boolean>;
	frames: Frame[];
	last: FrameIndex;
	loop: boolean;
	loopTo: FrameIndex;
	priority: AnimPriority;
}

export interface FrameSpec {
	c: SpriteColumn;
	event?: AnimEvent;
	hitbox?: HitboxXYWH;
	hotspot?: PointXY;
	r: SpriteRow;
	t: Milliseconds;
}

export interface Frame {
	c: SpriteColumn;
	event?: AnimEvent;
	hitbox?: HitboxXYWH;
	hotspot: PointXY;
	r: SpriteRow;
	t: Milliseconds;
}

export type AnimMap = Record<AnimName, Anim>;
export type AnimSpecMap = Record<AnimName, AnimSpec>;
export type Listener = (details: unknown) => void;
export type ListenerMap = Record<AnimEvent, Listener>;

export default class AnimController extends Controller {
	/** Current animation name */
	a: AnimName = '';

	/** Current animation */
	ac?: Anim;

	/** Current frame */
	acf: Frame = { c: 0, hotspot: { x: 0, y: 0 }, r: 0, t: 0 };

	/** Current frame index */
	afi: FrameIndex = 0;

	/** Current event */
	ae?: AnimEvent;

	/** Current listener map */
	al: ListenerMap;

	/** Animation map */
	animations: AnimMap;

	/** Animation name to return to after pre-empt */
	ar?: AnimName;

	/** Animation timer */
	at: Milliseconds;

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
	 * @param {AnimName} animation name
	 * @param {boolean} force always play
	 * @param {ListenerMap} listeners event listener map
	 */
	play(animation: AnimName, force = false, listeners?: ListenerMap): void {
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
			this.al = listeners ?? {};
			this.flags = anim.flags ?? {};
			this.frame(0);
		}
	}

	/**
	 * Continue the current animation
	 * @param {Milliseconds} t time
	 */
	next(t: Milliseconds): void {
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
	 * @param {FrameIndex} n frame index
	 */
	frame(n: FrameIndex): void {
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
	 * @param {AnimEvent} e event name
	 * @param {unknown} details event details
	 */
	dispatch(e: AnimEvent, details: unknown = null): void {
		this.al[e]?.(details);
		this[e]?.(details);
	}
}
