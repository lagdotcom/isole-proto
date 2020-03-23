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
	aHurt,
	aDying,
} from '../anims';
import Player from '../Player';

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

	die(): void {
		this.play(aDying);
	}

	onstep(): void {
		const snd = this.step ? 'player.step2' : 'player.step1';
		this.step = !this.step;
		this.parent.body.play(snd);
	}

	ondeath(): void {
		this.parent.finishdeath();
	}
}
