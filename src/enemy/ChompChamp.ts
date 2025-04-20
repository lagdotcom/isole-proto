import AnimController, { Listener, ListenerMap } from '../AnimController';
import { cAI, cHurt } from '../colours';
import Enemy from '../Enemy';
import { eAnimationEnded } from '../events';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zFlying } from '../layers';
import mel from '../makeElement';
import {
	cart,
	collides,
	damage,
	deg2rad,
	drawWedge,
	jbr,
	scalew,
	πHalf,
} from '../tools';

const aIdle = 'idle',
	aClose = 'close',
	aOpen = 'open',
	aStruggle = 'struggle';

export const eCatch = 'catch',
	eRelease = 'release';

interface ChompChampSprite {
	a: string;
	at: number;
	idle(t: number): void;
	close(t: number): void;
	open(t: number): void;
	struggle(t: number): void;
	draw(c: CanvasRenderingContext2D): void;
}

interface ChompChampInit {
	a?: number;
	img?: string;
	r?: number;
	sprite?: ChompChampSprite;
}

interface ChompChampListenerMap extends ListenerMap {
	[eCatch]: Listener;
	[eRelease]: Listener;
}

/*
IDLE (column 1): currently infinite, no idle animation

CLOSE (column 2): first two frames are 30 ms, frames three and four are 50 ms, final frame lasts for 300 ms before playing the animation in reverse IF the player ISN'T caught

THUMP N SPIT: if the player IS caught, disappear player sprite and take away control til this animation's sixth frame, frames one through five are 75 ms, frame six is 150 ms (launch player from top of sprite and do damage to player), frame seven is 200 ms, frame eight and nine are 50 ms, and frame ten and eleven are 30 ms
*/
const animations = {
	[aIdle]: {
		loop: true,
		frames: [{ c: 0, r: 0, t: 1000 }],
	},
	[aClose]: {
		frames: [
			{ c: 1, r: 0, t: 30 },
			{ c: 1, r: 1, t: 30 },
			{ c: 1, r: 2, t: 50 },
			{ c: 1, r: 3, t: 50 },
			{ c: 1, r: 4, t: 300, event: eCatch },
		],
	},
	[aOpen]: {
		frames: [
			{ c: 1, r: 4, t: 300 },
			{ c: 1, r: 3, t: 50 },
			{ c: 1, r: 2, t: 50 },
			{ c: 1, r: 1, t: 30 },
			{ c: 1, r: 0, t: 30 },
		],
	},
	[aStruggle]: {
		frames: [
			{ c: 2, r: 0, t: 75 },
			{ c: 2, r: 1, t: 75 },
			{ c: 2, r: 2, t: 75 },
			{ c: 2, r: 3, t: 75 },
			{ c: 2, r: 4, t: 75 },
			{ c: 2, r: 5, t: 150, event: eRelease },
			{ c: 2, r: 6, t: 200 },
			{ c: 2, r: 7, t: 50 },
			{ c: 2, r: 8, t: 50 },
			{ c: 2, r: 9, t: 30 },
			{ c: 2, r: 10, t: 30 },
		],
	},
};

class ChompChampController extends AnimController implements ChompChampSprite {
	parent: ListenerMap;

	constructor(parent: ChompChampListenerMap, img: CanvasImageSource) {
		super({
			animations,
			img,
			w: 192,
			h: 192,
			xo: -96,
			yo: -90,
		});

		this.parent = parent;
	}

	_play(anim: string, force = false): void {
		return this.play(anim, force, this.parent);
	}

	idle(t: number) {
		this.play(aIdle);
		this.next(t);
	}

	close(t: number) {
		this._play(aClose);
		this.next(t);
	}

	open(t: number) {
		this._play(aOpen);
		this.next(t);
	}

	struggle(t: number) {
		this._play(aStruggle);
		this.next(t);
	}
}

export default class ChompChamp implements Enemy {
	a: number;
	alive: true;
	attackWidth: number;
	del: HTMLElement;
	game: Game;
	health: number;
	height: number;
	isEnemy: true;
	layer: number;
	name: string;
	r: number;
	sprite: ChompChampSprite;
	state: string;
	va: number;
	width: number;

