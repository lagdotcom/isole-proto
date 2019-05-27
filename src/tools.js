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
