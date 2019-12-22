/*
MOVEMENT: 75 ms for the flying animation

TURN: 75 ms, top cell is turning right to left, bottom is left to right.

BODY SLAM/FLOP: Frame 1 & 2 are 75 ms, Frame 3 hangs until landing on the ground, Frame 4 & 5 are 75 ms, Frame 6 is 400 ms, Frame 7 & 8 are 75 MS and frame 9 is 400 MS

NOTES: After the body slam recovery, the flying animation will begin playing again, I imagine the Flazza can't belly flop again until reaching the typical height it flies above platforms, or maybe after a set time. This enemy will definitely take some playing with to get right.
*/

import AnimController, { ListenerMap, Listener } from '../AnimController';

const aMove = 'move',
	aFlop = 'flop',
	aDrop = 'drop',
	aSlam = 'slam';

export const eDrop = 'onDrop',
	eRecover = 'onRecover';

const animations = {
	[aMove]: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 75 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
			{ c: 0, r: 3, t: 75 },
			{ c: 0, r: 4, t: 75 },
			{ c: 0, r: 5, t: 75 },
		],
	},

	[aFlop]: {
		extend: true,
		frames: [
			{ c: 1, r: 0, t: 75 },
			{ c: 1, r: 1, t: 75 },
			{ c: 1, r: 2, t: 1000, event: eDrop },
		],
	},

	[aDrop]: {
		extend: true,
		frames: [{ c: 1, r: 2, t: 1000 }],
	},

	[aSlam]: {
		frames: [
			{ c: 1, r: 3, t: 75 },
			{ c: 1, r: 4, t: 75 },
			{ c: 1, r: 5, t: 400 },
			{ c: 1, r: 6, t: 75 },
			{ c: 1, r: 7, t: 75 },
			{ c: 1, r: 8, t: 75 },
			{ c: 1, r: 8, t: 1000, event: eRecover },
		],
	},
};

interface FlazzaListenerMap extends ListenerMap {
	[eDrop]: Listener;
	[eRecover]: Listener;
}

export default class FlazzaController extends AnimController {
	parent: ListenerMap;

	constructor(parent: FlazzaListenerMap, img: CanvasImageSource) {
		super({
			animations,
			img,
			w: 120,
			h: 120,
			xo: -60,
			yo: -90,
			leftflip: false,
		});

		this.parent = parent;
	}

	_play(anim: string, force: boolean = false): void {
		return this.play(anim, force, this.parent);
	}

	fly(t: number): void {
		this.play(aMove);
		this.next(t);
	}

	flop(t: number): void {
		this._play(aFlop);
		this.next(t);
	}

	drop(t: number): void {
		this.play(aDrop);
		this.next(t);
	}

	slam(t: number): void {
		this._play(aSlam);
		this.next(t);
	}
}
