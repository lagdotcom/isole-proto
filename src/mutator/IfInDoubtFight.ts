import { GameState, Mutator } from '../Cartographer';
import MapNode, { NodeType } from '../MapNode';
import { chance } from '../tools';

const BaseHardFightChance = 15,
	AddHardFightChance = 10;

export default class IfInDoubtFight implements Mutator {
	applies() {
		return true;
	}

	run(nodes: MapNode[], stages: number, gs: GameState) {
		const hard = chance(
			BaseHardFightChance + gs.floor * AddHardFightChance
		);

		nodes.forEach(n => {
			if (n.type === NodeType.Indeterminate)
				n.type =
					n.stage > 0 && hard()
						? NodeType.ThreeSkulls
						: NodeType.Skull;
		});

		return true;
	}
}
