import EditorData from '../../EditorData';

const rw1: EditorData = {
	platforms: [
		{
			h: 288,
			a: 270,
			w: 32,
			th: 32,
			motion: 0,
			material: 'gthin',
		},
		{
			h: 288,
			a: 180,
			w: 32,
			th: 32,
			motion: 0,
			material: 'gthin',
		},
		{
			h: 288,
			a: 0,
			w: 32,
			th: 32,
			motion: 0,
			material: 'gthin',
		},
		{
			h: 288,
			a: 90,
			w: 32,
			th: 32,
			motion: 0,
			material: 'gthin',
		},
	],
	floors: [{ h: 96, a: 0, w: 360, material: 'gsolid' }],
	player: {
		type: 'woody',
		a: 270,
		r: 288,
		item: 'rock',
		weapon: 'greenBalls',
	},
	enemies: [
		{ type: 'buster', a: 0, r: 288, dir: 'L' },
		{ type: 'buster', a: 180, r: 288, dir: 'L' },
		{ type: 'buster', a: 90, r: 288, dir: 'L' },
	],
};
export default rw1;
