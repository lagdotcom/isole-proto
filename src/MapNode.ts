export default interface MapNode {
	id: number;
	connections: number[];
	locked: boolean;
	stage: number;
	x: number;
	y: number;
}
