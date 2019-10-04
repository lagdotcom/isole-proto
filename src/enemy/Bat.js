/*
Column 1 - Flight: All frames are 90ms, bat flies around in a mostly meandering pattern, when facing the player and within close enough range, changes into the punch animation. If line of sight is not made and the bat has been flying for long enough, it will latch onto a ledge upside down and go to sleep for a time.

Column 2 - Punch: Frame 1 and 2 are 40ms, Frames 3-5 are 75ms and the bat will pull back slightly, Frames 6-8 are 50ms and repeat multiple times (roughly 3-4) and the bat will punch at the player's X and Y coordinates, drifting past whether it misses or connects before going into Frame 9 at 40ms and returning to flight.

Column 3 - Sleep: Frame 1 and 2 are 75ms, Frame 3 is 350ms, Frame 4 and 5 are 75ms, and Frame 6 is 350ms. Bat remains asleep until attacked or it wakes up randomly on it's own after resting for at least 6 or 7 seconds.

Column 4 - Wake-up: Frame 1 is 150ms, Frames 2-4 are 75ms, Frames 5-9 are 55ms and during this period the player will be harmed if they try to jump on or approach the bat, Frame 10 is 75ms, after this the bat will return to it's random flight pattern.

NOTES: the bat can be jumped on unless it is in the spinning animation during wake up, when it goes to punch it can still be jumped on like normal around it's head area, but it's fist will always damage the player. The hitbox for this creature would roughly be the head region and it's hands potentially, wings I don't see being part of it's hitbox for being jumped on or harming the player.
*/

import { cAI, cHurt } from '../colours';
import { dLeft, dRight } from '../dirs';
import { gTimeScale, gWalkScale } from '../nums';
import {
	angledist,
	anglewrap,
	cart,
	collides,
	deg2rad,
	fittest,
	pi,
	piHalf,
	rnd,
	rnda,
	rndr,
	scalew,
} from '../tools';
import controller from '../spr/bat';
import { zFlying } from '../layers';
import Channel from '../Channel';

const gAttackFar = 160,
	gAttackNear = 30,
	gNormalSpeed = 0.2,
	gFastSpeed = 0.4,
	gLungeSpeed = 0.4,
	gPullbackSpeed = 0.12,
	gRoostChance = 1, // TEST
	gSlowSpeed = 0.08,
	gSubstateChange = 2000,
	gSubstateChance = 0.2,
	gVerticalAcceleration = 0.0005,
	gVerticalChange = 3000,
	gVerticalChance = 0.1,
	gVerticalNear = 50,
	gVerticalSlowdown = 0.75,
	gZeroAngleThreshold = 0.01,
	gZeroRadiusThreshold = 2;

const sFlying = 'flying',
	sRoosting = 'roosting',
	sSleeping = 'sleeping',
	sPunching = 'punching',
	sWaking = 'waking';

const ssNormal = 'Normal',
	ssSlow = 'Slow',
	ssFast = 'Fast',
	ssTurn = 'Turn';

function lerp(a, b, f = 0.03) {
	return a * (1 - f) + b * f;
}

function choose(a) {
	return a[rndr(0, a.length)];
}

export default function Bat(game, options = {}) {
	Object.assign(
		this,
		{
			channel: new Channel(game, 'Bat'),
			isEnemy: true,
			layer: zFlying,
			game,
			name: 'Bat',
			width: 50,
			height: 50,
			a: 0,
			r: 250,
			rtop: options.r || 250,
			dir: dLeft,
			va: 0,
			vr: 0,
			state: sFlying,
			substate: ssNormal,
			substateTimer: gSubstateChange,
			verticalTimer: gVerticalChange,
			sprite: new controller(
				this,
				game.resources[options.img || 'enemy.bat']
			),
			alive: true,
			health: 2,
			damage: 1,
		},
		options
	);

	this.a = deg2rad(this.a);
}

