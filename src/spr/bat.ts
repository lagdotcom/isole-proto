/*
Column 1 - Flight: All frames are 90ms, bat flies around in a mostly meandering pattern, when facing the player and within close enough range, changes into the punch animation. If line of sight is not made and the bat has been flying for long enough, it will latch onto a ledge upside down and go to sleep for a time.

Column 2 - Punch: Frame 1 and 2 are 40ms, Frames 3-5 are 75ms and the bat will pull back slightly, Frames 6-8 are 50ms and repeat multiple times (roughly 3-4) and the bat will punch at the player's X and Y coordinates, drifting past whether it misses or connects before going into Frame 9 at 40ms and returning to flight.

Column 3 - Sleep: Frame 1 and 2 are 75ms, Frame 3 is 350ms, Frame 4 and 5 are 75ms, and Frame 6 is 350ms. Bat remains asleep until attacked or it wakes up randomly on it's own after resting for at least 6 or 7 seconds.

Column 4 - Wake-up: Frame 1 is 150ms, Frames 2-4 are 75ms, Frames 5-9 are 55ms and during this period the player will be harmed if they try to jump on or approach the bat, Frame 10 is 75ms, after this the bat will return to it's random flight pattern.

NOTES: the bat can be jumped on unless it is in the spinning animation during wake up, when it goes to punch it can still be jumped on like normal around it's head area, but it's fist will always damage the player. The hitbox for this creature would roughly be the head region and it's hands potentially, wings I don't see being part of it's hitbox for being jumped on or harming the player.
*/

import AnimController, { AnimSpecMap, ListenerMap, Listener } from '../AnimController';

const aMove = 'move',
	aPunch = 'punch',
	aSleep = 'sleep',
	aWake = 'wake',
	aFlip = 'flip';

export const ePunchPullback = 'onPunchPullback',
	ePunchForward = 'onPunchForward',
	ePunchDone = 'onPunchDone',
	eWakeDone = 'onWakeDone';

const animations: AnimSpecMap = {
	[aMove]: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 75 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
			{ c: 0, r: 3, t: 75 },
			{ c: 0, r: 4, t: 75 },
		],
	},

	[aPunch]: {
		frames: [
			{ c: 1, r: 0, t: 40 },
			{ c: 1, r: 1, t: 40 },
			{ c: 1, r: 2, t: 75, event: ePunchPullback },
			{ c: 1, r: 3, t: 75 },
			{ c: 1, r: 4, t: 75 },
			{ c: 1, r: 5, t: 50, event: ePunchForward },
			{ c: 1, r: 6, t: 50 },
			{ c: 1, r: 7, t: 50 },
			{ c: 1, r: 5, t: 50 },
			{ c: 1, r: 6, t: 50 },
			{ c: 1, r: 7, t: 50 },
			{ c: 1, r: 5, t: 50 },
			{ c: 1, r: 6, t: 50 },
			{ c: 1, r: 7, t: 50 },
			{ c: 1, r: 5, t: 50 },
			{ c: 1, r: 6, t: 50 },
			{ c: 1, r: 7, t: 50 },
			{ c: 1, r: 8, t: 40, event: ePunchDone },
		],
	},

	[aSleep]: {
		loop: true,
		frames: [
			{ c: 2, r: 0, t: 75 },
			{ c: 2, r: 1, t: 75 },
			{ c: 2, r: 2, t: 350 },
			{ c: 2, r: 3, t: 75 },
			{ c: 2, r: 4, t: 75 },
			{ c: 2, r: 5, t: 350 },
		],
	},

	[aWake]: {
		frames: [
			{ c: 3, r: 0, t: 150 },
			{ c: 3, r: 1, t: 75 },
			{ c: 3, r: 2, t: 75 },
			{ c: 3, r: 3, t: 75 },
			{ c: 3, r: 4, t: 55 },
			{ c: 3, r: 5, t: 55 },
			{ c: 3, r: 6, t: 55 },
			{ c: 3, r: 7, t: 55 },
			{ c: 3, r: 8, t: 55 },
			{ c: 3, r: 9, t: 75, },
			{ c: 3, r: 9, t: 1000, event: eWakeDone },
		],
	},

	[aFlip]: {
		priority: 5,
		frames: [{ c: 4, r: 0, t: 75 }],
	},
};

interface BatListenerMap extends ListenerMap {
	[ePunchDone]: Listener;
	[ePunchForward]: Listener;
	[ePunchPullback]: Listener;
	[eWakeDone]: Listener;
}

export default class BatController extends AnimController {
	parent: ListenerMap;

	constructor(parent: BatListenerMap, img: any) {
		super({
			animations,
			img,
			w: 240,
			h: 200,
			xo: -130,
			yo: -140,
			leftflip: false,
		});

		this.parent = parent;
	}

	_play(anim: string, force = false): void {
		return this.play(anim, force, this.parent);
	}

	move(t: number): void {
		this.play(aMove);
		this.next(t);
	}

	punch(t: number): void {
		this._play(aPunch);
		this.next(t);
	}

	sleep(t: number): void {
		this.play(aSleep);
		this.next(t);
	}

	wake(t: number): void {
		this._play(aWake);
		this.next(t);
	}

	turn(): void {
		this.play(aFlip);
	}
}
