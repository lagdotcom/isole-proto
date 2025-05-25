import { Milliseconds, Multiplier, Pixels } from './flavours';

export const gTimeScale = 10,
	gHitboxScale = Math.PI / 6,
	gGroundWalk = 0.06,
	gGroundFriction = 0.8,
	gAirWalk = 0.025,
	gGravityStrength = 0.12,
	gWalkScale = 10,
	gMaxVA = 0.3,
	gMaxTimeStep: Milliseconds = 1000 / 20.0,
	gStandThreshold = 0.005,
	gWallGap: Pixels = 5,
	gWallBounce = -0.01,
	gPadAxisThreshold = 0.4,
	gBackZ: Multiplier = 0.5,
	gFrontZ: Multiplier = 1,
	gMidZ: Multiplier = (gBackZ + gFrontZ) / 2,
	gCollideZ: Multiplier = 0.1;

export function getZ(back: boolean) {
	return back ? gBackZ : gFrontZ;
}

export function getBack(z: Multiplier) {
	return z <= gMidZ;
}
