import CoordARZ from './CoordARZ';
import CoordXY from './CoordXY';
import Damageable from './Damageable';
import DrawnComponent from './DrawnComponent';
import { Degrees, Multiplier, Pixels, Radians } from './flavours';
import Hitbox, { HitSize } from './Hitbox';
import { gCollideZ, gFrontZ, gHitboxScale } from './nums';

export const π: Radians = Math.PI,
	π2: Radians = π * 2,
	πHalf: Radians = π / 2;

/**
 * Wrap an angle over 2π
 * @param {Radians} a angle
 * @returns {Radians} wrapped angle
 */
export function wrapAngle(a: Radians): Radians {
	a = a % π2;
	if (a < 0) a += π2;
	return a;
}

/**
 * Determine whether an angle is to the right of another angle.
 * @param {Radians} a first angle
 * @param {Radians} b second angle
 */
export function isRightOf(a: Radians, b: Radians): boolean {
	return wrapAngle(a - b) > π;
}

/**
 * Find the distance between two angles
 * @param {Radians} a first angle
 * @param {Radians} b second angle
 * @returns {Radians} angle distance
 */
export function angleDistance(a: Radians, b: Radians): Radians {
	let d = a - b;
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
	let s = '';
	for (let i = 0; i < args.length; i++) {
		if (i) s += '<br>';
		s += args[i];
	}

	return s;
}

/**
 * Convert polar to cartesian
 * @param {Radians} a angle
 * @param {Pixels} r radius
 * @return {CoordXY}
 */
export function cart<T extends number>(a: Radians, r: T): CoordXY<T> {
	return {
		x: (Math.cos(a) * r) as T,
		y: (Math.sin(a) * r) as T,
	};
}

/**
 * Scale a width according to its radius
 * @param {Pixels} w width
 * @param {Pixels} r radius
 * @param {Multiplier} z depth
 * @returns {Radians} scaled width
 */
export function scaleWidth(w: Pixels, r: Pixels, z: Multiplier): Radians {
	return (w / r) * gHitboxScale * z;
}

/**
 * Unscale a width according to its radius
 * @param {Pixels} ws scaled width
 * @param {Pixels} r radius
 * @returns {Pixels} width
 */
export function unscaleWidth(ws: Radians, r: Pixels): Pixels {
	return (ws / gHitboxScale) * r;
}

/**
 * Convert degrees to radians
 * @param {Degrees} a angle in degrees
 * @return {Radians} angle in radians
 */
export function deg2rad(a: Degrees): Radians {
	return (π2 * a) / 360;
}

export const max = Math.max;
export const min = Math.min;

/**
 * Check if any item matches a predicate
 * @param {T[]} a items
 * @param {(T) => boolean} fn callback
 * @returns {boolean} match found
 */
export function any<T>(a: T[], fn: (value: T) => boolean): boolean {
	for (let i = a.length - 1; i >= 0; i--) {
		if (fn(a[i])) return true;
	}

	return false;
}

/**
 * Find the first item in a list that matches a predicate
 * @param {T[]} a item list
 * @param {(T, number) => boolean} fn check function
 * @returns {T|undefined} first matching item or null
 */
export function first<T>(
	a: T[],
	fn: (object: T, index: number) => boolean
): T | undefined {
	for (let i = 0; i < a.length; i++) {
		if (fn(a[i], i)) return a[i];
	}

	return undefined;
}

/**
 * Check if two hitsizes overlap angle-wise
 * @param a first hitsize
 * @param b second hitsize
 */