Bat.prototype.update = function(time) {
	if (!this.minradius)
		this.minradius = fittest(this.game.floors, fl => -fl.r).r;

	if (!this.maxradius)
		this.maxradius = fittest(this.game.floors, fl => fl.r).r + this.height;

	if (!this.targetradius) this.targetradius = this.r;

	this[this.state + 'Update'](time);
};

Bat.prototype.physics = function(time, va, vr) {
	const tscale = time / gTimeScale;

	var { a, r } = this;

	a += (va / r) * tscale * gWalkScale;
	r += vr * tscale;

	if (r < 0) {
		r *= -1;
		a += pi;
	}

	Object.assign(this, { a: anglewrap(a), r, va, vr, tscale });
};

Bat.prototype.turn = function() {
	if (this.dir === dLeft) {
		this.dir = dRight;
		this.sprite.right();
	} else {
		this.dir = dLeft;
		this.sprite.left();
	}

	this.sprite.turn();
};

Bat.prototype[sFlying + 'Update'] = function(time) {
	if (this.canAttack()) {
		this.channel.play('enemy.bat.punch');
		this.state = sPunching;
		return this.punchingUpdate(time);
	}

	if (this.canRoost()) {
		this.state = sRoosting;
		return this.roostingUpdate(time);
	}

	const va = this[sFlying + this.substate + 'Update'](time);
	const vr = this.flyingVerticalUpdate(time);
	this.physics(time, va, vr);
	this.sprite.move(time);
};

Bat.prototype[sFlying + ssNormal + 'Update'] = function(time) {
	var { dir, va } = this;

	if (dir === dRight) va = lerp(va, gNormalSpeed);
	else va = lerp(va, -gNormalSpeed);

	this.checkChangeSubstate(time);
	return va;
};

Bat.prototype[sFlying + ssTurn + 'Update'] = function(time) {
	var { dir, va } = this;

	va = lerp(va, 0);
	if (Math.abs(va) < gZeroAngleThreshold) {
		this.turn();

		while (this.substate === ssTurn) this.changeSubstate();
	}

	this.checkChangeSubstate(time);
	return va;
};

Bat.prototype[sFlying + ssFast + 'Update'] = function(time) {
	var { dir, va } = this;

	if (dir === dRight) va = lerp(va, gFastSpeed);
	else va = lerp(va, -gFastSpeed);

	this.checkChangeSubstate(time);
	return va;
};

Bat.prototype[sFlying + ssSlow + 'Update'] = function(time) {
	var { dir, va } = this;

	if (dir === dRight) va = lerp(va, gSlowSpeed);
	else va = lerp(va, -gSlowSpeed);

	this.checkChangeSubstate(time);
	return va;
};

Bat.prototype.flyingVerticalUpdate = function(time) {
	var { r, minradius, maxradius, targetradius, vr } = this;

	const rdiff = targetradius - r;
	vr = gVerticalAcceleration * time * rdiff;

	if (Math.abs(rdiff) < gVerticalNear) vr *= gVerticalSlowdown;

	if (this.verticalTimer <= 0) {
		if (rnd() * time < gVerticalChance) {
			this.targetradius = rndr(minradius, maxradius);
			this.verticalTimer = gVerticalChange;
		}
	} else {
		this.verticalTimer -= time;
	}

	return vr;
};

Bat.prototype.checkChangeSubstate = function(time) {
	if (this.substateTimer <= 0) {
		if (rnd() * time < gSubstateChance) this.changeSubstate();
	} else {
		this.substateTimer -= time;
	}
};

Bat.prototype.changeSubstate = function() {
	this.substate = choose([ssNormal, ssTurn, ssFast, ssSlow]);
	this.substateTimer = gSubstateChange;
};

Bat.prototype.canAttack = function() {
	const { a } = this.getHitbox();
	return this.game.player.alive && collides(a, this.game.player.getHitbox());
};

