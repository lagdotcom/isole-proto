import Controller from '../Controller';

export default class DecalController extends Controller {
	x: number;
	y: number;

	constructor(img: CanvasImageSource, options: any) {
		super(Object.assign({}, { img, ...options }));
	}

	draw(ctx: CanvasRenderingContext2D) {
		const { x, y, w, h, flip, img, xo, yo } = this;

		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(img, x, y, w, h, xo, yo, w, h);
		if (flip) ctx.scale(-1, 1);
	}
}
