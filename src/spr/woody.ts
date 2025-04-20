import {
	aAxe,
	aDJFlip,
	aDoubleJump,
	aDying,
	aFlip,
	aHurt,
	aJFlip,
	aJump,
	aLand,
	aStand,
	aStatus,
	aThrow,
	aWalk,
} from '../anims';
import { eSwing, eThrow } from '../events';
import Player from '../Player';
import PlayerController from './PlayerController';

export default function woodyController(
	parent: Player,
	img: CanvasImageSource
) {
	return new PlayerController(parent, img, {
		w: 224,
		h: 224,
		xo: -110,
		yo: -175,
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
					{ c: 2, r: 2, t: 85 },
					{ c: 2, r: 3, t: 85, event: 'onstep' },
					{ c: 2, r: 4, t: 85 },
					{ c: 2, r: 5, t: 85 },
					{ c: 2, r: 6, t: 85 },
					{ c: 2, r: 7, t: 85 },
					{ c: 2, r: 8, t: 85 },
					{ c: 2, r: 9, t: 85, event: 'onstep' },
					{ c: 2, r: 10, t: 85 },
					{ c: 2, r: 11, t: 85 },
				],
			},

			[aJump]: {
				loop: true,
				loopTo: 2,
				frames: [
					{ c: 3, r: 0, t: 75 },
					{ c: 3, r: 1, t: 75 },
					{ c: 3, r: 2, t: 75 },
					{ c: 3, r: 3, t: 75 },
					{ c: 3, r: 4, t: 75 },
					{ c: 3, r: 5, t: 75 },
				],
			},

			[aDoubleJump]: {
				loop: true,
				loopTo: 2,
				frames: [
					{ c: 4, r: 0, t: 75 },
					{ c: 4, r: 1, t: 75 },
					{ c: 4, r: 2, t: 75 },
					{ c: 4, r: 3, t: 75 },
					{ c: 4, r: 4, t: 75 },
					{ c: 4, r: 5, t: 75 },
				],
			},

			[aLand]: {
				priority: 1,
				frames: [
					{ c: 5, r: 0, t: 75 },
					{ c: 5, r: 1, t: 75 },
				],
			},

			[aJFlip]: {
				priority: 5,
				frames: [{ c: 1, r: 1, t: 75 }],
			},

			[aDJFlip]: {
				priority: 5,
				frames: [{ c: 1, r: 2, t: 75 }],
			},

			[aThrow]: {
				priority: 2,
				flags: { noAttack: true, noTurn: true },
				frames: [
					{ c: 8, r: 0, t: 75 },
					{ c: 8, r: 1, t: 75 },
					{ c: 8, r: 2, t: 75 },
					{ c: 8, r: 3, t: 75 },
					{ c: 8, r: 4, t: 75 },
					{
						c: 8,
						r: 5,
						t: 75,
						hotspot: { x: 48, y: 22 },
						event: eThrow,
					},
					{ c: 8, r: 6, t: 75 },
					{ c: 8, r: 7, t: 75 },
					{ c: 8, r: 8, t: 75 },
					{ c: 8, r: 9, t: 75 },
				],
			},

			[aAxe]: {
				priority: 8,
				flags: { noAttack: true, noTurn: true },
				frames: [
					{ c: 8, r: 0, t: 75, hotspot: { x: -100, y: 90 } },
					{ c: 8, r: 1, t: 75, hotspot: { x: -100, y: 90 } },
					{ c: 8, r: 2, t: 75, hotspot: { x: -100, y: 90 } },
					{ c: 8, r: 3, t: 75, hotspot: { x: -100, y: 90 } },
					{ c: 8, r: 4, t: 75, hotspot: { x: -100, y: 90 } },
					{
						c: 8,
						r: 5,
						t: 75,
						hotspot: { x: 50, y: 32 },
						event: eSwing,
					},
					{ c: 8, r: 6, t: 75, hotspot: { x: 50, y: 32 } },
					{ c: 8, r: 7, t: 75, hotspot: { x: 50, y: 32 } },
					{ c: 8, r: 8, t: 75, hotspot: { x: 50, y: 32 } },
					{ c: 8, r: 9, t: 75, hotspot: { x: 50, y: 32 } },
				],
			},

			[aHurt]: {
				priority: 10,
				flags: { noControl: true },
				frames: [
					{ c: 13, r: 0, t: 75 },
					{ c: 13, r: 1, t: 75 },
					{ c: 13, r: 2, t: 75 },
					{ c: 13, r: 3, t: 75 },
					{ c: 13, r: 4, t: 75 },
					{ c: 13, r: 5, t: 75 },
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
					{ c: 13, r: 0, t: 75 },
					{ c: 13, r: 1, t: 75 },
					{ c: 13, r: 2, t: 75 },
					{ c: 13, r: 3, t: 75 },
					{ c: 13, r: 4, t: 75 },
					{ c: 13, r: 5, t: 75 },
					{ c: 14, r: 0, t: 90 },
					{ c: 14, r: 1, t: 90 },
					{ c: 14, r: 2, t: 90 },
					{ c: 14, r: 3, t: 90 },
					{ c: 14, r: 4, t: 90 },
					{ c: 14, r: 5, t: 90 },
					{ c: 14, r: 6, t: 90 },
					{ c: 14, r: 7, t: 90 },
					{ c: 14, r: 8, t: 90 },
					{ c: 14, r: 9, t: 90 },
					{ c: 14, r: 10, t: 90 },
					{ c: 14, r: 11, t: 90 },
					{ c: 14, r: 12, t: 90 },
					{ c: 14, r: 13, t: 90 },
					{ c: 14, r: 14, t: 90 },
					{ c: 14, r: 15, t: 90 },
					{ c: 14, r: 15, t: 1000, event: 'ondeath' },
				],
			},
		},
	});
}
