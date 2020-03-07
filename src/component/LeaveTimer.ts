import DrawnComponent from '../DrawnComponent';
import Game from '../Game';
import { zUI } from '../layers';
import { eEnemyDied, eMapEnter } from '../events';

const gLeaveTimer = 5000;

export default class LeaveTimer implements DrawnComponent {
	active: boolean;
	game: Game;
	layer: number;
	timer: number;

	constructor(game: Game) {
		this.active = false;
		this.game = game;
		this.layer = zUI;

		game.on(eEnemyDied, this.deathCheck.bind(this));
	}

	deathCheck() {
		if (!this.game.enemies.length) {
			this.active = true;
			this.timer = gLeaveTimer;
		}
	}

	update(t: number) {
		if (this.active && this.game.mode == 'level') {
			this.timer -= t;
			if (this.timer <= 0) {
				this.active = false;
				this.game.fire(eMapEnter);
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.active) {
			ctx.fillText('leaving level soon...', 100, 100);
		}
	}
}
