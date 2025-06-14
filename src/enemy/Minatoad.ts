import AnimController, {
	AnimSpecMap,
	Listener,
	ListenerMap,
} from '../AnimController';
import { cAI, cAIDark, cHurt } from '../colours';
import { Facing } from '../dirs';
import DrawnComponent from '../DrawnComponent';
import { eAnimationEnded } from '../events';
import {
	AnimName,
	Milliseconds,
	Multiplier,
	Pixels,
	Radians,
	ResourceName,
	ScaledTime,
} from '../flavours';
import Game from '../Game';
import Hitbox from '../Hitbox';
import { zSpark } from '../layers';
import {
	getBack,
	getZ,
	gStandThreshold,
	gTimeScale,
	gWalkScale,
} from '../nums';
import physics from '../physics';
import { draw3D } from '../rendering';
import ReticleController from '../spr/ReticleController';
import {
	collides,
	damage,
	drawWedge,
	fillWedge,
	isRightOf,
	randomAngle,
	randomItem,
	randomRange,
	scaleWidth,
} from '../tools';
import AbstractEnemy from './AbstractEnemy';

/*
Column 1: IDLE
	- 75ms, stays active between the boss's various attacks

Column 2: BIG LEAP
	- Frames 1-3 65ms, Frames 4-6 75ms, Frame 7 150ms, Frame 8-9 75ms, Frame 10 300ms, Frame 11-12 75ms.
	- Frame 13 hold this behavior til the Minatoad vanishes off screen, have the target reticle effect appear and follow the player for a few seconds
	- Frame 14-15 75ms, hold on frame 16 til the Minatoad lands, upon hitting the ground send shockwaves out left and right and maybe stun player if they don't jump
	- Frame 17 75ms, Frame 18 300 ms, Frame 19-24 75ms, return to idle motion after behavior completes
	- Use this move somewhat sparingly in boss's AI, maybe so it can only be used every two or more moves?

Column 3: SMALL HOP
	- Frames 1-4 75ms, Frame 5 hold until apex of jump is reached
	- Frames 6-7 75ms, Frame 8 hold until touching the ground
	- Loop back to frame 1, while this behavior is active have the boss leap continually clockwise or counterclockwise towards the player, like the Boosters
	- Random number of hops, no less than 3 and no more than 6 potentially? Can be adjusted later

Column 4: POISON SPRAY
	- Frames 1-4 75ms, Frame 5 300ms
	- Frames 6-14 75ms, During this animation spread a slightly transluscent purple wavey mist in an AOE around the Minatoad that stays for a duration.
	- Unsure if purple mist would need a sprite? Seems like it'd fit mostly as a programatic effect

Column 5: RAPID FIRE CIRCULAR BULLET PATTERN
	- Frames 1-4 75ms, Frame 5 150 ms, shoot burst of either large or medium sized bullets from the sheet into the air
	- Frame 6 75ms, loop back to frame 2-4 and repeat this animation cycle 3-4 times, whatever feels good
	- As these actions are occuring, begin bullets falling from the edges of the screen like in the rapid trunk spray attack concept
	- Play frame 7-8 at 75ms, let Minatoad idle for a bit til bullets are mostly dissipated, then begin other attacks

Likely an obvious note, but Minatoad shouldn't be able to use any of it's skills twice in a row except for maybe the small hop.
*/

const eLeap = 'leap';
const eFire = 'fire';
const eRefire = 'refire';
const eSpray = 'spray';

interface MinatoadListenerMap extends ListenerMap {
	[eLeap]: Listener;
	[eFire]: Listener;
	[eRefire]: Listener;
	[eAnimationEnded]: Listener;
}