export function angleCollides(a: HitSize, b: HitSize): boolean {
	return (
		Math.abs(a.z - b.z) <= gCollideZ &&
		angleDistance(a.a, b.a) < a.width + b.width
	);
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
		Math.abs(a.bot.z - b.bot.z) <= gCollideZ &&
		a.bot.r <= b.top.r &&
		a.top.r >= b.bot.r &&
		angleCollides(a.bot, b.bot)
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

			if (target.isEnemy) game.fire('enemy.died', { attacker, target });
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
 * @param {CoordARZ} x first coord
 * @param {CoordARZ} y second coord
 * @returns {CoordARZ} vector
 */
export function getDirectionVector(x: CoordARZ, y: CoordARZ): CoordARZ {
	const rd = x.r - y.r;
	const ad = x.a - y.a;
	const zd = x.z - y.z;
	const t = Math.abs(rd + ad + zd);
	const r = rd / t;
	const a = ad / t;
	const z = zd / t;

	return { r, a, z };
}

/**
 * Displace a polar coordinate by a list of cartesian coordinates
 * @param {CoordARZ} origin origin
 * @param {CoordXY[]} offsets offset list
 * @param {boolean} flip flip on X axis
 * @returns {CoordARZ} final position
 */
export function displace(
	origin: CoordARZ,
	offsets: CoordXY[] = [],
	flip = false
): CoordARZ {
	const { a, r, z } = origin;
	let x: Pixels = 0,
		y: Pixels = 0;

	offsets.forEach(h => {
		x += h.x * z;
		y += h.y * z;
	});

	if (flip) x = 0 - x;

	return { a: a + scaleWidth(x, r + y, z), r: r + y, z };
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
	let bestScore = -Infinity,
		best: T | null = null;
	objects.forEach(o => {
		const score = scorer(o);
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
export function randomRange(
	min: number,
	max: number,
	rounder: (value: number) => number = Math.floor
): number {
	return rounder(rnd() * (max - min)) + min;
}

/**
 * Return a random angle within a range
 * @param {Radians} min minimum angle
 * @param {Radians} max maximum angle
 * @returns {Radians}
 */
export function randomAngle(min: Radians = 0, max: Radians = π2) {
	return wrapAngle(randomRange(min, max, n => n));
}

/**
 * Return a percentage chance checker
 * @param {number} percentage chance for event to occur
 * @returns {() => boolean}
 */
export const chance = (percentage: number) => () =>
	randomRange(0, 100) < percentage;

/**
 * Add up a list of numbers.
 * @param {T[]} items list of numbers
 * @param {T} start number to start from
 * @returns {T}
 */
export function sum<T extends number>(items: T[], start: T = 0 as T): T {
	return items.reduce((a, b) => a + b, start) as T;
}

/**
 * Randomly picks from a weighted list.
 * @param {[T, number][]} weightings list of weightings
 * @returns {T}
 */
export function randomWeighted<T>(...weightings: [T, number][]): T {
	const total = sum(weightings.map(([, weight]) => weight));
	const roll = randomRange(0, total);
	let accumulator = 0;
	for (const [choice, weight] of weightings) {
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
export function lerp(a: number, b: number, f = 0.03): number {
	return a * (1 - f) + b * f;
}

/**
 * Randomly choose from a list.
 * @param {T[]} a choice list
 * @returns {T}
 */
export function randomItem<T>(a: T[]): T {
	return a[randomRange(0, a.length)];
}

/**
 * Draw a ...wedge?
 * @param {CanvasRenderingContext2D} c canvas context
 * @param {string | CanvasGradient | CanvasPattern} style line style
 * @param {Pixels} x center x
 * @param {Pixels} y center y
 * @param {HitSize} b bottom hitsize
 * @param {HitSize} t top hitsize
 */
export function drawWedge(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: Pixels,
	y: Pixels,
	b: HitSize,
	t: HitSize
) {
	if (b.r < 0 || t.r < 0) return;

	c.strokeStyle = style;
	c.beginPath();
	c.arc(x, y, b.r, b.a - b.width, b.a + b.width);
	c.arc(x, y, t.r, t.a + t.width, t.a - t.width, true);
	c.arc(x, y, b.r, b.a - b.width, b.a + b.width);
	c.stroke();
}

/**
 * Fill a ...wedge?
 * @param {CanvasRenderingContext2D} c canvas context
 * @param {string | CanvasGradient | CanvasPattern} style fill style
 * @param {Pixels} x center x
 * @param {Pixels} y center y
 * @param {HitSize} b bottom hitsize
 * @param {HitSize} t top hitsize
 */
export function fillWedge(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: Pixels,
	y: Pixels,
	b: HitSize,
	t: HitSize
) {
	c.fillStyle = style;
	c.beginPath();
	c.arc(x, y, b.r, b.a - b.width, b.a + b.width);
	c.arc(x, y, t.r, t.a + t.width, t.a - t.width, true);
	c.fill();
}

/**
 * Draw an arc
 * @param {CanvasRenderingContext2D} c canvas context
 * @param {string | CanvasGradient | CanvasPattern} style line style
 * @param {Pixels} x center x
 * @param {Pixels} y center y
 * @param {Pixels} r radius
 * @param {Radians} a angle
 * @param {Radians} width width
 */
export function drawArc(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: Pixels,
	y: Pixels,
	r: Pixels,
	a: Radians,
	width: Radians
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
 * @param {Pixels} x center x
 * @param {Pixels} y center y
 * @param {Pixels} size cross size
 */
export function drawCross(
	c: CanvasRenderingContext2D,
	style: string | CanvasGradient | CanvasPattern,
	x: Pixels,
	y: Pixels,
	size: Pixels = 4
) {
	c.strokeStyle = style;
	c.beginPath();
	c.moveTo(x - size, y - size);
	c.lineTo(x + size, y + size);
	c.moveTo(x + size, y - size);
	c.lineTo(x - size, y + size);
	c.stroke();
}

export function compareDrawnComponent(a: DrawnComponent, b: DrawnComponent) {
	if (a.layer !== b.layer) return a.layer - b.layer;

	const az = 'z' in a ? (a.z as Multiplier) : gFrontZ;
	const bz = 'z' in b ? (b.z as Multiplier) : gFrontZ;
	return bz - az;
}
