declare module 'delaunay-fast' {
	type Point = [number, number];
	type Triangle = [Point, Point, Point];

	interface Delaunay {
		/**
		 * Determine whether a point is inside a given triangle.
		 * @param {Triangle} tri triangle
		 * @param {Point} p point
		 */
		contains(tri: Triangle, p: Point): boolean;

		/**
		 * Compute Delaunay triangulation of set of points.
		 * @param {Point[]} vertices list of points
		 */
		triangulate(vertices: Point[]): number[];
	}

	let Impl: Delaunay;
	export default Impl;
}