	constructor(
		game: Game,
		{ a = 0, r = 0, sprite, img = 'enemy.chompchamp' }: ChompChampInit = {}
	) {
		this.isEnemy = true;
		this.name = 'Chomp Champ';
		this.game = game;
		this.alive = true;
		this.health = 100;
		this.layer = zFlying;
		this.width = 80;
		this.attackWidth = 80;
		this.height = 40;
		this.a = deg2rad(a);
		this.r = r;
		this.sprite =
			sprite ??
			new ChompChampController(
				{
					[eAnimationEnded]: this.onNext.bind(this),
					[eCatch]: this.onCatch.bind(this),
					[eRelease]: this.onRelease.bind(this),
				},
				game.resources[img]
			);
		this.state = aIdle;
		this.va = 0;

		if (game.options.showDebug) {
			this.del = mel(game.options.debugContainer, 'div', {
				className: 'debug debug-enemy',
			});
		}
	}

	update(time: number) {
		switch (this.state) {
			case aIdle: {
				const a = this.getAttackHitbox();
				if (
					collides(a, this.game.player.getHitbox()) &&
					this.game.player.alive
				) {
					this.state = aClose;
				}

				this.sprite.idle(time);
				break;
			}

			case aClose:
				this.sprite.close(time);
				break;

			case aOpen:
				this.sprite.open(time);
				break;

			case aStruggle:
				this.sprite.struggle(time);
				break;
		}

		if (this.del) {
			const { r, a, sprite, state } = this;
			this.del.innerHTML = jbr(
				'<b>Chomp Champ</b>',
				`state: ${state}`,
				`pos: ${r.toFixed(2)},${a.toFixed(2)}r`,
				`anim: ${sprite.a}+${sprite.at.toFixed(0)}ms`
			);
		}
	}

	draw(c: CanvasRenderingContext2D) {
		const { a, r, game, sprite } = this;
		const { cx, cy } = game;
		const normal = a + πHalf;

		const { x, y } = cart(a, r);

		c.translate(x + cx, y + cy);
		c.rotate(normal);

		sprite.draw(c);

		c.rotate(-normal);
		c.translate(-x - cx, -y - cy);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { game, state } = this;
		const { cx, cy } = game;

		switch (state) {
			case aIdle: {
				const a = this.getAttackHitbox();
				drawWedge(c, cAI, cx, cy, a.bot, a.top);
				break;
			}
			case aClose: {
				const g = this.getCatchHitbox();
				drawWedge(c, cHurt, cx, cy, g.bot, g.top);
				break;
			}
		}
	}

	getHitbox(): Hitbox {
		// this doesn't have a hitbox as such
		return {
			bot: { r: 0, a: 0, width: 0 },
			top: { r: 0, a: 0, width: 0 },
		};
	}

	getAttackHitbox(): Hitbox {
		const { r, a, attackWidth, height } = this;
		const br = r;
		const tr = r + height;
		const baw = scalew(attackWidth, br),
			taw = scalew(attackWidth, tr);

		return {
			bot: {
				r: br,
				a,
				width: baw,
			},
			top: {
				r: tr,
				a,
				width: taw,
			},
		};
	}

	getCatchHitbox(): Hitbox {
		const { r, a, width, height } = this;
		const br = r;
		const tr = r + height;
		const baw = scalew(width, br),
			taw = scalew(width, tr);

		return {
			bot: {
				r: br,
				a,
				width: baw,
			},
			top: {
				r: tr,
				a,
				width: taw,
			},
		};
	}

	onCatch() {
		const player = this.game.player;
		const g = this.getCatchHitbox();

		if (collides(g, player.getHitbox()) && !player.invincible) {
			this.state = aStruggle;

			player.a = this.a;
			player.r = this.r;
			player.va = 0;
			player.vr = 0;
			player.hidden = true;
			player.invincible = true;
			player.removecontrol = true;
		}
	}

	onRelease() {
		const player = this.game.player;

		player.a = this.a;
		player.r = this.r;
		player.hidden = false;
		player.invincible = false;
		player.removecontrol = false;
		damage(player, this, 1);
		player.va = 0;
		player.vr = 8;
	}

	onNext() {
		switch (this.state) {
			case aClose:
				this.state = aOpen;
				break;

			default:
				this.state = aIdle;
				break;
		}
	}
}
