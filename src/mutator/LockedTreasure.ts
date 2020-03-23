import { Mutator, GameState } from '../Cartographer';
import MapNode, { NodeType } from '../MapNode';
import { chance, rndweight, choose } from '../tools';
import { sever } from './tools';

const MoreTreasureChance = 5;

export default class LockedTreasure implements Mutator {
	applies(gs: GameState) {
		return true;
	}

	moretreasure(gs: GameState) {
		// TODO
		return chance(MoreTreasureChance)();
	}

	locktype(gs: GameState) {
		return rndweight(
			[NodeType.SilverLock, 12],
			[NodeType.GoldLock, 3 + gs.floor],
			[NodeType.SilverHeartLock, 1 + gs.floor],
			[NodeType.GoldHeartLock, 0 + gs.floor]
		);
	}

	treasuretype(gs: GameState, t: NodeType) {
		return rndweight(
			[NodeType.SilverChest, 12],
			[NodeType.GoldChest, 4],
			[NodeType.HornedSkull, 2]
		);
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

		const lock = choose(candidates);
		lock.type = this.locktype(gs);

		const trea = nodes[lock.connections[0]];
		// TODO: remove when not testing
		//trea.hidden = true;
		trea.type = this.treasuretype(gs, lock.type);

		sever(nodes, trea.id, lock.id);

		if (this.moretreasure(gs)) this.run(nodes, stages, gs);
		return true;
	}
}
