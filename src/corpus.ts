import AxeWeapon from './weapon/Axe';
import Bat from './enemy/Bat';
import BombItem from './item/Bomb';
import Booster from './enemy/Booster';
import Buster from './enemy/Buster';
import ChompChamp from './enemy/ChompChamp';
import Flazza from './enemy/Flazza';
import Jacques from './player/Jacques';
import Krillna from './enemy/Krillna';
import Minatoad from './enemy/Minatoad';
import RockItem from './item/Rock';
import Woody from './player/Woody';

export const enemyTypes = {
	bat: Bat,
	booster: Booster,
	buster: Buster,
	chompChamp: ChompChamp,
	krillna: Krillna,
	flazza: Flazza,
	minatoad: Minatoad,
};
export const enemyNames = Object.keys(enemyTypes);

export const itemTypes = { bomb: BombItem, rock: RockItem };
export const itemNames = ['', ...Object.keys(itemTypes)];

export const playerTypes = { jacques: Jacques, woody: Woody };
export const playerNames = Object.keys(playerTypes);

export const weaponTypes = { axe: AxeWeapon };
export const weaponNames = ['', ...Object.keys(weaponTypes)];
