import Delaunay from 'delaunay-fast';

import { Pixels } from './flavours';
import MapNode, { NodeType } from './MapNode';
import IfInDoubtFight from './mutator/IfInDoubtFight';
import LockedTreasure from './mutator/LockedTreasure';
import NeedAShop from './mutator/NeedAShop';
import { randomRange } from './tools';

const stageCount = [10, 12, 14];
const stageGap: Pixels[] = [120, 100, 85];
const offsets: Pixels[][] = [[0], [-60, 60], [-100, 0, 100]];

const maxwiggle: Pixels = 20;
const wiggle = (): Pixels => randomRange(-maxwiggle, maxwiggle);

export interface GameState {
	floor: number;
}

export interface Mutator {
	applies(gs: GameState): boolean;
	run(nodes: MapNode[], stages: number, gs: GameState): boolean;
}

export default class Cartographer {
	mutators: Mutator[];

	constructor() {
		this.mutators = [
			new NeedAShop(),
			new LockedTreasure(),
			new IfInDoubtFight(),
		];
	}

	gen(gs: GameState) {
		const nodes: MapNode[] = [];
		const stages = stageCount[gs.floor];
		const gap = stageGap[gs.floor];

		for (let stage = 0; stage < stages; stage++) {
			const first = stage === 0;
			const last = stage === stages - 1;
			const size = first ? 1 : last ? 1 : randomRange(2, 4);
			const yo = offsets[size - 1];

			for (let i = 0; i < size; i++) {
				nodes.push({
					id: nodes.length,
					connections: [],
					stage,
					type: last ? NodeType.Boss : NodeType.Indeterminate,
					x: wiggle() + stage * gap,
					y: wiggle() + yo[i],
				});
			}
		}

		const tris = Delaunay.triangulate(nodes.map(n => [n.x, n.y]));
		for (let i = 0; i < tris.length; i += 3) {
			const indices = [tris[i], tris[i + 1], tris[i + 2]];
			const set = indices.map(x => nodes[x]);

			set.forEach(n => {
				set.forEach(o => {
					if (
						n.stage === o.stage - 1 &&
						!n.connections.includes(o.id)
					)
						n.connections.push(o.id);
				});

				n.connections.sort();
			});
		}

		this.mutators.forEach(m => {
			if (m.applies(gs)) m.run(nodes, stages, gs);
		});

		return nodes;
	}
}
