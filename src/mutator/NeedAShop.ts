import { Mutator, GameState } from '../Cartographer';
import MapNode, { NodeType } from '../MapNode';
import { choose } from '../tools';

export default class NeedAShop implements Mutator {
	applies(gs: GameState) {
		return true;
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
		// TODO: this shuld cause a bigger error
		if (!candidates.length) return false;

		const shop = choose(candidates);
		shop.type = NodeType.MoneySack;
		return true;
	}
}
