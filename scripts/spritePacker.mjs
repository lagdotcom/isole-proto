import { rectanglePackerMutation } from 'rectangle-packer';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';

// const rectangles = [
// 	{ width: 200, height: 40, sx: 0, sy: 0 },
// 	{ width: 140, height: 80, sx: 0, sy: 200 },
// ];

// const fixed = rectanglePackerMutation(rectangles);

// console.log(fixed);

/**
 * @param {import('sharp').Sharp} s
 * @param {number} c
 * @param {number} r
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 */
function extractCell(s, c, r, left, top, width, height) {
	return new Promise((resolve, reject) => {
		s.clone()
			.extract({ left, top, width, height })
			.toBuffer((err, buffer) => {
				sharp(buffer).stats((err, stats) => {
					// empty cell, don't bother putting it in the sheet
					if (stats.entropy == 0) return reject();

					sharp(buffer)
						.trim()
						.toBuffer((err, buffer, info) => {
							// sharp(buffer).toFile(`local-only/${c},${r}.png`);
							resolve({
								input: buffer,
								column: c,
								row: r,
								width: info.width,
								height: info.height,
								ox: -info.trimOffsetLeft,
								oy: -info.trimOffsetTop,
							});
						});
				});
			});
	});
}

/**
 *
 * @param {object} cells
 * @param {number} columns
 * @param {number} rows
 * @returns object[][]
 */
function to2DArray(cells, columns, rows) {
	const table = [];
	var col = [];
	let preCol = -1;

	for (const { input, column, row, ...data } of cells) {
		if (column > preCol) {
			preCol = column;
			col = [data];
			table.push(col);
		} else col.push(data);
	}

	return table;
}

async function optimalPack(fileName, width, height) {
	const s = sharp(fileName);
	const sm = await s.metadata();
	const columns = sm.width / width;
	const rows = sm.height / height;
	const sprites = [];

	// console.log(`Loaded ${fileName}, detecting frames...`);
	for (var c = 0; c < columns; c++) {
		const left = c * width;

		for (var r = 0; r < rows; r++) {
			const top = r * height;

			try {
				const cell = await extractCell(
					s,
					c,
					r,
					left,
					top,
					width,
					height
				);
				sprites.push(cell);
			} catch {
				break;
			}
		}
	}

	// console.log(`Found ${sprites.length} frames, packing...`);
	const packed = rectanglePackerMutation(sprites);

	const sheetWidth = Math.max(...packed.map(r => r.x + r.width));
	const sheetHeight = Math.max(...packed.map(r => r.y + r.height));
	// console.log(`Bounding box: ${sheetWidth},${sheetHeight}`);

	const sheet = sharp({
		create: {
			width: sheetWidth,
			height: sheetHeight,
			background: 'transparent',
			channels: 4,
		},
	}).composite(packed.map(({ input, x, y }) => ({ input, left: x, top: y })));

	const packedPng = fileName + '.packed.png';
	const packedJson = fileName + '.packed.json';

	await Promise.all([
		sheet.png({ compressionLevel: 9, effort: 10 }).toFile(packedPng),
		writeFile(packedJson, JSON.stringify(to2DArray(packed, columns, rows))),
	]);

	console.log(
		`Converted ${packed.length} frames from ${fileName} into ${packedPng}/${packedJson}`
	);
}

function processAll() {
	return Promise.all([
		optimalPack('media/gfx/woody.png', 224, 224),
		optimalPack('media/gfx/woody_projectile.png', 80, 80),
		optimalPack('media/gfx/mon/frogaboar.png', 960, 960),
	]);
}

await processAll();
