import { Milliseconds } from '../../flavours';

export default interface PlayerAttack {
	update(time: Milliseconds, firing: boolean): void;
}
