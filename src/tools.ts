import { gHitboxScale } from './nums';
import CoordAR from './CoordAR';
import CoordXY from './CoordXY';
import Hitbox, { Hitsize } from './Hitbox';
import Damageable from './Damageable';
import { eEnemyDied } from './events';

export const π = Math.PI,
	π2 = π * 2,
	πHalf = π / 2;

/**
 * Wrap an angle over 2π
 * @param {number} a angle
 * @returns {number} wrapped angle
 */
export function anglewrap(a: number): number {
	a = a % π2;
	if (a < 0) a += π2;
	return a;
}

/**
 * Find the distance between two angles
 * @param {number} a first angle
 * @param {number} b second angle
 * @returns {number} angle distance
 */
export function angledist(a: number, b: number): number {
	var d = a - b;
	if (d > π) d -= π2;
	else if (d < -π) d += π2;
	return Math.abs(d);
}

/**
 * Join with BR tags
 * @param {...string} var_args items
 * @returns {string} joined items
 */
export function jbr(...args: string[]): string {
	var s = '';
	for (var i = 0; i < args.length; i++) {
		if (i) s += '<br>';
		s += args[i];
	}

	return s;
}

/**
 * Convert polar to cartesian
 * @param {number} a angle
 * @param {number} r radius
 * @return {CoordXY}
 */
