import './isole.css';

import Editor from './Editor';
import Game from './Game';
import mel from './makeElement';

var extras, G;

function addCheckbox(text, checked, change) {
	mel(
		mel(extras, 'label', { innerText: text }),
		'input',
		{ type: 'checkbox', checked },
		{ change }
	);
}

window.addEventListener('load', () => {
	const layout = mel(document.body, 'div', { className: 'layout' });
	extras = mel(layout, 'div', { className: 'extras' });

	G = new Game({
		parent: layout,
		width: 1024,
		height: 768,
		scale: 1,
		smoothing: false,
		showDebug: true,
		debugContainer: extras,
		showFps: true,
		showHitboxes: false,
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
