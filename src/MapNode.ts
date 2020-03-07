export default interface MapNode {
	id: number;
	connections: number[];
	locked?: boolean;
	stage: number;
	visited?: boolean;
	x: number;
	y: number;
}
