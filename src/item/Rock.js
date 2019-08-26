import Controller from '../Controller';
import { aThrow } from '../anims';
import { cHit } from '../colours';
import { dLeft, dRight } from '../dirs';
import { eThrow } from '../events';
import { gGravityStrength, gTimeScale, gWalkScale } from '../nums';
import {
	angledist,
	anglewrap,
	cart,
	collides,
	piHalf,
	scalew,
	damage,
} from '../tools';
import { zFlying } from '../layers';

const gFloatTime = 80,
	gWindLoss = 0.995;

const controller = img => new Controller({ img, w: 48, h: 48 });

function Rock(game, options = {}) {
	Object.assign(
		this,
		{
			layer: zFlying,
			game,
			sprite: controller(game.resources['item.rock']),
			w: 28,
			h: 28,
			vr: 0,
			vfa: 0,
			tscale: 0,
		},
		options
	);

	this.sprite.xo = -24;
	this.sprite.yo = -36;
}

Rock.prototype.update = function(time) {
	var { game, va, vfa, vr, a, r, float } = this,
		{ enemies, floors, walls } = game,
		tscale = time / gTimeScale;

	const { b, t } = this.getHitbox();
	var enemy = null;
	enemies.forEach(e => {
		if (collides({ b, t }, e.getHitbox())) {
			enemy = e;
			return;
		}
	});

	if (enemy) {
		// TODO: bounce etc
		game.remove(this);
		enemy.va += va * 0.2; // knock back a bit
		enemy.last = {}; // unstick krillna
		damage(enemy, this.owner, 1);
		return;
	}

	this.tscale = tscale;
	float -= tscale;

	if (float <= 0) vr -= gGravityStrength;
	va *= gWindLoss;

	var floor = null;
	if (vr < 0) {
		floors.forEach(f => {
			var da = angledist(a, f.a);
			if (b.r <= f.r && t.r >= f.r && da < f.width + t.aw) floor = f;
		});
	}

	var wall = null;
	walls.forEach(w => {
		if (b.al <= w.a && b.ar >= w.a && t.r >= w.bottom && b.r <= w.top)
			wall = w;
	});

	if (floor || wall) {
		// TODO: bounce etc
		game.remove(this);
		return;
	}

	this.va = va;
	this.vfa = vfa;
	this.vr = vr;
	a += (va / r) * tscale * gWalkScale + vfa;
	r += vr * tscale;

	if (r < 0) {
		r *= -1;
		a += pi;
	}

	this.a = anglewrap(a);
	this.r = r;
	this.float = float;
};

Rock.prototype.draw = function(c) {
	const { a, r, game, sprite } = this;
	const { cx, cy } = game;
	const normal = a + piHalf;

	const { x, y } = cart(a, r);

	c.translate(x + cx, y + cy);
	c.rotate(normal);

	sprite.draw(c);

	c.rotate(-normal);
	c.translate(-x - cx, -y - cy);
};

Rock.prototype.drawHitbox = function(c) {
	const { game } = this;
	const { cx, cy } = game;
	const { b, t } = this.getHitbox();

	c.strokeStyle = cHit;
	c.beginPath();
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.arc(cx, cy, t.r, t.ar, t.al, true);
	c.arc(cx, cy, b.r, b.al, b.ar);
	c.stroke();
};

Rock.prototype.getHitbox = function() {
	const { r, a, va, vr, w, h, tscale } = this;
	const baw = scalew(w, r),
		taw = scalew(w, r + h);
	var amod,
		vbr = 0,
		vtr = 0;

	if (tscale) amod = a + (va / r) * tscale * gWalkScale;
	else amod = a;

	if (vr > 0) vtr = vr;
	else if (vr < 0) vbr = vr;

	return {
		b: {
			r: r + vbr,
			aw: baw,
			al: amod - baw,
			ar: amod + baw,
		},
		t: {
			r: r + h + vtr,
			aw: taw,
			al: amod - taw,
			ar: amod + taw,
		},
	};
};

export default function RockItem(game) {
	Object.assign(this, {
		game,
		sprite: controller(game.resources['item.rock']),
		thrown: this.thrown.bind(this),
	});
}

RockItem.prototype.draw = function(c, x, y) {
	c.translate(x, y);
	this.sprite.draw(c);
	c.translate(-x, -y);
};

RockItem.prototype.canUse = function() {
	const player = this.game.player;
	return (
		player.alive &&
		!player.sprite.flags.noAttack &&
		!player.sprite.flags.noControl
	);
};

RockItem.prototype.use = function() {
	this.game.player.sprite.play(aThrow, false, { [eThrow]: this.thrown });
};

RockItem.prototype.thrown = function() {
	const { game } = this;

	// TODO
	//game.inventory.remove(this);

	game.redraw = true;
	game.components.push(
		new Rock(game, {
			r: game.player.r + 10,
			a: game.player.a,
			va: game.player.facing === dLeft ? -1 : 1,
			float: gFloatTime,
			owner: game.player,
		})
	);
};