const animations: AnimSpecMap = {
	idle: {
		loop: true,
		frames: [
			{ c: 0, r: 0, t: 75 },
			{ c: 0, r: 1, t: 75 },
			{ c: 0, r: 2, t: 75 },
			{ c: 0, r: 3, t: 75 },
			{ c: 0, r: 4, t: 75 },
			{ c: 0, r: 5, t: 75 },
		],
	},

	leapRise: {
		extend: true,
		frames: [
			{ c: 1, r: 0, t: 65 },
			{ c: 1, r: 1, t: 65 },
			{ c: 1, r: 2, t: 65 },
			{ c: 1, r: 3, t: 75 },
			{ c: 1, r: 4, t: 75 },
			{ c: 1, r: 5, t: 75, event: eLeap },
			{ c: 1, r: 6, t: 150 },
			{ c: 1, r: 7, t: 75 },
			{ c: 1, r: 8, t: 75 },
			{ c: 1, r: 9, t: 300 },
			{ c: 1, r: 10, t: 75 },
			{ c: 1, r: 11, t: 75 },
			{ c: 1, r: 12, t: 75 },
		],
	},

	leapFall: {
		extend: true,
		frames: [
			{ c: 1, r: 13, t: 75 },
			{ c: 1, r: 14, t: 75 },
			{ c: 1, r: 15, t: 75 },
		],
	},

	leapLand: {
		frames: [
			{ c: 1, r: 16, t: 75 },
			{ c: 1, r: 17, t: 300 },
			{ c: 1, r: 18, t: 75 },
			{ c: 1, r: 19, t: 75 },
			{ c: 1, r: 20, t: 75 },
			{ c: 1, r: 21, t: 75 },
			{ c: 1, r: 22, t: 75 },
			{ c: 1, r: 23, t: 75 },
		],
	},

	jump: {
		frames: [
			{ c: 2, r: 0, t: 75 },
			{ c: 2, r: 1, t: 75 },
		],
	},

	rise: {
		extend: true,
		frames: [
			{ c: 2, r: 2, t: 75 },
			{ c: 2, r: 3, t: 75 },
			{ c: 2, r: 4, t: 75 },
		],
	},

	fall: {
		extend: true,
		frames: [
			{ c: 2, r: 5, t: 75 },
			{ c: 2, r: 6, t: 75 },
			{ c: 2, r: 7, t: 75 },
		],
	},

	spray: {
		frames: [
			{ c: 3, r: 0, t: 75 },
			{ c: 3, r: 1, t: 75 },
			{ c: 3, r: 2, t: 75 },
			{ c: 3, r: 3, t: 75 },
			{ c: 3, r: 4, t: 500 },
			{ c: 3, r: 5, t: 75 },
			{ c: 3, r: 6, t: 75, event: eSpray },
			{ c: 3, r: 7, t: 75 },
			{ c: 3, r: 8, t: 75 },
			{ c: 3, r: 9, t: 75 },
			{ c: 3, r: 10, t: 75 },
			{ c: 3, r: 11, t: 75 },
			{ c: 3, r: 12, t: 75 },
			{ c: 3, r: 13, t: 75 },
		],
	},

	rapid: {
		frames: [
			{ c: 4, r: 0, t: 75 },
			{ c: 4, r: 1, t: 75 },
			{ c: 4, r: 2, t: 75 },
			{ c: 4, r: 3, t: 75 },
			{ c: 4, r: 4, t: 150, event: eFire },
			{ c: 4, r: 5, t: 75, event: eRefire },
			{ c: 4, r: 6, t: 75 },
			{ c: 4, r: 7, t: 75 },
		],
	},
};

const gMaxReticleVA = 0.1;
const gMaxReticleVR = 5;

class Reticle implements DrawnComponent {
	a: number;
	sprite: ReticleController;
	game: Game;
	layer: number;
	r: number;
	va: number;
	vr: number;
	z: Multiplier;

	constructor(game: Game) {
		this.z = getZ(false);
		this.a = 0;
		this.sprite = new ReticleController(game);
		this.game = game;
		this.layer = zSpark;
		this.r = 0;
	}

	reset() {
		this.a = this.game.player.a;
		this.r = this.game.player.r;
		this.va = 0;
		this.vr = 0;
	}

