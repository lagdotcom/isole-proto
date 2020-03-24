import EditorData from '../../EditorData';

const rw5: EditorData = {
	platforms: [
		{
			h: 320,
			a: 90,
			w: 60,
			th: 32,
			motion: 0,
			material: 'gsolid',
			ceiling: true,
			walls: true,
		},
		{
			h: 320,
			a: 340,
			w: 60,
			th: 32,
			motion: 0,
			material: 'gsolid',
			ceiling: true,
			walls: true,
		},
		{
			h: 320,
			a: 200,
			w: 60,
			th: 32,
			motion: 0,
			material: 'gsolid',
			walls: true,
			ceiling: true,
		},
	],
	floors: [{ h: 120, a: 0, w: 360, material: 'gsolid' }],
	player: {
		type: 'jacques',
		a: 270,
		r: 120,
		item: 'rock',
		weapon: 'axe',
	},
	enemies: [
		{ type: 'bat', a: 180, r: 240, dir: 'L' },
		{ type: 'bat', a: 0, r: 240, dir: 'L' },
	],
};
export default rw5;
