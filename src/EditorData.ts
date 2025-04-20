import CoordAR from './CoordAR';
import { Facing } from './dirs';
import { MaterialName, ObjectName, TextureName } from './flavours';

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

export interface EditorEnemy extends CoordAR {
	dir: Facing;
	type: string;
}

export interface EditorFloor {
	a: number;
	h: number;
	material: TextureName; // TODO lol
	motion?: number;
	w: number;
}

export interface EditorObject extends CoordAR {
	object: ObjectName;
}

export interface EditorPlatform {
	h: number;
	w: number;
	a: number;
	th: number;
	motion?: number;
	material: MaterialName;
	ceiling?: boolean;
	walls?: boolean;
}

export interface EditorPlayer extends CoordAR {
	type: string;
	item?: string;
	weapon?: string;
}

export interface EditorWall {
	top: number;
	bottom: number;
	a: number;
	motion?: number;
	dir: 1 | -1;
	material: string;
}

export interface EditorWeapon extends CoordAR {
	weapon: string;
}

export interface EditorItem extends CoordAR {
	item: string;
}
