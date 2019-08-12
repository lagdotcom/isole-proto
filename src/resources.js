import bluegrassImg from '../media/tilesheet_bluegrass.png';
import busterImg from '../media/buster.png';
import flazzaImg from '../media/flazza.png';
import grassImg from '../media/tilesheet_grass.png';
import iconsImg from '../media/icons.png';
import krillnaImg from '../media/krillna.png';
import rockImg from '../media/rock.png';
import axeImg from '../media/wp_axe.png';
import woodyImg from '../media/woody.png';
import rwbgtreeImg from '../media/tilesheet_rwbgtree.png';
import rwbgrocksImg from '../media/tilesheet_rwbgrocks.png';
import rwfartreesImg from '../media/tilesheet_rwfartrees.png';
import rwbgcanopyImg from '../media/tilesheet_rwbgcanopy.png';

import bluegrassMaterials from './material/bluegrass';
import grassMaterials from './material/grass';

import bluegrassObjects from './object/bluegrass';

function addMaterials(game, materials) {
	materials.forEach(t => {
		Object.keys(t).forEach(k => {
			game.materials[k] = {
				texture: t[k].texture(game),
				spawner: t[k].spawner || (() => {}),
			};

			game.textures[k] = game.materials[k].texture;
		});
	});
}

function addObjects(game, objects) {
	objects.forEach(t => {
		Object.keys(t).forEach(k => {
			game.objects[k] = t[k](game);
		});
	});
}

export default function(game) {
	game.require('enemy.buster', busterImg);
	game.require('enemy.flazza', flazzaImg);
	game.require('enemy.krillna', krillnaImg);
	game.require('item.rock', rockImg);
	game.require('weapon.axe', axeImg);
	game.require('player.woody', woodyImg);
	game.require('tile.grass', grassImg);
	game.require('tile.bluegrass', bluegrassImg);
	game.require('ui.icons', iconsImg);
	game.require('tile.rwbgtree', rwbgtreeImg);
	game.require('tile.rwbgrocks', rwbgrocksImg);
	game.require('tile.rwfartrees', rwfartreesImg);
	game.require('tile.rwbgcanopy', rwbgcanopyImg);

	addMaterials(game, [grassMaterials, bluegrassMaterials]);
	addObjects(game, [bluegrassObjects]);
}