Bat.prototype[sPunching + 'Update'] = function(time) {
	this.physics(time, this.va, this.vr);
	this.sprite.punch(time);
};

Bat.prototype.onpunchpullback = function() {
	this.va = this.dir === dLeft ? gPullbackSpeed : -gPullbackSpeed;
};

Bat.prototype.onpunchforward = function() {
	this.va = this.dir === dLeft ? -gLungeSpeed : gLungeSpeed;
};

Bat.prototype.onpunchdone = function() {
	this.state = sFlying;
};

Bat.prototype.canRoost = function() {
	if (rnd() >= gRoostChance) return false;
	this.roost = this.getNearestCeiling();
	this.roostangle = null;
	return !!this.roost;
};

Bat.prototype.getNearestCeiling = function() {
	var best = null,
		bestd = Infinity;

	this.game.ceilings.forEach(c => {
		// TODO: roost on moving ceilings
		if (c.motion) return;

		const dl = angledist(this.a, c.left);
		const dr = angledist(this.a, c.right);
		const db = Math.min(dl, dr);

		if (db < bestd) {
			best = c;
			bestd = db;
		}
	});

	return best;
};

Bat.prototype[sRoosting + 'Update'] = function(time) {
	if (!this.roostangle) {
		this.roostangle = rnda(this.roost.left, this.roost.right);
		this.roostradius = this.roost.r - this.height;

		const nd = this.roostangle > this.a ? dRight : dLeft;
		if (nd !== this.dir) this.turn();
	}

	const va = this.roostingAngleUpdate(time);
	const vr = this.roostingRadiusUpdate(time);
	this.physics(time, va, vr);

	if (va === 0 && vr === 0) this.state = sSleeping;

	this.sprite.move(time);
};

Bat.prototype.roostingAngleUpdate = function(time) {
	var { dir, va } = this;

	const adiff = angledist(this.a, this.roostangle);
	if (adiff < gZeroAngleThreshold) {
		this.a = this.roostangle;
		return 0;
	}

	if (dir === dRight) va = lerp(va, gSlowSpeed);
	else va = lerp(va, -gSlowSpeed);

	return va;
};

Bat.prototype.roostingRadiusUpdate = function(time) {
	var { r, roostradius, vr } = this;

	const rdiff = roostradius - r;
	if (rdiff < gZeroRadiusThreshold) {
		this.r = roostradius;
		return 0;
	}

	vr = gVerticalAcceleration * time * rdiff;
	if (Math.abs(rdiff) < gVerticalNear) vr *= gVerticalSlowdown;

	return vr;
};

Bat.prototype[sSleeping + 'Update'] = function(time) {
	this.sprite.sleep(time);
};

Bat.prototype.draw = function(c) {
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

Bat.prototype.drawHitbox = function(c) {
	const { game } = this;
	const { cx, cy } = game;
	const { b, t, a } = this.getHitbox();

	c.strokeStyle = cHurt;
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();

	c.strokeStyle = cAI;
	c.beginPath();
	c.arc(cx, cy, a.b.r, a.b.al, a.b.ar);
	c.arc(cx, cy, a.t.r, a.b.ar, a.b.al, true);
	c.arc(cx, cy, a.b.r, a.b.al, a.b.ar);
	c.stroke();
};

Bat.prototype.getHitbox = function() {
	const { r, a, va, vr, width, height, tscale, dir } = this;
	const baw = scalew(width, r),
		taw = scalew(width, r + height),
		naw = scalew(gAttackNear, r),
		faw = scalew(gAttackFar, r),
		left = dir === dLeft;
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
			b: {
				r: r + vbr,
				aw: faw - naw,
				al: left ? amod - faw : amod + naw,
				ar: left ? amod - naw : amod + faw,
			},
			t: {
				r: r + height + vbr,
				aw: faw - naw,
				al: left ? amod - faw : amod + naw,
				ar: left ? amod - naw : amod + faw,
			},
		},
	};
};