	update(t: number) {
		this.sprite.update(t);

		const target = this.game.player;

		if (isRightOf(this.a, target.a)) this.va += 0.0005 * t;
		else this.va -= 0.0005 * t;

		if (target.r < this.r) this.vr -= 0.01 * t;
		else if (target.r > this.r) this.vr += 0.01 * t;

		if (this.va < -gMaxReticleVA) this.va = -gMaxReticleVA;
		else if (this.va > gMaxReticleVA) this.va = gMaxReticleVA;

		if (this.vr < -gMaxReticleVR) this.vr = -gMaxReticleVR;
		else if (this.vr > gMaxReticleVR) this.vr = gMaxReticleVR;

		this.a += this.va;
		this.r += this.vr;
	}

	draw(c: CanvasRenderingContext2D) {
		draw3D(c, this);
	}
}

class ShockwaveController extends AnimController {
	constructor(img: CanvasImageSource) {
		super({
			img,
			leftFlip: false,
			animations: {
				idle: {
					loop: true,
					frames: [
						{ c: 0, r: 0, t: 75 },
						{ c: 0, r: 1, t: 75 },
						{ c: 0, r: 2, t: 75 },
					],
				},
			},
			w: 96,
			h: 96,
			xo: -48,
			yo: -96,
		});

		this.play('idle');
	}

	update(t: number) {
		this.next(t);
	}
}
class Shockwave extends AbstractEnemy {
	active: boolean;
	sprite: ShockwaveController;

	constructor(game: Game, back: boolean, a: number, r: number, va: number) {
		super({
			isEnemy: false,
			name: 'Minatoad Shockwave',
			game,
			active: true,
			back,
			a,
			r,
			va,
			vr: 0,
			layer: zSpark,
			width: 48,
			height: 48,
			sprite: new ShockwaveController(
				game.resources['enemy.minatoad.shockwave']
			),
		});

		if (va > 0) this.sprite.right();

		// don't want the deg2rad conversion
		this.a = a;
	}

	update(t: number) {
		const { active, game, sprite } = this;

		sprite.update(t);
		this.a += this.va;
		this.va *= 0.9;

		if (Math.abs(this.va) < gStandThreshold) {
			this.die(this);
			return;
		}

		if (active) {
			const a = this.getAttackHitbox();
			if (collides(a, game.player.getHitbox()) && game.player.alive) {
				damage(game.player, this, 1);
				this.active = false;
			}
		}

		if (this.del) {
			const { va, vr, r, a, z } = this;

			this.debug({
				active: `${active ? 'yes' : 'no'}`,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${z.toFixed(2)}`,
			});
		}
	}

	draw(c: CanvasRenderingContext2D) {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { active, game } = this;
		const { cx, cy } = game;

		if (active) {
			const a = this.getAttackHitbox();
			drawWedge(c, cAI, cx, cy, a.bot, a.top);
		}
	}

	getHitbox(): Hitbox {
		// this doesn't have a hitbox as such
		return {
			bot: { r: 0, a: 0, z: 0, width: 0 },
			top: { r: 0, a: 0, z: 0, width: 0 },
		};
	}

	getAttackHitbox(): Hitbox {
		const { r, a, z, width, height } = this;
		const br = r;
		const tr = r + height * z;
		const baw = scaleWidth(width, br, z),
			taw = scaleWidth(width, tr, z);

		return {
			bot: {
				r: br,
				a,
				z,
				width: baw,
			},
			top: {
				r: tr,
				a,
				z,
				width: taw,
			},
		};
	}
}

class BulletController extends AnimController {
	constructor(img: CanvasImageSource, xo = -40, yo = -80) {
		super({
			img,
			leftFlip: false,
			animations: {
				big: {
					loop: true,
					frames: [
						{ c: 0, r: 0, t: 75 },
						{ c: 0, r: 1, t: 75 },
						{ c: 0, r: 2, t: 75 },
					],
				},
				small: {
					loop: true,
					frames: [
						{ c: 3, r: 0, t: 75 },
						{ c: 3, r: 1, t: 75 },
						{ c: 3, r: 2, t: 75 },
					],
				},
			},
			w: 80,
			h: 80,
			xo,
			yo,
		});
	}

	update(t: number) {
		this.next(t);
	}
}

class SmallBullet extends AbstractEnemy {
	active: boolean;
	ignoreGravity: boolean;
	owner: Minatoad;
	sprite: BulletController;
	vfa: number;

	constructor(
		owner: Minatoad,
		game: Game,
		back: boolean,
		a: number,
		r: number,
		vr: number
	) {
		super({
			isEnemy: false,
			name: 'Minatoad Small Bullet',
			owner,
			game,
			active: true,
			back,
			a,
			r,
			va: 0,
			vfa: 0,
			vr,
			ignoreGravity: true,
			layer: zSpark,
			width: 10,
			height: 10,
			sprite: new BulletController(
				game.resources['projectile'],
				-40,
				-40
			),
		});

		this.owner.bullets++;
		this.sprite.play('small');

		// don't want the deg2rad conversion
		this.a = a;
	}

	update(t: number) {
		const { active, game, sprite } = this;

		sprite.update(t);
		const { floor } = physics(this, t);

		if (floor || this.r < 10) {
			this.owner.bullets--;
			this.die(this);
			return;
		}

		if (active) {
			const a = this.getAttackHitbox();
			if (collides(a, game.player.getHitbox()) && game.player.alive) {
				damage(game.player, this, 1);
				this.active = false;
				this.owner.bullets--;
				this.die(this);
			}
		}

		if (this.del) {
			const { va, vr, r, a, z } = this;

			this.debug({
				active: `${active ? 'yes' : 'no'}`,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${z.toFixed(2)}`,
			});
		}
	}

