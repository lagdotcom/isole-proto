import Flat from './component/Flat';
import Wall from './component/Wall';
import { Milliseconds, Pixels, Radians } from './flavours';
import Game from './Game';
import Hitbox from './Hitbox';
import {
	gGravityStrength,
	gGroundFriction,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
} from './nums';
import { angleDistance, first, wrapAngle, π } from './tools';

interface PhysicsObject {
	a: Radians;
	game: Game;
	getHitbox(): Hitbox;
	ignoreCeilings?: boolean;
	ignoreFloors?: boolean;
	ignoreGravity?: boolean;
	ignoreWalls?: boolean;
	r: Pixels;
	va: number;
	vfa: number;
	vr: number;
}

export default function physics(obj: PhysicsObject, time: Milliseconds) {
	const { game, ignoreCeilings, ignoreFloors, ignoreGravity, ignoreWalls } =
		this;
	let {
		a,

		r,
		va,
		vfa,
		vr,
	} = obj;
	const { walls, ceilings, floors } = game,
		tscale = time / gTimeScale;
	const { bot, top } = obj.getHitbox();

	let floor: Flat | null = null;
	if (vr <= 0 && !ignoreFloors) {
		floor = first(floors, f => {
			const da = angleDistance(a, f.a);

			return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
		});
	}

	let ceiling: Flat | null = null;
	if (vr > 0 && !ignoreCeilings) {
		ceiling = first(ceilings, f => {
			const da = angleDistance(a, f.a);

			return bot.r <= f.r && top.r >= f.r && da < f.width + top.width;
		});
		if (ceiling) {
			vr = 0;
		}
	}

	let wall: Wall | null = null;
	if (
		!ignoreWalls &&
		(Math.abs(va) > gStandThreshold || game.wallsInMotion)
	) {
		const vas = Math.sign(va + vfa);
		wall = first(walls, w => {
			if (vas !== w.direction && !w.motion) return false;

			return (
				bot.a - bot.width <= w.a &&
				bot.a + bot.width >= w.a &&
				top.r >= w.bottom &&
				bot.r <= w.top
			);
		});
	}

	if (floor) {
		r = floor.r;
		vr = 0;
		va *= gGroundFriction;
		vfa = floor.motion * time;
	} else {
		if (!ignoreGravity) vr -= gGravityStrength;
		vfa = 0;
	}

	obj.va = va;
	obj.vfa = vfa;
	obj.vr = vr;
	a += (va / r) * tscale * gWalkScale + vfa;
	r += vr * tscale;

	if (r < 0) {
		r *= -1;
		a += π;
	}

	obj.a = wrapAngle(a);
	obj.r = r;

	return { floor, ceiling, wall };
}
