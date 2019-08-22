import bluegrassImg from '../media/gfx/tile/bluegrass.png';
import busterImg from '../media/gfx/mon/buster.png';
import flazzaImg from '../media/gfx/mon/flazza.png';
import grassImg from '../media/gfx/tile/grass.png';
import iconsImg from '../media/gfx/icons.png';
import krillnaImg from '../media/gfx/mon/krillna.png';
import rockImg from '../media/gfx/it/rock.png';
import axeImg from '../media/gfx/wp/axe.png';
import woodyImg from '../media/gfx/woody.png';
import rwbgtreeImg from '../media/gfx/tile/rwbgtree.png';
import rwbgrocksImg from '../media/gfx/tile/rwbgrocks.png';
import rwfartreesImg from '../media/gfx/tile/rwfartrees.png';
import rwbgcanopyImg from '../media/gfx/tile/rwbgcanopy.png';
import batImg from '../media/gfx/mon/bat.png';

import bonkSnd from '../media/sfx/Head_Bonk.wav';
import bopSnd from '../media/sfx/Enemy_Bop.wav';
import deathSnd from '../media/sfx/Player_Death.wav';
import jumpSnd from '../media/sfx/Jump.wav';
import step1Snd from '../media/sfx/Footstep1_Bubbly.wav';
import step2Snd from '../media/sfx/Footstep2_Bubbly.wav';
import woodyHurtSnd from '../media/sfx/Player_Hurt_Woody.wav';

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

function image(fn, onload) {
	var el = document.createElement('img');
	el.onload = onload;
	el.src = fn;

	return el;
}

function sound(fn, onload) {
	var el = new Audio(fn);
	el.oncanplaythrough = onload;

	return el;
}

export default function(game) {
	game.require('enemy.bat', image, batImg);
	game.require('enemy.buster', image, busterImg);
	game.require('enemy.flazza', image, flazzaImg);
	game.require('enemy.krillna', image, krillnaImg);
	game.require('item.rock', image, rockImg);
	game.require('weapon.axe', image, axeImg);
	game.require('player.woody', image, woodyImg);
	game.require('tile.grass', image, grassImg);
	game.require('tile.bluegrass', image, bluegrassImg);
	game.require('ui.icons', image, iconsImg);
	game.require('tile.rwbgtree', image, rwbgtreeImg);
	game.require('tile.rwbgrocks', image, rwbgrocksImg);
	game.require('tile.rwfartrees', image, rwfartreesImg);
	game.require('tile.rwbgcanopy', image, rwbgcanopyImg);

	game.require('player.bonk', sound, bonkSnd);
	game.require('player.bop', sound, bopSnd);
	game.require('player.dead', sound, deathSnd);
	game.require('player.jump', sound, jumpSnd);
	game.require('player.step1', sound, step1Snd);
	game.require('player.step2', sound, step2Snd);
	game.require('woody.hurt', sound, woodyHurtSnd);

	addMaterials(game, [grassMaterials, bluegrassMaterials]);
	addObjects(game, [bluegrassObjects]);
}
