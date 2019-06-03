import {
	gGravityStrength,
	gGroundFriction,
	gMaxVA,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
	gWallBounce,
} from '../nums';
import {
	angledist,
	anglewrap,
	cart,
	deg2rad,
	jbr,
	pi,
	piHalf,
	scalew,
	unscalew,
} from '../tools';
import controller from '../spr/buster';

const gJumpDelay = 150,
	gJumpSide = 0.4,
	gJumpStartup = 15,
	gJumpStrength = 4,
	gAttackWidth = 250,
	gNearWidth = 500,
	gRadiusMult = 6;

const sIdle = 'idle',
	sPreJump = 'prejump',
	sJumping = 'jumping',
	sWaiting = 'waiting';

export default function Buster(game, options = {}) {
	Object.assign(
		this,
		{
			game,
			name: 'Buster',
			width: 35,
			height: 35,
			a: 0,
			r: 250,
			va: 0,
			vr: 0,
			vfa: 0,
			vfr: 0,
			fatigue: 0,
			state: sIdle,
			sprite: controller(game.resources[options.img || 'enemy.buster']),
		},
		options
	);

	this.a = deg2rad(this.a);
}

Buster.prototype.update = function(time) {
	var { a, r, va, vr, vfa, game, sprite, state } = this;
	const { player, walls, ceilings, floors } = game,
		tscale = time / gTimeScale;
	const { b, t } = this.getHitbox();
	const playerDist = unscalew(angledist(a, player.a), r),
		attackable = playerDist - player.w <= gAttackWidth,
		near = playerDist - player.w <= gNearWidth;

	var floor = null;
	if (vr <= 0) {
		floors.forEach((f, i) => {
			var da = angledist(a, f.a);

			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) floor = f;
		});
	}

	var ceiling = null;
	if (vr > 0) {
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
		const vas = Math.sign(va + vfa);
		walls.forEach(w => {
			if (vas != w.direction && !w.motion) return;

			if (b.al <= w.a && b.ar >= w.a && t.r >= w.bottom && b.r <= w.top)
				wall = w;
		});
	}

	this.fatigue -= tscale;

	if (floor) {
		this.grounded = true;

		r = floor.r;
		vr = 0;
		va *= gGroundFriction;
		vfa = floor.motion * time;

		if (attackable) {
			switch (state) {
				case sPreJump:
					this.jumpdelay -= tscale;
					if (this.jumpdelay <= 0) {
						if (anglewrap(a - player.a) > pi) va = gJumpSide;
						else va = -gJumpSide;

						this.fatigue = gJumpDelay;
						vr = gJumpStrength;
						state = sJumping;
					}
					break;

				case sJumping:
					state = sWaiting;
					break;

				case sWaiting:
					this.jumpdelay -= tscale;
					if (this.jumpdelay <= 0) state = sIdle;
					break;

				default:
					if (this.fatigue <= 0) {
						state = sPreJump;
						this.jumpdelay = gJumpStartup;
					} else {
						state = sIdle;
					}
			}
		} else {
			state = sIdle;
		}
	} else {
		this.grounded = false;

		vr -= gGravityStrength;
		vfa = 0;
	}

	if (wall && !ceiling) {
		const bounce = wall.direction * gWallBounce;
		if (wall.direction == 1) {
			a = wall.a - b.aw;
			if (va > bounce) va = bounce;
		} else {
			a = wall.a + b.aw;
			if (va < -bounce) va = -bounce;
		}
	} else if (va > gMaxVA) va = gMaxVA;
	else if (va < -gMaxVA) va = -gMaxVA;

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
	this.state = state;

	if (!this.grounded) {
		if (vr > 0) sprite.rise(time);
		else sprite.fall(time);
	} else if (state === sPreJump) {
		sprite.jump(time);
	} else if (near) {
		sprite.near(time);
	} else {
		sprite.idle(time);
	}
};

Buster.prototype.draw = function(c) {
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

Buster.prototype.drawHitbox = function(c) {
	const { game } = this;
	const { cx, cy } = game;
	const { b, t, a, n } = this.getHitbox();

	c.strokeStyle = '#ffff00';
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();

	c.strokeStyle = '#ff0000';
	c.beginPath();
	c.arc(cx, cy, a.r, a.al, a.ar);
	c.arc(cx, cy, t.r, a.ar, a.al, true);
	c.arc(cx, cy, a.r, a.al, a.ar);
	c.stroke();

	c.strokeStyle = '#880000';
	c.beginPath();
	c.arc(cx, cy, n.r, n.al, n.ar);
	c.arc(cx, cy, t.r, n.ar, n.al, true);
	c.arc(cx, cy, n.r, n.al, n.ar);
	c.stroke();
};

Buster.prototype.getHitbox = function() {
	const { r, a, va, vr, width, height, tscale } = this;
	const baw = scalew(width, r),
		taw = scalew(width, r + height),
		aaw = scalew(gAttackWidth, r),
		naw = scalew(gNearWidth, r);
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
		a: {
			r: r + vbr,
			aw: aaw,
			al: amod - aaw,
			ar: amod + aaw,
		},
		n: {
			r: r + vbr,
			aw: naw,
			al: amod - naw,
			ar: amod + naw,
		},
	};
};
