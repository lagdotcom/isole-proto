import AnimController from '../AnimController';
import {
	aBackgroundLeap,
	aBackgroundLeapFlip,
	aDoubleJump,
	aDoubleJumpFlip,
	aDying,
	aFlip,
	aForegroundLeap,
	aForegroundLeapFlip,
	aHurt,
	aJump,
	aJumpFlip,
	aLand,
	aStand,
	aThrow,
	aWalk,
} from '../anims';
import Player from '../Player';

const midAirAnimations = [aJump, aDoubleJump];

export default class PlayerController extends AnimController {
	facing: 1 | -1;
	parent: Player;
	step?: boolean;

	constructor(parent: Player, img: CanvasImageSource, options: any) {
		super(Object.assign({ facing: 1, img, parent }, options));

		this.parent = parent;
		this.facing = 1;
	}

	jump(t: number): void {
		this.play(aJump);
		this.next(t);
	}

	doubleJump(t: number): void {
		this.play(aDoubleJump);
		this.next(t);
	}

	leap(t: number, leaping: 'f' | 'b'): void {
		this.play(leaping === 'f' ? aForegroundLeap : aBackgroundLeap);
		this.next(t);
	}

	stand(t: number): void {
		if (midAirAnimations.includes(this.a)) {
			this.play(aLand);
		}

		this.play(aStand);
		this.next(t);
	}

	face(
		vr: 1 | -1,
		grounded: boolean,
		canDoubleJump: boolean,
		leaping?: 'f' | 'b'
	): void {
		if (vr !== this.facing) {
			this.facing = vr;

			if (leaping === 'f') this.play(aForegroundLeapFlip);
			else if (leaping === 'b') this.play(aBackgroundLeapFlip);
			else if (grounded) this.play(aFlip);
			else {
				if (canDoubleJump) this.play(aJumpFlip);
				else this.play(aDoubleJumpFlip);
			}

			this.flip = vr < 0;
		}
	}

	walk(t: number): void {
		if (midAirAnimations.includes(this.a)) {
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

	die(): void {
		this.play(aDying);
	}

	onstep(): void {
		const snd = this.step ? 'player.step2' : 'player.step1';
		this.step = !this.step;
		this.parent.body.play(snd);
	}

	ondeath(): void {
		this.parent.finishDeath();
	}
}
