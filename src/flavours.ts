// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
	_type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type AnimEvent = Flavour<string, 'AnimEvent'>;
export type AnimName = Flavour<string, 'AnimName'>;
export type Degrees = Flavour<number, 'Degrees'>;
export type KeyCode = Flavour<string, 'KeyCode'>;
export type MaterialName = Flavour<string, 'MaterialName'>;
export type ObjectName = Flavour<string, 'ObjectName'>;
export type PadCode = Flavour<string, 'PadCode'>;
export type Pixels = Flavour<number, 'Pixels'>;
export type Radians = Flavour<number, 'Radians'>;
export type ResourceName = Flavour<string, 'ResourceName'>;
export type TextureName = Flavour<string, 'TextureName'>;
export type TileName = Flavour<string, 'TileName'>;
export type UrlString = Flavour<string, 'UrlString'>;
