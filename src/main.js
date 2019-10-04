import './isole.css';

import Editor from './Editor';
import Game from './Game';
import mel from './makeElement';

var options;

/** @var {Game} */
var G;

/**
 * Create a checkbox
 * @param {string} text label text
 * @param {boolean} checked already checked?
 * @param {(Event) => void} change change event handler
 * @returns {HTMLInputElement} check box
 */
function addCheckbox(text, checked, change) {
	return mel(
		mel(options, 'label', { innerText: text }),
		'input',
		{ type: 'checkbox', checked },
		{ change }
	);
}

window.addEventListener('load', () => {
	const layout = mel(document.body, 'div', { className: 'layout' });
	const extras = mel(layout, 'div', { className: 'extras' });
	options = mel(extras, 'div', { className: 'options' });
	const debug = mel(extras, 'div');

	G = new Game({
		parent: layout,
		width: 1024,
		height: 768,
		scale: 1,
		smoothing: true,
		showDebug: true,
		debugContainer: debug,
		showFps: true,
		showHitboxes: true,
	});
	window.G = G;

	const editor = new Editor({ parent: layout, game: G });
	window.E = editor;

	addCheckbox('Show FPS', G.options.showFps, e => {
		G.options.showFps = e.target.checked;
	});
	addCheckbox('Show hitboxes', G.options.showHitboxes, e => {
		G.options.showHitboxes = e.target.checked;
	});
	addCheckbox('Smoothing', G.context.imageSmoothingEnabled, e => {
		G.options.smoothing = e.target.checked;
		G.context.imageSmoothingEnabled = G.options.smoothing;
	});

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
