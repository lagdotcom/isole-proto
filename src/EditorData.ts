import CoordARZ from './CoordARZ';
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

interface Position extends Omit<CoordARZ<Degrees>, 'z'> {
	back?: boolean;
}

export interface EditorEnemy extends Position {
	dir: Facing;
	type: string;
}

export interface EditorFloor {
	back?: boolean;
	a: Degrees;
	h: Pixels;
	material: TextureName; // TODO lol
	motion?: number;
	w: Degrees;
}

export interface EditorObject extends Position {
	object: ObjectName;
}

export interface EditorPlatform {
	back?: boolean;
	h: Pixels;
	w: Degrees;
	a: Degrees;
	th: Pixels;
	motion?: number;
	material: MaterialName;
	ceiling?: boolean;
	walls?: boolean;
}

export interface EditorPlayer extends Position {
	type: string;
	item?: string;
	weapon?: string;
}

export interface EditorWall {
	back?: boolean;
	top: Pixels;
	bottom: Pixels;
	a: Degrees;
	motion?: number;
	dir: 1 | -1;
	material: string;
}

export interface EditorWeapon extends Position {
	weapon: string;
}

export interface EditorItem extends Position {
	item: string;
}
