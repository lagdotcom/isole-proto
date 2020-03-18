import { Mutator, GameState } from '../Cartographer';
import MapNode, { NodeType } from '../MapNode';
import { rndr, chance } from '../tools';
import { sever } from './tools';

const MoreTreasureChance = 5,
	isHiddenTreasure = chance(20);

export default class LockedTreasure implements Mutator {
	applies(gs: GameState) {
		return true;
	}

	moretreasure(gs: GameState) {
		// TODO
		return chance(MoreTreasureChance)();
	}

	locktype(gs: GameState) {
		// TODO
		return NodeType.SilverLock;
	}

	treasuretype(gs: GameState, t: NodeType) {
		// TODO
		return NodeType.SilverChest;
	}

	run(nodes: MapNode[], stages: number, gs: GameState) {
		const after = 1;
		const before = stages - 2;

		const candidates = nodes.filter(
			n =>
				n.stage > after &&
				n.stage < before &&
				n.type === NodeType.Indeterminate &&
				n.connections.length == 1
		);
		if (!candidates.length) return false;

		const lock = candidates[rndr(0, candidates.length)];
		lock.type = this.locktype(gs);

		const trea = nodes[lock.connections[0]];
		trea.type = this.treasuretype(gs, lock.type);
		trea.hidden = isHiddenTreasure();

		sever(nodes, trea.id, lock.id);

		if (this.moretreasure(gs)) this.run(nodes, stages, gs);
		return true;
	}
}
