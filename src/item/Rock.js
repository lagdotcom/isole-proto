import Controller from '../Controller';
import { aThrow } from '../anims';
import { dLeft, dRight } from '../dirs';
import { eThrow } from '../events';
import { gGravityStrength, gTimeScale, gWalkScale } from '../nums';
import { angledist, anglewrap, cart, piHalf, scalew } from '../tools';

const gFloatTime = 80,
	gWindLoss = 0.995;

const controller = img => new Controller({ img, w: 48, h: 48 });

function Rock(game, options = {}) {
	Object.assign(
		this,
		{
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

	this.sprite.xo = -8;
	this.sprite.yo = -36;
}

Rock.prototype.update = function(time) {
	var { game, va, vfa, vr, a, r, float } = this,
		{ floors, walls } = game,
		tscale = time / gTimeScale;

	const { b, t } = this.getHitbox();

	this.tscale = tscale;
	float -= tscale;

	var floor = null;
	if (vr <= 0) {
		floors.forEach((f, i) => {
			var da = angledist(a, f.a);
			if (b.r <= f.r && t.r >= t.r && da < f.width + t.aw) floor = f;
		});
	}

	var wall = null;
	const vas = Math.sign(va + vfa);
	walls.forEach(w => {
		if (vas != w.direction && !w.motion) return;

		if (b.al <= w.a && b.ar >= w.a && t.r >= w.bottom && b.r <= w.top)
			wall = w;
	});

	if (floor || wall) {
		// TODO: bounce etc
		game.components = game.components.filter(c => c != this);
		return;
	}

	if (float <= 0) vr -= gGravityStrength;
	va *= gWindLoss;

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

	c.strokeStyle = '#ffff00';
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

RockItem.prototype.use = function() {
	this.game.player.sprite.play(aThrow, false, { [eThrow]: this.thrown });
};

RockItem.prototype.thrown = function() {
	const { game } = this;

	// TODO
	//game.inventory.remove(this);

	game.components.push(
		new Rock(game, {
			r: game.player.r + 10,
			a: game.player.a,
			va: game.player.facing === dLeft ? -1 : 1,
			float: gFloatTime,
		})
	);
};