	draw(c: CanvasRenderingContext2D) {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { active, game } = this;
		const { cx, cy } = game;

		if (active) {
			const a = this.getAttackHitbox();
			drawWedge(c, cAI, cx, cy, a.bot, a.top);
		}
	}

	getHitbox(): Hitbox {
		return this.getAttackHitbox();
	}

	getAttackHitbox(): Hitbox {
		const { r, a, z, width, height } = this;
		const br = r;
		const tr = r + height * z;
		const baw = scaleWidth(width, br, z),
			taw = scaleWidth(width, tr, z);

		return {
			bot: {
				r: br,
				a,
				z,
				width: baw,
			},
			top: {
				r: tr,
				a,
				z,
				width: taw,
			},
		};
	}
}

class BigBullet extends AbstractEnemy {
	active: boolean;
	owner: Minatoad;
	sprite: BulletController;

	constructor(
		owner: Minatoad,
		game: Game,
		back: boolean,
		a: number,
		r: number,
		vr: number
	) {
		super({
			isEnemy: false,
			name: 'Minatoad Big Bullet',
			owner,
			game,
			active: true,
			back,
			a,
			r,
			va: 0,
			vr,
			layer: zSpark,
			width: 40,
			height: 40,
			sprite: new BulletController(game.resources['projectile']),
		});

		this.owner.bullets++;
		this.sprite.play('big');

		// don't want the deg2rad conversion
		this.a = a;
	}

