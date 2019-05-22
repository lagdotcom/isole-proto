import {
	gAirWalk,
	gGravityStrength,
	gGroundFriction,
	gGroundWalk,
	gJumpStrength,
	gJumpTimer,
	gMaxVA,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import { angledist, anglewrap, cart, jbr, pi, piHalf, scalew } from '../tools';
import controller from '../spr/zoomer';

const dRight = 'R',
	dDown = 'D',
	dLeft = 'L',
	dUp = 'U',
	gZoomerSpeed = 0.16,
	gRadiusMult = 6;

export default function Zoomer(game, img) {
	Object.assign(this, {
		game,
		dir: dRight,
		speed: gZoomerSpeed,
		last: {},
		width: 32,
		height: 14,
		a: piHalf,
		r: 200,
		va: 0,
		vr: 0,
		vfa: 0,
		vfr: 0,
		tscale: 0,
		sprite: controller(img),
	});
}

Zoomer.prototype.update = function(time) {
	var {
		a,
		r,
		va,
		vr,
		vfa,
		game,
		dir,
		speed,
		last,
		sprite,
		height,
		width,
	} = this;
	const { walls, ceilings, floors } = game,
		tscale = time / gTimeScale;
	this.tscale = tscale;
	const { b, t } = this.getHitbox();

	var floor = null;
	if (vr <= 0 || last.floor) {
		floors.forEach((f, i) => {
			var da = angledist(a, f.a);

			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) floor = f;
		});
	}

	var ceiling = null;
	if (vr > 0 || last.ceiling) {
		ceilings.forEach((f, i) => {
			var da = angledist(a, f.a);

			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) ceiling = f;
		});
		if (ceiling) {
			vr = 0;
		}
	}

	var wall = null;
	if (Math.abs(va) > gStandThreshold || game.wallsInMotion) {
		var vas = Math.sign(va + vfa);

		walls.forEach(w => {
			if (vas != w.direction && !w.motion) return;

			if (b.al <= w.a && b.ar >= w.a && t.r >= w.bottom && b.r <= w.top)
				wall = w;
		});
	}

	function applyfloor(f) {
		floor = f;
		wall = null;
		stuck = f;
		r = f.r;
		vr = 0;
		dir = dir == dRight ? dir : dLeft;
		va = dir == dRight ? speed : -speed;
		vfa = f.motion * time;

		sprite.ground();
	}

	function applywall(w) {
		wall = w;
		floor = null;
		ceiling = null;
		stuck = w;
		va = 0;
		dir = dir == dDown ? dir : dUp;
		vr = (dir == dUp ? speed : -speed) * gRadiusMult;
		vfa = w.motion * time;

		var wsw = scalew(width, r);
		if (w.direction == 1) {
			sprite.left();
			a = w.a - wsw;
		} else {
			sprite.right();
			a = w.a + wsw;
		}
	}

	function applyceiling(c) {
		ceiling = c;
		wall = null;
		stuck = c;
		r = c.r - height;
		vr = 0;
		dir = dir == dRight ? dir : dLeft;
		va = dir == dRight ? speed : -speed;
		vfa = c.motion * time;

		sprite.ceiling();
	}

	var stuck = null;
	if (floor && !last.wall) {
		applyfloor(floor);
	} else if (last.floor) {
		if (angledist(a, last.floor.right) < angledist(a, last.floor.left)) {
			wall = last.floor.wright;
		} else {
			wall = last.floor.wleft;
		}

		r = wall.top;
		dir = dDown;
	}

	if (ceiling && !last.wall) {
		applyceiling(ceiling);
	} else if (last.ceiling) {
		if (
			angledist(a, last.ceiling.right) < angledist(a, last.ceiling.left)
		) {
			wall = last.ceiling.wright;
		} else {
			wall = last.ceiling.wleft;
		}

		r = wall.bottom - height;
		dir = dUp;
	}

	if (wall) {
		applywall(wall);
	} else if (last.wall) {
		if (b.r <= last.wall.top && t.r >= last.wall.bottom)
			applywall(last.wall);
		else if (dir == dDown && last.wall.ceiling) {
			if (last.wall.direction == 1) dir = dRight;
			else dir = dLeft;
			applyceiling(last.wall.ceiling);
		} else if (dir == dUp && last.wall.floor) {
			if (last.wall.direction == 1) dir = dRight;
			else dir = dLeft;
			applyfloor(last.wall.floor);
		}
	}

	if (!stuck) {
		vr -= gGravityStrength;
	}

	this.va = va;
	this.vfa = vfa;
	this.vr = vr;
	a += (va / r) * tscale * gWalkScale + vfa;
	r += vr * tscale;

	if (r < 0) {
		r *= -1;
		a += pi;
	}

	this.a = anglewrap(a);
	this.r = r;
	this.dir = dir;
	this.last = { wall, floor, ceiling };

	if (!floor && !ceiling && !wall) {
		sprite.air();
	} else {
		sprite.walk(tscale);
	}
};

Zoomer.prototype.draw = function(c) {
	const { a, r, game, sprite } = this;
	const { cx, cy } = game;
	const normal = a + piHalf;

	const { x, y } = cart(a, r);

	c.translate(x + cx, y + cy);
	c.rotate(normal);

	sprite.draw(c);

	c.rotate(-normal);
	c.translate(-x - cx, -y - cy);
};

Zoomer.prototype.drawHitbox = function(c) {
	const { game } = this;
	const { cx, cy } = game;
	const { b, t, s } = this.getHitbox();

	c.strokeStyle = '#ffff00';
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();
};

Zoomer.prototype.getHitbox = function() {
	const { r, a, va, vr, width, height, tscale } = this;
	const baw = scalew(width, r),
		taw = scalew(width, r + height);
	var amod,
		vbr = 0,
		vtr = 0;

	if (tscale) amod = a + (va / r) * tscale * gWalkScale;
	else amod = a;

	if (vr > 0) vtr = vr;
	else if (vr < 0) vbr = vr;

	return {
		b: {
			r: r + vbr,
			aw: baw,
			al: amod - baw,
			ar: amod + baw,
		},
		t: {
			r: r + height + vtr,
			aw: taw,
			al: amod - taw,
			ar: amod + taw,
		},
	};
};
