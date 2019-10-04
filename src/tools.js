import { gHitboxScale } from './nums';

export const pi = Math.PI,
	pi2 = pi * 2,
	piHalf = pi / 2;

/**
 * Wrap an angle over 2π
 * @param {number} a angle
 * @returns {number} wrapped angle
 */
export function anglewrap(a) {
	a = a % pi2;
	if (a < 0) a += pi2;
	return a;
}

/**
 * Find the distance between two angles
 * @param {number} a first angle
 * @param {number} b second angle
 * @returns {number} angle distance
 */
export function angledist(a, b) {
	var d = a - b;
	if (d > pi) d -= pi2;
	else if (d < -pi) d += pi2;
	return Math.abs(d);
}

/**
 * Join with BR tags
 * @param {...string} var_args items
 * @returns {string} joined items
 */
export function jbr() {
	var s = '';
	for (var i = 0; i < arguments.length; i++) {
		if (i) s += '<br>';
		s += arguments[i];
	}

	return s;
}

/**
 * Convert polar to cartesian
 * @param {number} a angle
 * @param {number} r radius
 * @return {XYCoord}
 */
export function cart(a, r) {
	return {
		x: Math.cos(a) * r,
		y: Math.sin(a) * r,
	};
}

/**
 * Scale a width according to its radius
 * @param {number} w width
 * @param {number} r radius
 * @returns {number} scaled width
 */
export function scalew(w, r) {
	return (w / r) * gHitboxScale;
}

/**
 * Unscale a width according to its radius
 * @param {number} ws scaled width
 * @param {number} r radius
 * @returns {number} width
 */
export function unscalew(ws, r) {
	return (ws / gHitboxScale) * r;
}

/**
 * Convert degrees to radians
 * @param {number} a angle in degrees
 * @return {number} angle in radians
 */
export function deg2rad(a) {
	return (pi2 * a) / 360;
}

export const max = Math.max;
export const min = Math.min;

/**
 * Check if any item matches a predicate
 * @param {any[]} a items
 * @param {(any) => boolean} fn callback
 * @returns {boolean} match found
 */
export function any(a, fn) {
	for (var i = a.length - 1; i >= 0; i--) {
		if (fn(a[i])) return true;
	}

	return false;
}

/**
 * Check if two hitboxes overlap
 * @param {Hitbox} a first hitbox
 * @param {Hitbox} b second hitbox
 * @returns {boolean} overlap found
 */
export function collides(a, b) {
	// TODO: should this also check .t.al?
	return (
		a.b.r <= b.t.r && a.t.r >= b.b.r && a.b.ar >= b.b.al && a.b.al <= b.b.ar
	);
}

/**
 * Damage something
 * @param {Component} target target
 * @param {Component} attacker attacker
 * @param {number} n amount
 */
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

/**
 * Create a vector between two coordinates
 * @param {RACoord} x first coord
 * @param {RACoord} y second coord
 * @returns {RACoord} vector
 */
export function dirv(x, y) {
	const rd = x.r - y.r;
	const ad = x.a - y.a;
	const t = Math.abs(rd + ad);
	const r = rd / t;
	const a = ad / t;

	return { r, a };
}

/**
 * Displace a polar coordinate by a list of cartesian coordinates
 * @param {RACoord} origin origin
 * @param {XYCoord[]} offsets offset list
 * @param {boolean} flip flip on X axis
 * @returns {RACoord} final position
 */
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

/**
 * Find the fittest item from a list
 * @param {any[]} objects item list
 * @param {(any) => number} scorer scoring function
 * @returns {any} best object
 */
export function fittest(objects, scorer) {
	var bestScore = -Infinity,
		best = null;
	objects.forEach(o => {
		var score = scorer(o);
		if (score > bestScore) {
			bestScore = score;
			best = o;
		}
	});

	return best;
}

export const rnd = Math.random;

/**
 * Return a random number within a range
 * @param {number} min minimum bound
 * @param {number} max maximum bound
 * @param {(number) => number} rounder rounding function (defaults to floor)
 */
export function rndr(min, max, rounder = Math.floor) {
	return rounder(rnd() * (max - min)) + min;
}

/**
 * Return a random angle within a range
 * @param {number} min minimum angle
 * @param {number} max maximum angle
 */
export function rnda(min, max) {
	return anglewrap(rndr(min, max, n => n));
}