	update(t: number) {
		const { active, game, sprite } = this;

		sprite.update(t);
		this.r += this.vr * t;

		if (this.r >= gRadiusCap) {
			for (let i = 0; i < gSplitCount; i++) {
				const bullet = new SmallBullet(
					this.owner,
					this.game,
					getBack(this.z),
					randomAngle(),
					this.r,
					gSmallBulletSpeed()
				);
				this.game.components.push(bullet);
			}

			this.owner.bullets--;
			this.die(this);
			this.game.redraw = true;
			return;
		}

		if (active) {
			const a = this.getAttackHitbox();
			if (collides(a, game.player.getHitbox()) && game.player.alive) {
				damage(game.player, this, 1);
				this.active = false;
			}
		}

		if (this.del) {
			const { va, vr, r, a, z } = this;

			this.debug({
				active: `${active ? 'yes' : 'no'}`,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${z.toFixed(2)}`,
			});
		}
	}

	draw(c: CanvasRenderingContext2D) {
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { active, game } = this;
		const { cx, cy } = game;

		if (active) {
			const a = this.getAttackHitbox();
			drawWedge(c, cAI, cx, cy, a.bot, a.top);
		}
	}

	getHitbox(): Hitbox {
		// this doesn't have a hitbox as such
		return {
			bot: { r: 0, a: 0, z: 0, width: 0 },
			top: { r: 0, a: 0, z: 0, width: 0 },
		};
	}

	getAttackHitbox(): Hitbox {
		const { r, a, z, width, height } = this;
		const br = r;
		const tr = r + height * z;
		const baw = scaleWidth(width, br, z),
			taw = scaleWidth(width, tr, z);

		return {
			bot: {
				r: br,
				a,
				z,
				width: baw,
			},
			top: {
				r: tr,
				a,
				z,
				width: taw,
			},
		};
	}
}

class PoisonSprayField extends AbstractEnemy {
	a: number;
	duration: number;
	game: Game;
	height: number;
	name: string;
	owner: Minatoad;
	r: number;
	spread: number;
	width: number;
	va: number;
	vr: number;

	constructor(
		owner: Minatoad,
		game: Game,
		duration: number,
		spread: number,
		a: number,
		r: number
	) {
		super({
			isEnemy: false,
			name: 'Poison Spray',
			owner,
			game,
			duration,
			spread,
			back: getBack(owner.z),
			a,
			r,
			width: 150,
			height: 100,
			va: 0,
			vr: 0,
		});

		// don't want the deg2rad conversion
		this.a = a;
	}

	update(t: number) {
		this.duration -= t;
		if (this.duration <= 0) {
			this.owner.poisonField = undefined;
			return this.die(this);
		}

		this.spread -= t;
		if (this.spread > 0) this.width += 0.3 * t;

		if (this.del) {
			const { va, vr, r, a, z } = this;

			this.debug({
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r,${z.toFixed(2)}`,
			});
		}
	}

	draw(c: CanvasRenderingContext2D) {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		c.globalAlpha = 0.5;
		fillWedge(c, 'purple', cx, cy, bot, top);
		c.globalAlpha = 1;
	}

	drawHitbox(c: CanvasRenderingContext2D) {
		const { game } = this;
		const { cx, cy } = game;

		const a = this.getAttackHitbox();
		drawWedge(c, cAIDark, cx, cy, a.bot, a.top);
	}

	getHitbox() {
		return this.getAttackHitbox();
	}

	getAttackHitbox() {
		const { r, a, z, width, height } = this;
		const br = r;
		const tr = r + height * z;
		const baw = scaleWidth(width, br, z),
			taw = scaleWidth(width, tr, z);

		return {
			bot: {
				r: br,
				a,
				z,
				width: baw,
			},
			top: {
				r: tr,
				a,
				z,
				width: taw,
			},
		};
	}
}

class MinatoadController extends AnimController {
	parent: MinatoadListenerMap;

	constructor(parent: MinatoadListenerMap, img: CanvasImageSource) {
		super({
			img,
			animations,
			w: 240,
			h: 240,
			xo: -120,
			yo: -170,
		});

		this.parent = parent;
	}

	_play(anim: AnimName, force = false): void {
		return this.play(anim, force, this.parent);
	}

	idle(t: Milliseconds) {
		this.play('idle');
		this.next(t);
	}

	jump(t: Milliseconds) {
		this._play('jump');
		this.next(t);
	}

	rise(t: Milliseconds) {
		this._play('rise');
		this.next(t);
	}

	fall(t: Milliseconds) {
		this._play('fall');
		this.next(t);
	}

	leap(t: Milliseconds) {
		this._play('leapRise');
		this.next(t);
	}

	leapFall(t: Milliseconds) {
		this._play('leapFall');
		this.next(t);
	}

