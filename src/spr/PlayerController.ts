import AnimController, { AnimInit } from '../AnimController';
import {
	aBackgroundLeap,
	aBackgroundLeapFlip,
	aDodge,
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
	aRoll,
	aStand,
	aThrow,
	aWalk,
} from '../anims';
import { eAnimationEnded } from '../events';
import { AnimName, Milliseconds } from '../flavours';
import Player from '../Player';

const midAirAnimations = [aJump, aDoubleJump];

type PlayerControllerInit = Omit<AnimInit, 'img' | 'parent'>;

export default class PlayerController extends AnimController {
	facing: 1 | -1;
	parent: Player;
	step?: boolean;

	constructor(
		parent: Player,
		img: CanvasImageSource,
		options: PlayerControllerInit
	) {
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

	dodge(t: Milliseconds) {
		this.play(aDodge);
		this.next(t);
	}

	roll(t: Milliseconds, onEnd: () => void) {
		this.play(aRoll, undefined, { [eAnimationEnded]: onEnd });
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

	attack(animation: AnimName, vr: 1 | -1, time: Milliseconds) {
		this.facing = vr;
		this.flip = vr < 0;

		this.play(animation);
		this.next(time);
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
