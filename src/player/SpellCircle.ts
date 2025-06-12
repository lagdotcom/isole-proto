import AnimController from '../AnimController';
import DrawnComponent from '../DrawnComponent';
import { DisplayLayer, Milliseconds, Radians, ResourceName } from '../flavours';
import Game from '../Game';
import { zBeforeUI } from '../layers';
import { draw3D } from '../rendering';
import { displace } from '../tools';

const gRotationSpeed: Radians = 0.001;

class SpellCirclePart extends AnimController {
	constructor(game: Game, img: ResourceName) {
		super({
			img: game.resources[img],
			animations: {
				idle: {
					loop: true,
					frames: [
						{ c: 0, r: 0, t: 75 },
						{ c: 0, r: 1, t: 75 },
						{ c: 0, r: 2, t: 75 },
						{ c: 0, r: 3, t: 75 },
					],
				},
			},
			w: 158,
			h: 158,
			xo: -79,
			yo: -79,
		});

		this.play('idle');
	}

	update(t: Milliseconds) {
		this.next(t);
	}
}

export default class SpellCircle implements DrawnComponent {
	layer: DisplayLayer;
	visible: boolean;
	rotation: Radians;
	flip: boolean;

	constructor(
		public game: Game,
		public part1 = new SpellCirclePart(game, 'player.spell.1'),
		public part2 = new SpellCirclePart(game, 'player.spell.2'),
		public part3 = new SpellCirclePart(game, 'player.spell.3'),
		public part4 = new SpellCirclePart(game, 'player.spell.4')
	) {
		this.layer = zBeforeUI;
		this.visible = false;
		this.rotation = 0;
		this.flip = false;
	}

	update(time: Milliseconds) {
		this.part1.update(time);
		this.part2.update(time);
		this.part3.update(time);
		this.part4.update(time);

		this.rotation += time * gRotationSpeed;
	}

	useAim(visible: boolean, facing: 1 | -1) {
		this.visible = visible;
		this.flip = facing === -1;
	}

	draw(context: CanvasRenderingContext2D) {
		if (!this.visible) return;

		const { game, part1, part2, part3, part4, rotation, flip } = this;

		const pos = displace(game.player, [game.player.sprite.hotspot], flip);

		draw3D(context, { ...pos, game, sprite: part1, rotation: rotation });
		draw3D(context, { ...pos, game, sprite: part2, rotation: -rotation });
		draw3D(context, { ...pos, game, sprite: part3, rotation: rotation });
		draw3D(context, { ...pos, game, sprite: part4, rotation: -rotation });
	}
}