	leapLand(t: Milliseconds) {
		this._play('leapLand');
		this.next(t);
	}

	spray(t: Milliseconds) {
		this._play('spray');
		this.next(t);
	}

	rapid(t: Milliseconds) {
		this._play('rapid');
		this.next(t);
	}
}

interface MinatoadOptions {
	a?: Radians;
	dir?: Facing;
	img?: ResourceName;
	r?: Pixels;
}

type MinatoadState =
	| 'idle'
	| 'leap'
	| 'track'
	| 'fall'
	| 'slam'
	| 'hop'
	| 'spray'
	| 'rapid';

const gBetweenAttacks: Milliseconds = 1000;
const gJumpStrength = 5;
const gJumpSpeed = 0.4;
const gShockwaveSpeed = 0.08;
const gRadiusCap = 1000;
const gLeapSpeed = 20;
const gBigBulletSpeed = 1;
const gSplitCount = 5;
const gSmallBulletSpeed = () => randomRange(-8, -5);

export default class Minatoad extends AbstractEnemy {
	bullets: number;
	dir: Facing;
	hidden: boolean;
	ignoreCeilings: boolean;
	jumps: number;
	last: MinatoadState;
	poisonField?: PoisonSprayField;
	reticle: Reticle;
	shots: number;
	sprite: MinatoadController;
	state: MinatoadState;
	tscale: ScaledTime;
	vfa: number;
	waittimer: Milliseconds;

	constructor(
		game: Game,
		{
			dir = 'L',
			a = 0,
			r = 250,
			img = 'enemy.minatoad',
		}: MinatoadOptions = {}
	) {
		super({
			game,
			bullets: 0,
			width: 80,
			height: 80,
			name: 'Minatoad',
			dir,
			last: 'idle',
			state: 'idle',
			a,
			r,
			va: 0,
			vfa: 0,
			vr: 0,
			ignoreCeilings: false,
			alive: true,
			health: 10,
			waittimer: 0,
			shots: 0,
			jumps: 0,
			hidden: false,
		});

		this.sprite = new MinatoadController(
			{
				[eAnimationEnded]: this.onAnimEnd.bind(this),
				[eFire]: this.onFire.bind(this),
				[eLeap]: this.onLeap.bind(this),
				[eRefire]: this.onRefire.bind(this),
				[eSpray]: this.onSpray.bind(this),
			},
			game.resources[img]
		);

		this.reticle = new Reticle(this.game);
	}

	onAnimEnd() {
		if (this.state === 'hop' && this.jumps > 0) {
			this.va = this.getJumpDir();
			this.vr = gJumpStrength;
			this.jumps--;
			return;
		}

		this.state = 'idle';
		this.waittimer = 0;
	}

	onFire() {
		const bullet = new BigBullet(
			this,
			this.game,
			getBack(this.z),
			this.a,
			this.r + this.height * this.z,
			gBigBulletSpeed
		);
		this.game.components.push(bullet);
		this.game.redraw = true;
	}

	onLeap() {
		this.vr = gLeapSpeed;
		this.ignoreCeilings = true;
	}

	onRefire() {
		this.shots--;
		if (this.shots >= 0) this.sprite.afi = 0;
	}

	onSpray() {
		const { game, a, r } = this;

		this.poisonField = new PoisonSprayField(this, game, 10000, 1000, a, r);
		game.components.push(this.poisonField);
		game.redraw = true;
	}

	getNextAttack() {
		let next: MinatoadState = this.last;

		while (next === this.last) {
			next = randomItem([
				'leap',
				'hop',
				'hop',
				'spray',
				'spray',
				'rapid',
				'rapid',
			]);

			// can't have two fields at once
			if (this.poisonField && next === 'spray') next = this.last;
		}

		this.last = next;
		this.shots = randomRange(3, 4);
		this.jumps = randomRange(3, 6);
		return next;
	}

