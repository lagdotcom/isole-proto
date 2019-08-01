import bluegrassImg from '../media/tilesheet_bluegrass.png';
import busterImg from '../media/buster.png';
import flazzaImg from '../media/flazza.png';
import grassImg from '../media/tilesheet_grass.png';
import iconsImg from '../media/icons.png';
import krillnaImg from '../media/krillna.png';
import rockImg from '../media/rock.png';
import woodyImg from '../media/woody.png';

import bluegrassMaterials from './material/bluegrass';
import grassMaterials from './material/grass';

export default function(game) {
	game.require('enemy.buster', busterImg);
	game.require('enemy.flazza', flazzaImg);
	game.require('enemy.krillna', krillnaImg);
	game.require('item.rock', rockImg);
	game.require('player.woody', woodyImg);
	game.require('tile.grass', grassImg);
	game.require('tile.bluegrass', bluegrassImg);
	game.require('ui.icons', iconsImg);

	game.addMaterials([grassMaterials, bluegrassMaterials]);
}
