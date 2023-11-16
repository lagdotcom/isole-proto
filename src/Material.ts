import Flat from './component/Flat';
import Texture from './Texture';

export default interface Material {
	spawner(parent: Flat): void;
	texture: Texture;
}
