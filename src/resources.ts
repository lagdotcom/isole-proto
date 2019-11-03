import iconsImg from '../media/gfx/icons.png';
import jacquesImg from '../media/gfx/jacques.png';
import woodyImg from '../media/gfx/woody.png';

import bluegrassImg from '../media/gfx/tile/bluegrass.png';
import rwbgtreeImg from '../media/gfx/tile/rwbgtree.png';
import rwbgrocksImg from '../media/gfx/tile/rwbgrocks.png';
import rwfartreesImg from '../media/gfx/tile/rwfartrees.png';
import rwbgcanopyImg from '../media/gfx/tile/rwbgcanopy.png';
import grassImg from '../media/gfx/tile/grass.png';

import busterImg from '../media/gfx/mon/buster.png';
import flazzaImg from '../media/gfx/mon/flazza.png';
import krillnaImg from '../media/gfx/mon/krillna.png';
import batImg from '../media/gfx/mon/bat.png';

import bombImg from '../media/gfx/it/bomb.png';
import rockImg from '../media/gfx/it/rock.png';

import axeImg from '../media/gfx/wp/axe.png';

import batPunchSnd from '../media/sfx/bat-punch.wav';
import bonkSnd from '../media/sfx/Head_Bonk.wav';
import bopSnd from '../media/sfx/Enemy_Bop.wav';
import deathSnd from '../media/sfx/Player_Death.wav';
import jumpSnd from '../media/sfx/Jump.wav';
import step1Snd from '../media/sfx/Footstep1_Bubbly.wav';
import step2Snd from '../media/sfx/Footstep2_Bubbly.wav';
import jacquesHurtSnd from '../media/sfx/Player_Hurt_Jacques.wav';
import woodyHurtSnd from '../media/sfx/Player_Hurt_Woody.wav';

import bluegrassMaterials from './material/bluegrass';
import grassMaterials from './material/grass';

import bluegrassObjects from './object/bluegrass';
import Game from './Game';
import Texture from './Texture';
import Controller from './Controller';

interface MaterialMap {
	[name: string]: {
		spawner?(parent: any): void;
		texture(game: Game): Texture;
	};
}

/**
 * Preload materials
 * @param {Game} game game instance
 * @param {MaterialMap[]} materials material list
 */
function addMaterials(game: Game, materials: MaterialMap[]) {
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

interface ObjectMap {
	[name: string]: (game: Game) => Controller;
}

/**
 * Preload objects
 * @param {Game} game game
 * @param {ObjectMap[]} objects object lis
 */
function addObjects(game: Game, objects: ObjectMap[]) {
	objects.forEach(t => {
		Object.keys(t).forEach(k => {
			game.objects[k] = t[k](game);
		});
	});
}

/**
 * Load an image resource
 * @param {string} fn filename
 * @param {(Event) => void} onload callback
 * @returns {HTMLImageElement} image element
 */
function image(fn: string, onload: (e: Event) => void): HTMLImageElement {
	var el = document.createElement('img');
	el.onload = onload;
	el.src = fn;

	return el;
}

const MediaErrors = [
	'',
	'MEDIA_ERR_ABORTED',
	'MEDIA_ERR_NETWORK',
	'MEDIA_ERR_DECODE',
	'MEDIA_ERR_SRC_NOT_SUPPORTED',
];

/**
 * Load an image resource
 * @param {string} fn filename
 * @param {(Event) => void} onload callback
 * @returns {HTMLAudioElement} audio element
 */
function sound(fn: string, onload: (e: Event) => void): HTMLAudioElement {
	var el = new Audio(fn);
	el.oncanplaythrough = onload;
	el.onerror = e => {
		console.log(`could not load ${fn} - ${MediaErrors[el.error!.code]}`);
		onload(e as Event);
	};

	return el;
}

/**
 * Preload resources
 * @param {Game} game game instance
 */
export default function PreloadResources(game: Game) {
	game.require('enemy.bat', image, batImg);
	game.require('enemy.buster', image, busterImg);
	game.require('enemy.flazza', image, flazzaImg);
	game.require('enemy.krillna', image, krillnaImg);
	game.require('item.bomb', image, bombImg);
	game.require('item.rock', image, rockImg);
	game.require('weapon.axe', image, axeImg);
	game.require('player.jacques', image, jacquesImg);
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
	game.require('jacques.hurt', sound, jacquesHurtSnd);
	game.require('woody.hurt', sound, woodyHurtSnd);

	game.require('enemy.bat.punch', sound, batPunchSnd);

	addMaterials(game, [grassMaterials, bluegrassMaterials]);
	addObjects(game, [bluegrassObjects]);
}
