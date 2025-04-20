import iconsImg from '../media/gfx/icons.png';
import bombImg from '../media/gfx/it/bomb.png';
import rockImg from '../media/gfx/it/rock.png';
import jacquesImg from '../media/gfx/jacques.png';
import mapBossImg from '../media/gfx/mapboss.png';
import mapIconsImg from '../media/gfx/mapicons.png';
import batImg from '../media/gfx/mon/bat.png';
import boosterImg from '../media/gfx/mon/booster.png';
import busterImg from '../media/gfx/mon/buster.png';
import chompChampImg from '../media/gfx/mon/chompchamp.png';
import flazzaImg from '../media/gfx/mon/flazza.png';
import krillnaImg from '../media/gfx/mon/krillna.png';
import minatoadImg from '../media/gfx/mon/minatoad.png';
import shockwaveImg from '../media/gfx/mon/minatoad.shockwave.png';
import projectileImg from '../media/gfx/projectiles.png';
import reticleImg from '../media/gfx/reticle.png';
import shopBgImg from '../media/gfx/shop.png';
import bluegrassImg from '../media/gfx/tile/bluegrass.png';
import grassImg from '../media/gfx/tile/grass.png';
import greyboxImg from '../media/gfx/tile/greybox.png';
import rwbgcanopyImg from '../media/gfx/tile/rwbgcanopy.png';
import rwbgrocksImg from '../media/gfx/tile/rwbgrocks.png';
import rwbgtreeImg from '../media/gfx/tile/rwbgtree.png';
import rwfartreesImg from '../media/gfx/tile/rwfartrees.png';
import woodyImg from '../media/gfx/woody.png';
import axeImg from '../media/gfx/wp/axe.png';
import batPunchSnd from '../media/sfx/bat-punch.wav';
import bopSnd from '../media/sfx/Enemy_Bop.wav';
import step1Snd from '../media/sfx/Footstep1_Bubbly.wav';
import step2Snd from '../media/sfx/Footstep2_Bubbly.wav';
import bonkSnd from '../media/sfx/Head_Bonk.wav';
import jumpSnd from '../media/sfx/Jump.wav';
import deathSnd from '../media/sfx/Player_Death.wav';
import jacquesHurtSnd from '../media/sfx/Player_Hurt_Jacques.wav';
import woodyHurtSnd from '../media/sfx/Player_Hurt_Woody.wav';
import Controller from './Controller';
import Game from './Game';
import bluegrassMaterials from './material/bluegrass';
import grassMaterials from './material/grass';
import greyboxMaterials from './material/greybox';
import bluegrassObjects from './object/bluegrass';
import Texture from './Texture';

type MaterialMap = Record<
	string,
	{
		spawner?(parent: unknown): void;
		texture(game: Game): Texture;
	}
>;

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

type ObjectMap = Record<string, (game: Game) => Controller>;

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
	const el = document.createElement('img');
	el.addEventListener('load', onload);
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
	const el = new Audio(fn);
	el.addEventListener('canplaythrough', onload);
	el.addEventListener('error', e => {
		console.log(`could not load ${fn} - ${MediaErrors[el.error!.code]}`);
		onload(e as Event);
	});

	return el;
}

/**
 * Preload resources
 * @param {Game} game game instance
 */
export default function PreloadResources(game: Game) {
	game.require('shop.bg', image, shopBgImg);

	game.require('enemy.bat', image, batImg);
	game.require('enemy.booster', image, boosterImg);
	game.require('enemy.buster', image, busterImg);
	game.require('enemy.chompchamp', image, chompChampImg);
	game.require('enemy.flazza', image, flazzaImg);
	game.require('enemy.krillna', image, krillnaImg);
	game.require('enemy.minatoad', image, minatoadImg);
	game.require('enemy.minatoad.shockwave', image, shockwaveImg);
	game.require('item.bomb', image, bombImg);
	game.require('item.rock', image, rockImg);
	game.require('weapon.axe', image, axeImg);
	game.require('reticle', image, reticleImg);
	game.require('projectile', image, projectileImg);
	game.require('player.jacques', image, jacquesImg);
	game.require('player.woody', image, woodyImg);
	game.require('tile.grass', image, grassImg);
	game.require('tile.bluegrass', image, bluegrassImg);
	game.require('tile.greybox', image, greyboxImg);
	game.require('ui.icons', image, iconsImg);
	game.require('ui.mapicons', image, mapIconsImg);
	game.require('ui.mapboss', image, mapBossImg);
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

	addMaterials(game, [grassMaterials, bluegrassMaterials, greyboxMaterials]);
	addObjects(game, [bluegrassObjects]);
}
