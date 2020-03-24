import EditorData from '../../EditorData';

const rw2: EditorData = {
	platforms: [
		{
			h: 200,
			a: 45,
			w: 32,
			th: 32,
			motion: -2,
			material: 'gthin',
		},
		{
			h: 200,
			a: 225,
			w: 32,
			th: 32,
			motion: -2,
			material: 'gthin',
		},
		{
			h: 200,
			a: 135,
			w: 32,
			th: 32,
			motion: -2,
			material: 'gthin',
		},
		{
			h: 200,
			a: 315,
			w: 32,
			th: 32,
			motion: -2,
			material: 'gthin',
		},
	],
	floors: [{ h: 96, a: 0, w: 360, material: 'gsolid' }],
	player: {
		type: 'jacques',
		a: 135,
		r: 200,
		item: 'rock',
		weapon: 'axe',
	},
	enemies: [
		{ type: 'krillna', a: 0, r: 96, dir: 'R' },
		{ type: 'krillna', a: 180, r: 96, dir: 'R' },
		{ type: 'krillna', a: 90, r: 96, dir: 'R' },
		{ type: 'krillna', a: 270, r: 96, dir: 'R' },
	],
};
export default rw2;
