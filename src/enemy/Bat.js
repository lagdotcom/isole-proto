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
	deg2rad,
	pi,
	piHalf,
	scalew,
	unscalew,
} from '../tools';
import controller from '../spr/bat';
import { zFlying } from '../layers';

const gNormalSpeed = 0.2,
	gFastSpeed = 0.4,
	gSlowSpeed = 0.08,
	gSubstateChange = 2000,
	gSubstateChance = 0.2,
	gZeroThreshold = 0.01;

const sProwling = 'prowling',
	sFlop = 'flop',
	sDrop = 'drop',
	sSlam = 'slam',
	sRecovery = 'recovery';

const sFlying = 'flying',
	sRoosting = 'roosting',
	sSleeping = 'sleeping',
	sPunching = 'punching',
	sWaking = 'waking';

const ssNormal = 'Normal',
	ssSlow = 'Slow',
	ssFast = 'Fast',
	ssTurn = 'Turn';

function drift(n) {
	return Math.random() * (n * 2) - n;
}

function lerp(a, b, f = 0.03) {
	return a * (1 - f) + b * f;
}

function choose(a) {
	const i = Math.floor(Math.random() * a.length);
	return a[i];
}

export default function Bat(game, options = {}) {
	Object.assign(
		this,
		{
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
	this[this.state + 'Update'](time);
};

Bat.prototype.flyingUpdate = function(time) {
	const tscale = time / gTimeScale;
	const { va, vr } = this['flying' + this.substate + 'Update'](time);

	var { a, r } = this;

	a += (va / r) * tscale * gWalkScale;
	r += vr * tscale;

	if (r < 0) {
		r *= -1;
		a += pi;
	}

	Object.assign(this, { a: anglewrap(a), r, va, vr });

	this.sprite.move(time);
};

Bat.prototype.flyingNormalUpdate = function(time) {
	var { dir, va, vr } = this;

	if (dir === dRight) va = lerp(va, gNormalSpeed);
	else va = lerp(va, -gNormalSpeed);

	this.checkChangeSubstate(time);
	return { va, vr };
};

Bat.prototype.flyingTurnUpdate = function(time) {
	var { dir, va, vr } = this;

	va = lerp(va, 0);
	if (Math.abs(va) < gZeroThreshold) {
		if (dir === dLeft) {
			this.dir = dRight;
			this.sprite.right();
		} else {
			this.dir = dLeft;
			this.sprite.left();
		}

		this.sprite.turn();

		while (this.substate === ssTurn) this.changeSubstate();
	}

	this.checkChangeSubstate(time);
	return { va, vr };
};

Bat.prototype.flyingFastUpdate = function(time) {
	var { dir, va, vr } = this;

	if (dir === dRight) va = lerp(va, gFastSpeed);
	else va = lerp(va, -gFastSpeed);

	this.checkChangeSubstate(time);
	return { va, vr };
};

Bat.prototype.flyingSlowUpdate = function(time) {
	var { dir, va, vr } = this;

	if (dir === dRight) va = lerp(va, gSlowSpeed);
	else va = lerp(va, -gSlowSpeed);

	this.checkChangeSubstate(time);
	return { va, vr };
};

Bat.prototype.checkChangeSubstate = function(time) {
	if (this.substateTimer <= 0) {
		if (Math.random() * time < gSubstateChance) this.changeSubstate();
	} else {
		this.substateTimer -= time;
	}
};

Bat.prototype.changeSubstate = function() {
	this.substate = choose([ssNormal, ssTurn, ssFast, ssSlow]);
	this.substateTimer = gSubstateChange;
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
};

Bat.prototype.getHitbox = function() {
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