export function cart(a: number, r: number): CoordXY {
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
export function scalew(w: number, r: number): number {
	return (w / r) * gHitboxScale;
}

/**
 * Unscale a width according to its radius
 * @param {number} ws scaled width
 * @param {number} r radius
 * @returns {number} width
 */
export function unscalew(ws: number, r: number): number {
	return (ws / gHitboxScale) * r;
}

/**
 * Convert degrees to radians
 * @param {number} a angle in degrees
 * @return {number} angle in radians
 */
export function deg2rad(a: number): number {
	return (π2 * a) / 360;
}

export const max = Math.max;
export const min = Math.min;

/**
 * Check if any item matches a predicate
 * @param {any[]} a items
 * @param {(any) => boolean} fn callback
 * @returns {boolean} match found
 */
export function any(a: any[], fn: (value: any) => boolean): boolean {
	for (var i = a.length - 1; i >= 0; i--) {
		if (fn(a[i])) return true;
	}

	return false;
}

/**
 * Find the first item in a list that matches a predicate
 * @param {T[]} a item list
 * @param {(T, number) => boolean} fn check function
 * @returns {T|null} first matching item or null
 */
export function first<T>(
	a: T[],
	fn: (object: T, index?: number) => boolean
): T | null {
	for (var i = 0; i < a.length; i++) {
		if (fn(a[i], i)) return a[i];
	}

	return null;
}

/**
 * Check if two hitsizes overlap angle-wise
 * @param a first hitsize
 * @param b second hitsize
 */
export function anglecollides(a: Hitsize, b: Hitsize): boolean {
	const ad = angledist(a.a, b.a);
	return ad < a.width + b.width;
}

/**
 * Check if two hitboxes overlap
 * @param {Hitbox} a first hitbox
 * @param {Hitbox} b second hitbox
 * @returns {boolean} overlap found
 */
export function collides(a: Hitbox, b: Hitbox): boolean {
	// TODO: should this also check .t.a?
	return (
		a.bot.r <= b.top.r && a.top.r >= b.bot.r && anglecollides(a.bot, b.bot)
	);
}

/**
 * Damage something
 * @param {Damageable} target target
 * @param {Damageable} attacker attacker
 * @param {number} n amount
 */
export function damage(
	target: Damageable,
	attacker: Damageable,
	n: number
): void {
	const { game } = target;

	if (target.invincible) return;

	target.health -= n;

	if (target.health <= 0) {
		if (target.alive) {
			target.alive = false;
			if (target.die) target.die(attacker);
			else game.remove(target);

			if (target.isEnemy) game.fire(eEnemyDied, { attacker, target });
		}
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
 * @param {CoordAR} x first coord
 * @param {CoordAR} y second coord
 * @returns {CoordAR} vector
 */
export function dirv(x: CoordAR, y: CoordAR): CoordAR {
	const rd = x.r - y.r;
	const ad = x.a - y.a;
	const t = Math.abs(rd + ad);
	const r = rd / t;
	const a = ad / t;

	return { r, a };
}

/**
 * Displace a polar coordinate by a list of cartesian coordinates
 * @param {CoordAR} origin origin
 * @param {CoordXY[]} offsets offset list
 * @param {boolean} flip flip on X axis
 * @returns {CoordAR} final position
 */
export function displace(
	origin: CoordAR,
	offsets: CoordXY[] = [],
	flip: boolean = false
): CoordAR {
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
 * @param {T[]} objects item list
 * @param {(T) => number} scorer scoring function
 * @returns {T|null} best object or null (if empty list)
 */
export function fittest<T>(
	objects: T[],
	scorer: (object: T) => number
): T | null {
	var bestScore: number = -Infinity,
		best: T | null = null;
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
 * @returns {number}
 */
export function rndr(
	min: number,
	max: number,
	rounder: (value: number) => number = Math.floor
): number {
	return rounder(rnd() * (max - min)) + min;
}

/**
 * Return a random angle within a range
 * @param {number} min minimum angle
 * @param {number} max maximum angle
 * @returns {number}
 */
export function rnda(min: number = 0, max: number = π2): number {
	return anglewrap(rndr(min, max, n => n));
}

/**
 * Return a percentage chance checker
 * @param {number} percentage chance for event to occur
 * @returns {() => boolean}
 */
export const chance = (percentage: number) => () => rndr(0, 100) < percentage;

/**
 * Add up a list of numbers.
 * @param {number[]} items list of numbers
 * @param {number} start number to start from
 * @returns {number}
 */
export function sum(items: number[], start: number = 0): number {
	items.forEach(i => {
		start += i;
	});
	return start;
}

/**
 * Randomly picks from a weighted list.
 * @param {[T, number][]} weightings list of weightings
 * @returns {T}
 */
export function rndweight<T>(...weightings: [T, number][]): T {
	const total = sum(weightings.map(([_, weight]) => weight));
	const roll = rndr(0, total);
	let accumulator = 0;
	for (let i = 0; i < weightings.length; i++) {
		const [choice, weight] = weightings[i];
		if (roll < accumulator + weight) return choice;
		accumulator += weight;
	}

	throw new Error('Try passing some arguments next time');
}

/**
 * Linear interpolation.
 * @param {number} a start value
 * @param {number} b end value
 * @param {number} f fraction
 * @returns {number}
 */
export function lerp(a: number, b: number, f: number = 0.03): number {
	return a * (1 - f) + b * f;
}

/**
 * Randomly choose from a list.
 * @param {T[]} a choice list
 * @returns {T}
 */
export function choose<T>(a: T[]): T {
	return a[rndr(0, a.length)];
}

/**
 * Draw a ...wedge?
 * @param {CanvasRenderingContext2D} c canvas context
 * @param {string | CanvasGradient | CanvasPattern} style line style
 * @param {number} x center x
 * @param {number} y center y
 * @param {Hitsize} b bottom hitsize
 * @param {Hitsize} t top hitsize
 */
export function drawWedge(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: number,
	y: number,
	b: Hitsize,
	t: Hitsize
) {
	c.strokeStyle = style;
	c.beginPath();
	c.arc(x, y, b.r, b.a - b.width, b.a + b.width);
	c.arc(x, y, t.r, t.a + t.width, t.a - t.width, true);
	c.arc(x, y, b.r, b.a - b.width, b.a + b.width);
	c.stroke();
}

/**
 * Draw an arc
 * @param {CanvasRenderingContext2D} c canvas context
 * @param {string | CanvasGradient | CanvasPattern} style line style
 * @param {number} x center x
 * @param {number} y center y
 * @param {number} r radius
 * @param {number} a angle
 * @param {number} width width
 */
export function drawArc(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: number,
	y: number,
	r: number,
	a: number,
	width: number
) {
	c.strokeStyle = style;
	c.beginPath();
	c.arc(x, y, r, a - width, a + width);
	c.stroke();
}

/**
 * Draw a cross
 * @param {CanvasRenderingContext2D} c canvas context
 * @param {string | CanvasGradient | CanvasPattern} style line style
 * @param {number} x center x
 * @param {number} y center y
 * @param {number} size cross size
 */
export function drawCross(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: number,
	y: number,
	size: number = 4
) {
	c.strokeStyle = style;
	c.beginPath();
	c.moveTo(x - size, y - size);
	c.lineTo(x + size, y + size);
	c.moveTo(x + size, y - size);
	c.lineTo(x - size, y + size);
	c.stroke();
}
