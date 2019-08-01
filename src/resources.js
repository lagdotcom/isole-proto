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
	game.require('player.woody', woodyImg);
	game.require('tile.grass', grassImg);
	game.require('tile.bluegrass', bluegrassImg);
	game.require('ui.icons', iconsImg);

	addMaterials(game, [grassMaterials, bluegrassMaterials]);
	addObjects(game, [bluegrassObjects]);
}
