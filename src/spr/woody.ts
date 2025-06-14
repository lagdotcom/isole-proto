import {
	aAxe,
	aBackgroundAttack,
	aBackgroundLeap,
	aBackgroundLeapFlip,
	aDodge,
	aDoubleJump,
	aDoubleJumpFlip,
	aDying,
	aFlip,
	aForegroundAttack,
	aForegroundLeap,
	aForegroundLeapFlip,
	aHurt,
	aJump,
	aJumpFlip,
	aLand,
	aRoll,
	aSideAttack,
	aStand,
	aStatus,
	aThrow,
	aWalk,
} from '../anims';
import CoordXY from '../CoordXY';
import { eSwing, eThrow } from '../events';
import Player from '../Player';
import PlayerController from './PlayerController';

/*
Cell order, left to right:
- Idle
- Turn frames (top to bottom is on ground turn, in air single jump turn, in air double jump turn, in air background leap turn, and in air foreground leap turn)
- Run
- Jump (loop last 4 frames only)
- Double Jump (loop last 4 frames only)
- Landing frames (play when landing jump, double jump, foreground and background leap)
- Background leap (loop last 4 frames only)
- Foreground leap (loop last 4 frames only)
- Default swing animation (there might be a lot more of these later)
- Foreground facing ward stance
- Same lane facing ward stance (left/right)
- Background ward stance
- Dodge (loop frames 3, 4, 5, and 6 til player hits ground, then play rest of animation, final two frames have a tiny bit of skid to them physic wise)
- Hurt (loop last 4 frames only, briefly)
- Death (on death, play hurt animation once fully, then death animation after)
*/

const attackHotspot: CoordXY = { x: 98, y: 70 };

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

			[aJumpFlip]: {
				priority: 5,
				frames: [{ c: 1, r: 1, t: 75 }],
			},

			[aDoubleJumpFlip]: {
				priority: 5,
				frames: [{ c: 1, r: 2, t: 75 }],
			},

			[aBackgroundLeapFlip]: {
				priority: 5,
				frames: [{ c: 1, r: 3, t: 75 }],
			},

			[aForegroundLeapFlip]: {
				priority: 5,
				frames: [{ c: 1, r: 4, t: 75 }],
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

			[aBackgroundLeap]: {
				loop: true,
				loopTo: 2,
				frames: [
					{ c: 6, r: 0, t: 75 },
					{ c: 6, r: 1, t: 75 },
					{ c: 6, r: 2, t: 75 },
					{ c: 6, r: 3, t: 75 },
					{ c: 6, r: 4, t: 75 },
					{ c: 6, r: 5, t: 75 },
				],
			},

			[aForegroundLeap]: {
				loop: true,
				loopTo: 2,
				frames: [
					{ c: 7, r: 0, t: 75 },
					{ c: 7, r: 1, t: 75 },
					{ c: 7, r: 2, t: 75 },
					{ c: 7, r: 3, t: 75 },
					{ c: 7, r: 4, t: 75 },
					{ c: 7, r: 5, t: 75 },
				],
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
					{ c: 8, r: 6, t: 75, hotspot: attackHotspot },
					{ c: 8, r: 7, t: 75, hotspot: attackHotspot },
					{ c: 8, r: 8, t: 75, hotspot: attackHotspot },
					{ c: 8, r: 9, t: 75, hotspot: attackHotspot },
				],
			},

			[aForegroundAttack]: {
				loop: true,
				frames: [
					{ c: 9, r: 0, t: 75, hotspot: attackHotspot },
					{ c: 9, r: 1, t: 75, hotspot: attackHotspot },
					{ c: 9, r: 2, t: 75, hotspot: attackHotspot },
					{ c: 9, r: 3, t: 75, hotspot: attackHotspot },
				],
			},

			[aSideAttack]: {
				loop: true,
				frames: [
					{ c: 10, r: 0, t: 75, hotspot: attackHotspot },
					{ c: 10, r: 1, t: 75, hotspot: attackHotspot },
					{ c: 10, r: 2, t: 75, hotspot: attackHotspot },
					{ c: 10, r: 3, t: 75, hotspot: attackHotspot },
				],
			},

			[aBackgroundAttack]: {
				loop: true,
				frames: [
					{ c: 11, r: 0, t: 75, hotspot: attackHotspot },
					{ c: 11, r: 1, t: 75, hotspot: attackHotspot },
					{ c: 11, r: 2, t: 75, hotspot: attackHotspot },
					{ c: 11, r: 3, t: 75, hotspot: attackHotspot },
				],
			},

			[aDodge]: {
				loop: true,
				flags: { noControl: true },
				frames: [
					{ c: 12, r: 0, t: 75 },
					{ c: 12, r: 1, t: 75 },
					{ c: 12, r: 2, t: 75 },
					{ c: 12, r: 3, t: 75 },
					{ c: 12, r: 4, t: 75 },
				],
			},

			[aRoll]: {
				flags: { noControl: true },
				frames: [
					{ c: 12, r: 5, t: 75 },
					{ c: 12, r: 6, t: 75 },
					{ c: 12, r: 7, t: 75 },
					{ c: 12, r: 8, t: 75 },
					{ c: 12, r: 9, t: 75 },
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
