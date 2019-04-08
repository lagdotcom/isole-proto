import Game from './Game';

var G;

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

	G.start();
});

window.addEventListener('keydown', e => {
	if (G) G.press(e.code);
});

window.addEventListener('keyup', e => {
	if (G) G.release(e.code);
});
