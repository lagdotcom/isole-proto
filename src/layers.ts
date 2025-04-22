import { DisplayLayer } from './flavours';

export const zBackground: DisplayLayer = 0,
	zBackground1: DisplayLayer = 1,
	zBackground2: DisplayLayer = 2,
	zBackground3: DisplayLayer = 3,
	zBackground4: DisplayLayer = 4,
	zStructure: DisplayLayer = 11,
	zEnemy: DisplayLayer = 12,
	zPlayer: DisplayLayer = 13,
	zDecal: DisplayLayer = 14,
	zFlying: DisplayLayer = 15,
	zSpark: DisplayLayer = 16,
	zUI: DisplayLayer = 100,
	zBeforeUI: DisplayLayer = zUI - 1,
	zFirst: DisplayLayer = -1;

export default {
	Bg0: zBackground,
	Bg1: zBackground1,
	Bg2: zBackground2,
	Bg3: zBackground3,
	Bg4: zBackground4,
	Structure: zStructure,
	Enemy: zEnemy,
	Player: zPlayer,
	Decal: zDecal,
	Flying: zFlying,
	Spark: zSpark,
	UI: zUI,
};
