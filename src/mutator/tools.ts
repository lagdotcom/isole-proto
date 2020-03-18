import MapNode from '../MapNode';

/**
 * Sever connections to a map node
 * @param {MapNode[]} nodes map nodes
 * @param {number} to node ID to break connections to
 * @param {number} except only node ID that is allowed to connect
 */
export function sever(nodes: MapNode[], to: number, except?: number) {
	nodes
		.filter(n => n.id != except && n.connections.includes(to))
		.forEach(n => {
			n.connections = n.connections.filter(c => c != to);
		});
}
