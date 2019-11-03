import AnimController from '../AnimController';
import {
	aStand,
	aFlip,
	aJFlip,
	aWalk,
	aJump,
	aFall,
	aLand,
	aThrow,
	aAxe,
	aHurt,
	aStatus,
} from '../anims';
import { eThrow, eSwing } from '../events';
import Jacques from '../player/Jacques';

const animations = {
	[aStand]: {
		extend: true,
		frames: [{ c: 0, r: 0, t: 1000 }],
	},

	[aFlip]: {
		priority: 5,
		frames: [{ c: 1, r: 0, t: 75 }],
	},

	[aWalk]: {
		loop: true,
		frames: [
			{ c: 2, r: 0, t: 85 },
			{ c: 2, r: 1, t: 85 },
			{ c: 2, r: 2, t: 85, event: 'onstep' },
			{ c: 2, r: 3, t: 85 },
			{ c: 2, r: 4, t: 85 },
			{ c: 2, r: 5, t: 85 },
			{ c: 2, r: 6, t: 85, event: 'onstep' },
			{ c: 2, r: 7, t: 85 },
		],
	},

	[aJump]: {
		extend: true,
		frames: [
			{ c: 3, r: 0, t: 75 },
			{ c: 3, r: 1, t: 75 },
			{ c: 3, r: 2, t: 1000 },
		],
	},

	[aFall]: {
		extend: true,
		frames: [
			{ c: 3, r: 3, t: 75 },
			{ c: 3, r: 4, t: 75 },
			{ c: 3, r: 5, t: 1000 },
		],
	},

	[aLand]: {
		priority: 1,
		frames: [{ c: 3, r: 6, t: 75 }, { c: 3, r: 7, t: 75 }],
	},

	[aJFlip]: {
		priority: 5,
		frames: [{ c: 4, r: 0, t: 75 }],
	},

	[aThrow]: {
		priority: 2,
		flags: { noAttack: true, noTurn: true },
		frames: [
			{ c: 5, r: 0, t: 75 },
			{ c: 5, r: 1, t: 75 },
			{ c: 5, r: 2, t: 75 },
			{ c: 5, r: 3, t: 75, event: eThrow },
			{ c: 5, r: 4, t: 75 },
			{ c: 5, r: 5, t: 150 },
		],
	},

	[aAxe]: {
		priority: 8,
		flags: { noAttack: true, noTurn: true },
		frames: [
			{ c: 5, r: 0, t: 75, hotspot: { x: -80, y: 60 } },
			{ c: 5, r: 1, t: 75, hotspot: { x: -80, y: 60 } },
			{ c: 5, r: 2, t: 75, hotspot: { x: -80, y: 60 } },
			{ c: 5, r: 3, t: 75, hotspot: { x: 65, y: 25 }, event: eSwing },
			{ c: 5, r: 4, t: 75, hotspot: { x: 65, y: 25 } },
			{ c: 5, r: 5, t: 150, hotspot: { x: 65, y: 25 } },
		],
	},

	[aHurt]: {
		priority: 10,
		flags: { noControl: true },
		frames: [
			{ c: 6, r: 0, t: 75 },
			{ c: 6, r: 1, t: 75 },
			{ c: 6, r: 2, t: 300 },
		],
	},

	[aStatus]: {
		priority: 20,
		loop: true,
		frames: [
			{ c: 7, r: 0, t: 90 },
			{ c: 7, r: 1, t: 90 },
			{ c: 7, r: 2, t: 90 },
			{ c: 7, r: 3, t: 90 },
			{ c: 7, r: 4, t: 90 },
			{ c: 7, r: 5, t: 90 },
		],
	},
};

export default class JacquesController extends AnimController {
	facing: 1 | -1;
	parent: Jacques;
	step?: boolean;

	constructor(parent: Jacques, img: CanvasImageSource) {
		super({
			animations,
			img,
			w: 140,
			h: 140,
			xo: -70,
			yo: -109,
		});

		this.parent = parent;
		this.facing = 1;
	}

	jump(t: number): void {
		this.play(aJump);
		this.next(t);
	}

	fall(t: number): void {
		this.play(aFall);
		this.next(t);
	}

	stand(t: number): void {
		if (this.a === aFall) {
			this.play(aLand);
		}

		this.play(aStand);
		this.next(t);
	}

	face(vr: 1 | -1, grounded: boolean): void {
		if (vr != this.facing) {
			this.facing = vr;

			if (grounded) {
				this.play(aFlip);
			} else {
				this.play(aJFlip);
			}

			this.flip = vr < 0;
		}
	}

	walk(t: number): void {
		if (this.a === aFall) {
			this.play(aLand);
		}

		this.play(aWalk);
		this.next(t);
	}

	throw(): void {
		this.play(aThrow);
	}

	hurt(): void {
		this.play(aHurt);
	}

	onstep(): void {
		const snd = this.step ? 'player.step2' : 'player.step1';
		this.step = !this.step;
		this.parent.body.play(snd);
	}
}
