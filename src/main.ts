import './isole.css';

import Editor from './Editor';
import Game from './Game';
import mel from './makeElement';

let options: HTMLElement;

let G: Game;

/**
 * Create a checkbox
 * @param {string} text label text
 * @param {boolean} checked already checked?
 * @param {EventListener} change change event handler
 * @returns {HTMLInputElement} check box
 */
function addCheckbox(
	text: string,
	checked: boolean,
	change: EventListener
): HTMLInputElement {
	return mel(
		mel(options, 'label', { innerText: text }),
		'input',
		{ type: 'checkbox', checked },
		{ change }
	) as HTMLInputElement;
}

window.addEventListener('load', () => {
	const layout = mel(document.body, 'div', { className: 'layout' });
	const extras = mel(layout, 'div', { className: 'extras' });
	options = mel(extras, 'div', { className: 'options' });
	const debug = mel(extras, 'div', { className: 'debug-container' });

	G = new Game({
		parent: layout,
		width: 1280,
		height: 720,
		smoothing: true,
		showDebug: true,
		debugContainer: debug,
		showFps: true,
		showHitboxes: true,
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).G = G;

	const editor = new Editor({ parent: layout, game: G });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).E = editor;

	addCheckbox('Show FPS', G.options.showFps ?? false, e => {
		G.options.showFps = (e.target as HTMLInputElement).checked;
	});
	addCheckbox('Show hitboxes', G.options.showHitboxes ?? false, e => {
		G.options.showHitboxes = (e.target as HTMLInputElement).checked;
	});
	addCheckbox('Smoothing', G.context.imageSmoothingEnabled, e => {
		G.options.smoothing = (e.target as HTMLInputElement).checked;
		G.context.imageSmoothingEnabled = G.options.smoothing;
	});

	G.start();
});
