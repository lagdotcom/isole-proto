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
	aDying,
} from '../anims';
import { eThrow, eSwing } from '../events';
import Player from '../Player';
import PlayerController from './PlayerController';

export default function woodyController(
	parent: Player,
	img: CanvasImageSource
) {
	return new PlayerController(parent, img, {
		w: 80,
		h: 80,
		xo: -40,
		yo: -74,
		animations: {
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
					{ c: 5, r: 0, t: 75, hotspot: { x: -48, y: 44 } },
					{ c: 5, r: 1, t: 75, hotspot: { x: -48, y: 44 } },
					{ c: 5, r: 2, t: 75, hotspot: { x: -48, y: 44 } },
					{
						c: 5,
						r: 3,
						t: 75,
						hotspot: { x: 24, y: 20 },
						event: eSwing,
					},
					{ c: 5, r: 4, t: 75, hotspot: { x: 24, y: 20 } },
					{ c: 5, r: 5, t: 150, hotspot: { x: 24, y: 20 } },
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

			[aDying]: {
				priority: 100,
				flags: { noControl: true },
				frames: [
					{ c: 8, r: 0, t: 90 },
					{ c: 8, r: 1, t: 90 },
					{ c: 8, r: 2, t: 90 },
					{ c: 8, r: 3, t: 90 },
					{ c: 8, r: 4, t: 90 },
					{ c: 8, r: 5, t: 90 },
					{ c: 8, r: 6, t: 90 },
					{ c: 8, r: 7, t: 90 },
					{ c: 8, r: 8, t: 90 },
					{ c: 8, r: 9, t: 90 },
					{ c: 8, r: 10, t: 90 },
					{ c: 8, r: 11, t: 90 },
					{ c: 8, r: 11, t: 1000, event: 'ondeath' },
				],
			},
		},
	});
}
