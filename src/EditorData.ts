import CoordAR from './CoordAR';
import { Facing } from './dirs';
import {
	Degrees,
	MaterialName,
	ObjectName,
	Pixels,
	TextureName,
} from './flavours';

export default interface EditorData {
	platforms?: EditorPlatform[];
	walls?: EditorWall[];
	floors?: EditorFloor[];
	objects?: EditorObject[];
	player: EditorPlayer;
	enemies?: EditorEnemy[];
	weapons?: EditorWeapon[];
	items?: EditorItem[];
}

export interface EditorEnemy extends CoordAR<Degrees> {
	dir: Facing;
	type: string;
}

export interface EditorFloor {
	a: Degrees;
	h: Pixels;
	material: TextureName; // TODO lol
	motion?: number;
	w: Degrees;
}

export interface EditorObject extends CoordAR<Degrees> {
	object: ObjectName;
}

export interface EditorPlatform {
	h: Pixels;
	w: Degrees;
	a: Degrees;
	th: number;
	motion?: number;
	material: MaterialName;
	ceiling?: boolean;
	walls?: boolean;
}

export interface EditorPlayer extends CoordAR<Degrees> {
	type: string;
	item?: string;
	weapon?: string;
}

export interface EditorWall {
	top: Pixels;
	bottom: Pixels;
	a: Degrees;
	motion?: number;
	dir: 1 | -1;
	material: string;
}

export interface EditorWeapon extends CoordAR<Degrees> {
	weapon: string;
}

export interface EditorItem extends CoordAR<Degrees> {
	item: string;
}
