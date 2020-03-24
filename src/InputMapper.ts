import { any } from './tools';
import { gPadAxisThreshold } from './nums';
import {
	jLeft,
	jRight,
	jUp,
	jDown,
	jButton1,
	jButton2,
	jButton3,
	jButton4,
	kLeft,
	kUp,
	kRight,
	kDown,
	kJump,
	kSwing,
	kThrow,
	kCycle,
} from './keys';

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
}

interface InputDevice {
	poll(mapper: InputMapper): void;
}

export class KeyboardInput implements InputDevice {
	keys: Set<string>;

	constructor() {
		this.keys = new Set<string>();
		window.addEventListener('keydown', e => this.press(e.code));
		window.addEventListener('keyup', e => this.release(e.code));
	}

	press(k: string) {
		this.keys.add(k);
	}

	release(k: string) {
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
		if (pad.buttons.length < 4) {
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
		});
	}
}

type InputMapping = { [name: string]: InputButton[] };
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
		this.map(kDown, InputButton.Pickup);

		this.map(jLeft, InputButton.Left);
		this.map(jUp, InputButton.Up);
		this.map(jRight, InputButton.Right);
		this.map(jDown, InputButton.Down);
		this.map(jButton1, InputButton.Jump);
		this.map(jButton2, InputButton.Throw);
		this.map(jButton3, InputButton.Swing);
		this.map(jButton4, InputButton.Cycle);
		this.map(jDown, InputButton.Pickup);
	}

	load(key: string = 'InputMapping') {
		if (localStorage[key] !== undefined) {
			const map: InputMapping = JSON.parse(localStorage[key]);
			Object.entries(map).forEach(([key, buttons]) =>
				buttons.map(btn => this.map(key, btn))
			);
		} else this.default();
	}

	save(key: string = 'InputMapping') {
		localStorage[key] = JSON.stringify(this.mapping);
	}

	map(key: string, btn: InputButton) {
		if (this.mapping[key]) this.mapping[key].push(btn);
		else this.mapping[key] = [btn];
	}

	press(key: string) {
		if (this.mapping[key])
			this.mapping[key].forEach(b => this.pressed.add(b));
	}

	poll(): Set<InputButton> {
		this.pressed.clear();
		this.devices.forEach(dev => dev.poll(this));
		return this.pressed;
	}
}
