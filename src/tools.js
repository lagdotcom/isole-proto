import { gHitboxScale } from './nums';

export const pi = Math.PI,
	pi2 = pi * 2,
	piHalf = pi / 2;

export function anglewrap(a) {
	a = a % pi2;
	if (a < 0) a += pi2;
	return a;
}

export function angledist(a, b) {
	var d = a - b;
	if (d > pi) d -= pi2;
	else if (d < -pi) d += pi2;
	return Math.abs(d);
}

export function jbr() {
	var s = '';
	for (var i = 0; i < arguments.length; i++) {
		if (i) s += '<br>';
		s += arguments[i];
	}

	return s;
}

export function cart(a, r) {
	return {
		x: Math.cos(a) * r,
		y: Math.sin(a) * r,
	};
}

export function scalew(w, r) {
	return (w / r) * gHitboxScale;
}

export function unscalew(ws, r) {
	return (ws / gHitboxScale) * r;
}

export function deg2rad(a) {
	return (pi2 * a) / 360;
}

export function max(a, b) {
	return a > b ? a : b;
}

export function min(a, b) {
	return a < b ? a : b;
}

export function any(a, fn) {
	for (var i = a.length - 1; i >= 0; i--) {
		if (fn(a[i])) return true;
	}

	return false;
}

export function collides(a, b) {
	// TODO: should this also check .t.al?
	return (
		a.b.r <= b.t.r && a.t.r >= b.b.r && a.b.ar >= b.b.al && a.b.al <= b.b.ar
	);
}

export function damage(target, attacker, n) {
	const { game } = target;

	if (target.invincible) return;

	target.health -= n;

	if (target.health <= 0) {
		target.alive = false;
		if (target.die) target.die();
		else game.remove(target);
	} else {
		if (target.hurt) target.hurt(attacker, n);
		if (attacker.hit) attacker.hit(target);
	}

	if (target === game.player) {
		game.inventory.health = target.health;
	}
}

export function dirv(x, y) {
	const rd = x.r - y.r;
	const ad = x.a - y.a;
	const t = Math.abs(rd + ad);
	const r = rd / t;
	const a = ad / t;

	return { r, a };
}

export function displace(origin, offsets = [], flip = false) {
	const { a, r } = origin;
	var x = 0,
		y = 0;

	offsets.forEach(h => {
		x += h.x;
		y += h.y;
	});

	if (flip) x = 0 - x;

	return { a: a + scalew(x, r + y), r: r + y };
}
