import Texture from './Texture';

export default interface Material {
	spawner(parent: any): void;
	texture: Texture;
}
