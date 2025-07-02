import Bat from './enemy/Bat';
import Booster from './enemy/Booster';
import Buster from './enemy/Buster';
import ChompChamp from './enemy/ChompChamp';
import Flazza from './enemy/Flazza';
import Frogaboar from './enemy/Frogaboar';
import Krillna from './enemy/Krillna';
import BombItem from './item/Bomb';
import RockItem from './item/Rock';
import GreenBalls from './player/attack/GreenBalls';
import Jacques from './player/Jacques';
import Woody from './player/Woody';

export const enemyTypes = {
	bat: Bat,
	booster: Booster,
	buster: Buster,
	chompChamp: ChompChamp,
	krillna: Krillna,
	flazza: Flazza,
	frogaboar: Frogaboar,
};
export const enemyNames = Object.keys(enemyTypes);

export const itemTypes = { bomb: BombItem, rock: RockItem };
export const itemNames = ['', ...Object.keys(itemTypes)];

export const playerTypes = { jacques: Jacques, woody: Woody };
export const playerNames = Object.keys(playerTypes);

export const weaponTypes = { greenBalls: GreenBalls };
export const weaponNames = ['', ...Object.keys(weaponTypes)];