	update(time: Milliseconds) {
		if (!(time = this.dostun(time))) return;

		this.tscale = time / gTimeScale;
		this[this.state + 'Update'](time);

		if (this.del) {
			const { va, vr, r, a, sprite, state } = this;

			this.debug({
				state: `${state}`,
				vel: `${vr.toFixed(2)},${va.toFixed(2)}r`,
				pos: `${r.toFixed(2)},${a.toFixed(2)}r`,
				anim: `${sprite.a}+${sprite.at.toFixed(0)}ms, ${
					sprite.flip ? 'flip' : 'normal'
				}`,
			});
		}
	}

	idleUpdate(t: Milliseconds) {
		this.sprite.idle(t);
		physics(this, t);

		this.waittimer += t;
		if (this.waittimer > gBetweenAttacks && !this.bullets) {
			const next = this.getNextAttack();
			this.last = this.state = next;
		}
	}

	leapUpdate(t: Milliseconds) {
		this.sprite.leap(t);
		if (this.vr) this.vr = gLeapSpeed;

		physics(this, t);

		if (this.r >= gRadiusCap) {
			this.hidden = true;
			this.r = gRadiusCap;

			this.reticle.reset();
			this.game.components.push(this.reticle);
			this.game.redraw = true;

			this.state = 'track';
			this.vr = 0;
			this.waittimer = randomRange(2000, 3000);
		}
	}

	trackUpdate(t: Milliseconds) {
		this.waittimer -= t;
		if (this.waittimer <= 0) {
			this.state = 'fall';

			this.game.remove(this.reticle);
			this.z = getZ(getBack(this.game.player.z));
			this.a = this.reticle.a;
			this.vr = -20;
			this.hidden = false;
		}
	}

	fallUpdate(t: Milliseconds) {
		const { sprite } = this;
		const { floor } = physics(this, t);
		sprite.leapFall(t);

		if (floor) {
			this.r = floor.r;
			this.vr = 0;
			this.state = 'slam';

			const leftsh = new Shockwave(
				this.game,
				getBack(this.z),
				this.a,
				this.r,
				-gShockwaveSpeed
			);
			const rightsh = new Shockwave(
				this.game,
				getBack(this.z),
				this.a,
				this.r,
				gShockwaveSpeed
			);

			this.game.components.push(leftsh, rightsh);
			this.game.redraw = true;
		}
	}

	slamUpdate(t: Milliseconds) {
		this.ignoreCeilings = false;

		this.sprite.leapLand(t);
		physics(this, t);
	}

	hopUpdate(t: Milliseconds) {
		if (this.vr < 0) this.sprite.fall(t);
		else if (this.vr > 0) this.sprite.rise(t);
		else this.sprite.jump(t);

		physics(this, t);
	}

	sprayUpdate(t: Milliseconds) {
		this.sprite.spray(t);
		physics(this, t);
	}

	rapidUpdate(t: Milliseconds) {
		this.sprite.rapid(t);
		physics(this, t);
	}

	draw(c: CanvasRenderingContext2D) {
		if (this.hidden) return;
		draw3D(c, this);
	}

	drawHitbox(c: CanvasRenderingContext2D): void {
		const { game } = this;
		const { cx, cy } = game;
		const { bot, top } = this.getHitbox();

		drawWedge(c, cHurt, cx, cy, bot, top);
	}

	getHitbox(): Hitbox {
		const { r, a, z, va, vr, width, height, tscale } = this;
		const baw = scaleWidth(width, r, z),
			taw = scaleWidth(width, r + height, z);
		let amod: number,
			vbr = 0,
			vtr = 0;

		if (tscale) amod = a + (va / r) * tscale * gWalkScale;
		else amod = a;

		if (vr > 0) vtr = vr;
		else if (vr < 0) vbr = vr;

		return {
			bot: {
				r: r + vbr,
				a: amod,
				z,
				width: baw,
			},
			top: {
				r: r + height * z + vtr,
				a: amod,
				z,
				width: taw,
			},
		};
	}

	private getJumpDir() {
		return isRightOf(this.a, this.game.player.a) ? gJumpSpeed : -gJumpSpeed;
	}
}
