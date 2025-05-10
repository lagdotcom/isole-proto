import { KeyCode, PadCode } from './flavours';
import {
	jButton1,
	jButton2,
	jButton3,
	jButton4,
	jButton5,
	jDown,
	jLeft,
	jRight,
	jUp,
	kCycle,
	kDown,
	kFreeMoney,
	kJump,
	kLeap,
	kLeft,
	kRight,
	kSwing,
	kThrow,
	kUp,
} from './keys';
import { gPadAxisThreshold } from './nums';
import { any } from './tools';

export enum InputButton {
	None,
	Left,
	Right,
	Up,
	Down,
	Jump,
	Throw,
	Swing,
	Cycle,
	Pickup,
	FreeMoney,
	Leap,
}

interface InputDevice {
	poll(mapper: InputMapper): void;
}

const preventDefaultKeys = [
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'ArrowDown',
	'Space',
];

export class KeyboardInput implements InputDevice {
	keys: Set<KeyCode>;

	constructor() {
		this.keys = new Set();
		window.addEventListener('keydown', e => {
			this.press(e.code);
			if (preventDefaultKeys.includes(e.code)) e.preventDefault();
		});
		window.addEventListener('keyup', e => this.release(e.code));
	}

	press(k: KeyCode) {
		this.keys.add(k);
	}

	release(k: KeyCode) {
		this.keys.delete(k);
	}

	poll(mapper: InputMapper) {
		this.keys.forEach(k => mapper.press(k));
	}
}

export class GamepadInput implements InputDevice {
	pads: Gamepad[];

	constructor() {
		this.pads = [];
		window.addEventListener('gamepadconnected', (e: GamepadEvent) =>
			this.add(e.gamepad)
		);
		window.addEventListener('gamepaddisconnected', (e: GamepadEvent) =>
			this.remove(e.gamepad)
		);
	}

	add(pad: Gamepad) {
		if (pad.buttons.length < 5) {
			console.log(`Cannot use pad ${pad.id} - not enough buttons.`);
			return;
		}
		console.log(`Added pad ${pad.id}.`);
		this.pads.push(pad);
	}

	remove(pad: Gamepad) {
		if (any(this.pads, p => p.id === pad.id)) {
			console.log(`No longer listening to pad ${pad.id}.`);
			this.pads = this.pads.filter(p => p.id !== pad.id);
		}
	}

	poll(mapper: InputMapper) {
		const pads = navigator.getGamepads();
		this.pads.forEach(p => {
			const pad = pads[p.index];
			if (!pad) return;

			const buttons = pad.buttons;
			const axes = pad.axes;

			if (axes[0] < -gPadAxisThreshold) mapper.press(jLeft);
			if (axes[0] > gPadAxisThreshold) mapper.press(jRight);
			if (axes[1] < -gPadAxisThreshold) mapper.press(jUp);
			if (axes[1] > gPadAxisThreshold) mapper.press(jDown);

			if (buttons[0].pressed) mapper.press(jButton1);
			if (buttons[1].pressed) mapper.press(jButton2);
			if (buttons[2].pressed) mapper.press(jButton3);
			if (buttons[3].pressed) mapper.press(jButton4);
			if (buttons[4].pressed) mapper.press(jButton5);
		});
	}
}

type InputCode = KeyCode | PadCode;

type InputMapping = Record<InputCode, InputButton[]>;
export default class InputMapper {
	devices: InputDevice[];
	mapping: InputMapping;
	pressed: Set<InputButton>;

	constructor() {
		this.devices = [new KeyboardInput(), new GamepadInput()];
		this.mapping = {};
		this.pressed = new Set<InputButton>();
	}

	default() {
		this.map(kLeft, InputButton.Left);
		this.map(kUp, InputButton.Up);
		this.map(kRight, InputButton.Right);
		this.map(kDown, InputButton.Down);
		this.map(kJump, InputButton.Jump);
		this.map(kSwing, InputButton.Swing);
		this.map(kThrow, InputButton.Throw);
		this.map(kCycle, InputButton.Cycle);
		this.map(kLeap, InputButton.Leap);
		this.map(kDown, InputButton.Pickup);
		this.map(kFreeMoney, InputButton.FreeMoney);

		this.map(jLeft, InputButton.Left);
		this.map(jUp, InputButton.Up);
		this.map(jRight, InputButton.Right);
		this.map(jDown, InputButton.Down);
		this.map(jButton1, InputButton.Jump);
		this.map(jButton2, InputButton.Throw);
		this.map(jButton3, InputButton.Swing);
		this.map(jButton4, InputButton.Cycle);
		this.map(jButton5, InputButton.Leap);
		this.map(jDown, InputButton.Pickup);
	}

	load(key = 'InputMapping') {
		if (localStorage[key] !== undefined) {
			const map: InputMapping = JSON.parse(localStorage[key]);
			Object.entries(map).forEach(([key, buttons]) =>
				buttons.map(btn => this.map(key, btn))
			);
		} else this.default();
	}

	save(key = 'InputMapping') {
		localStorage[key] = JSON.stringify(this.mapping);
	}

	map(key: InputCode, btn: InputButton) {
		if (this.mapping[key]) this.mapping[key].push(btn);
		else this.mapping[key] = [btn];
	}

	press(key: InputCode) {
		if (this.mapping[key])
			this.mapping[key].forEach(b => this.pressed.add(b));
	}

	poll(): Set<InputButton> {
		this.pressed.clear();
		this.devices.forEach(dev => dev.poll(this));
		return this.pressed;
	}
}
