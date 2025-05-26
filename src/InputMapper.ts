import { KeyCode, PadCode } from './flavours';
import {
	jAimDown,
	jAimLeft,
	jAimRight,
	jAimUp,
	jButton1,
	jButton2,
	jButton3,
	jButton4,
	jButton7,
	jButton8,
	jButton13,
	jButton14,
	jButton15,
	jButton16,
	jButtons,
	jDown,
	jLeft,
	jRight,
	jUp,
	kAimBack,
	kAimFront,
	kDown,
	kFreeMoney,
	kJump,
	kLeft,
	kMelee,
	kMenu,
	kRight,
	kShift,
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
	Melee,
	Menu,
	Shift,

	AimBack,
	AimFront,
	AimLeft,
	AimRight,
	AimUp,
	AimDown,
	AimAtMouse,

	FreeMoney,
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
		if (pad.axes.length < 4) {
			console.log(`Cannot use pad ${pad.id} - not enough axes.`);
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

			const { axes, buttons } = pad;

			if (axes[0] < -gPadAxisThreshold) mapper.press(jLeft);
			if (axes[0] > gPadAxisThreshold) mapper.press(jRight);
			if (axes[1] < -gPadAxisThreshold) mapper.press(jUp);
			if (axes[1] > gPadAxisThreshold) mapper.press(jDown);
			if (axes[2] < -gPadAxisThreshold) mapper.press(jAimLeft);
			if (axes[2] > gPadAxisThreshold) mapper.press(jAimRight);
			if (axes[3] < -gPadAxisThreshold) mapper.press(jAimUp);
			if (axes[3] > gPadAxisThreshold) mapper.press(jAimDown);

			for (let i = 0; i < buttons.length; i++)
				if (buttons[i].pressed) mapper.press(jButtons[i]);
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
		this.map(kMelee, InputButton.Melee);
		this.map(kMenu, InputButton.Menu);
		this.map(kShift, InputButton.Shift);
		this.map(kAimBack, InputButton.AimBack);
		this.map(kAimFront, InputButton.AimFront);
		this.map(kFreeMoney, InputButton.FreeMoney);

		this.map(jLeft, InputButton.Left);
		this.map(jUp, InputButton.Up);
		this.map(jRight, InputButton.Right);
		this.map(jDown, InputButton.Down);
		this.map(jAimLeft, InputButton.AimLeft);
		this.map(jAimUp, InputButton.AimUp);
		this.map(jAimRight, InputButton.AimRight);
		this.map(jAimDown, InputButton.AimDown);
		this.map(jButton1, InputButton.Jump);
		this.map(jButton2, InputButton.Melee);
		this.map(jButton3, InputButton.Menu);
		this.map(jButton4, InputButton.Shift);
		this.map(jButton7, InputButton.AimBack);
		this.map(jButton8, InputButton.AimFront);
		this.map(jButton13, InputButton.Up);
		this.map(jButton14, InputButton.Down);
		this.map(jButton15, InputButton.Left);
		this.map(jButton16, InputButton.Right);
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
