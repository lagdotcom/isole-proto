// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
	_type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type AnimEvent = Flavour<string, 'AnimEvent'>;
export type AnimName = Flavour<string, 'AnimName'>;
export type AnimPriority = Flavour<number, 'AnimPriority'>;
export type Degrees = Flavour<number, 'Degrees'>;
export type DisplayLayer = Flavour<number, 'DisplayLayer'>;
export type FrameIndex = Flavour<number, 'FrameIndex'>;
export type GameEvent = Flavour<string, 'GameEvent'>;
export type KeyCode = Flavour<string, 'KeyCode'>;
export type MaterialName = Flavour<string, 'MaterialName'>;
export type Milliseconds = Flavour<number, 'Milliseconds'>;
export type Multiplier = Flavour<number, 'Multiplier'>;
export type ObjectName = Flavour<string, 'ObjectName'>;
export type PadCode = Flavour<string, 'PadCode'>;
export type Pixels = Flavour<number, 'Pixels'>;
export type Radians = Flavour<number, 'Radians'>;
export type ResourceName = Flavour<string, 'ResourceName'>;
export type ScaledTime = Flavour<number, 'ScaledTime'>;
export type SpriteColumn = Flavour<number, 'SpriteColumn'>;
export type SpriteRow = Flavour<number, 'SpriteRow'>;
export type TextureName = Flavour<string, 'TextureName'>;
export type TileName = Flavour<string, 'TileName'>;
export type UrlString = Flavour<string, 'UrlString'>;
