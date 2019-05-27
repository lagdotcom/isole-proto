import Game from './Game';

var controls, G;

function addCheckbox(text, checked, onchange) {
	var label = document.createElement('label');
	label.innerText = text;
	var input = document.createElement('input');
	input.type = 'checkbox';
	input.checked = checked;
	input.onchange = onchange;

	label.appendChild(input);
	controls.appendChild(label);
}

window.addEventListener('load', () => {
	G = new Game({
		width: 1024,
		height: 768,
		scale: 1,
		showDebug: true,
		showFps: true,
		showHitboxes: true,
	});
	window.G = G;

	controls = document.createElement('div');
	addCheckbox('Show FPS', G.options.showFps, e => {
		G.options.showFps = e.target.checked;
	});
	addCheckbox('Show hitboxes', G.options.showHitboxes, e => {
		G.options.showHitboxes = e.target.checked;
	});

	document.body.appendChild(controls);

	G.start();
});

window.addEventListener('keydown', e => {
	if (G) G.press(e.code);
});

window.addEventListener('keyup', e => {
	if (G) G.release(e.code);
});

window.addEventListener('gamepadconnected', e => {
	G.addPad(e.gamepad);
});

window.addEventListener('gamepaddisconnected', e => {
	G.removePad(e.gamepad);
});
