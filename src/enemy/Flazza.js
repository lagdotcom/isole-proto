/*
MOVEMENT: 75 ms for the flying animation

TURN: 75 ms, top cell is turning right to left, bottom is left to right.

BODY SLAM/FLOP: Frame 1 & 2 are 75 ms, Frame 3 hangs until landing on the ground, Frame 4 & 5 are 75 ms, Frame 6 is 400 ms, Frame 7 & 8 are 75 MS and frame 9 is 400 MS

NOTES: After the body slam recovery, the flying animation will begin playing again, I imagine the Flazza can't belly flop again until reaching the typical height it flies above platforms, or maybe after a set time. This enemy will definitely take some playing with to get right.
*/

import { cAI, cHurt } from '../colours';
import { dLeft } from '../dirs';
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
import controller from '../spr/flazza';
import { zFlying } from '../layers';

const gAttackWidth = 120,
	gSpeed = 0.2,
	gFlopSpeed = 1.5,
	gDropSpeed = -7,
	gRecoverSpeed = 0.75;
const sProwling = 'prowling',
	sFlop = 'flop',
	sDrop = 'drop',
	sSlam = 'slam',
	sRecovery = 'recovery';

export default function Flazza(game, options = {}) {
	Object.assign(
		this,
		{
			isEnemy: true,
			layer: zFlying,
			game,
			name: 'Flazza',
			width: 45,
			height: 45,
			a: 0,
			r: 250,
			rtop: options.r || 250,
			dir: dLeft,
			speed: gSpeed,
			dropSpeed: gDropSpeed,
			recoverSpeed: gRecoverSpeed,
			va: 0,
			vr: 0,
			state: sProwling,
			sprite: new controller(
				this,
				game.resources[options.img || 'enemy.flazza']
			),
			health: 2,
			damage: 1,
		},
		options
	);

	this.a = deg2rad(this.a);
}

Flazza.prototype.update = function(time) {
	var {
		a,
		r,
		rtop,
		va,
		vr,
		game,
		sprite,
		state,
		dir,
		speed,
		dropSpeed,
		recoverSpeed,
	} = this;
	const { player } = game,
		tscale = time / gTimeScale;

	switch (state) {
		case sProwling:
			if (this.shouldAttack(player)) {
				state = sFlop;
			} else {
				va = dir === dLeft ? -speed : speed;
			}

			break;

		case sFlop:
			vr = gFlopSpeed;
			break;

		case sDrop:
			va = 0;
			var floor = this.getFloor();
			if (floor) {
				r = floor.r;
				vr = 0;
				state = sSlam;
			} else {
				vr = dropSpeed;
			}
			break;

		case sRecovery:
			if (r >= rtop) {
				r = rtop;
				vr = 0;
				state = sProwling;
			} else {
				va = dir === dLeft ? -speed : speed;
				vr = recoverSpeed;
			}
			break;
	}

	this.va = va;
	this.vr = vr;
	a += (va / r) * tscale * gWalkScale;
	r += vr * tscale;

	if (r < 0) {
		r *= -1;
		a += pi;
	}

	this.a = anglewrap(a);
	this.r = r;
	this.state = state;

	dir === dLeft ? sprite.left() : sprite.right();

	switch (state) {
		case sProwling:
		case sRecovery:
			sprite.fly(time);
			break;

		case sFlop:
			sprite.flop(time);
			break;

		case sDrop:
			sprite.drop(time);
			break;

		case sSlam:
			sprite.slam(time);
			break;
	}
};

Flazza.prototype.draw = function(c) {
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

Flazza.prototype.drawHitbox = function(c) {
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
	c.arc(cx, cy, a.r, a.al, a.ar);
	c.arc(cx, cy, t.r, a.ar, a.al, true);
	c.arc(cx, cy, a.r, a.al, a.ar);
	c.stroke();
};

Flazza.prototype.getHitbox = function() {
	const { r, a, va, vr, width, height, tscale } = this;
	const baw = scalew(width, r),
		taw = scalew(width, r + height),
		aaw = scalew(gAttackWidth, r);
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
	};
};

Flazza.prototype.getFloor = function() {
	const { b, t } = this.getHitbox();
	const { a, game } = this;
	var floor = null;

	game.floors.forEach((f, i) => {
		var da = angledist(a, f.a);

		if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) floor = f;
	});

	return floor;
};

Flazza.prototype.shouldAttack = function(target) {
	const { a, r } = this;

	const dist = unscalew(angledist(a, target.a), r);
	return target.health && dist - target.w <= gAttackWidth && r > target.r;
};

Flazza.prototype.onDrop = function() {
	this.state = sDrop;
};

Flazza.prototype.onRecover = function() {
	this.state = sRecovery;
};
