import fs from 'fs';
import Jimp from 'jimp';

import Packet from '#jagex2/io/Packet.js';

export function generatePixelOrder(img) {
    let rowMajorScore = 0;
    let columnMajorScore = 0;

    // calculate row-major score
    let prev = 0;
    for (let j = 0; j < img.bitmap.width * img.bitmap.height; j += 4) {
        let pos = j * 4;
        let current = img.bitmap.data[pos + 0] << 16 | img.bitmap.data[pos + 1] << 8 | img.bitmap.data[pos + 2];
        rowMajorScore += current - prev;
        prev = current;
    }

    // calculate column-major score
    prev = 0;
    for (let x = 0; x < img.bitmap.width; x++) {
        for (let y = 0; y < img.bitmap.height; y++) {
            let pos = (x + (y * img.bitmap.width)) * 4;
            let current = img.bitmap.data[pos + 0] << 16 | img.bitmap.data[pos + 1] << 8 | img.bitmap.data[pos + 2];
            columnMajorScore += current - prev;
            prev = current;
        }
    }

    return columnMajorScore < rowMajorScore ? 0 : 1;
}

export function writeImage(img, data, index, colors) {
    // TODO: read pixels to find the first non-transparent rgb on each axis, so the image can be shifted to begin at 0,0
    let cropX = 0;
    let cropY = 0;
    index.p1(cropX);
    index.p1(cropY);

    index.p2(img.bitmap.width);
    index.p2(img.bitmap.height);

    let pixelOrder = generatePixelOrder(img);
    index.p1(pixelOrder);
    // console.log('\t', pixelOrder ? 'vertical' : 'horizontal');

    if (pixelOrder === 0) {
        for (let j = 0; j < img.bitmap.width * img.bitmap.height; j++) {
            let pos = j * 4;
            let rgb = (img.bitmap.data[pos + 0] << 24 | img.bitmap.data[pos + 1] << 16 | img.bitmap.data[pos + 2] << 8 | img.bitmap.data[pos + 3]) >>> 0;

            let index = colors.indexOf(rgb);
            if (index === -1) {
                console.error('color not found in palette');
                break;
            }

            data.p1(index);
        }
    } else if (pixelOrder === 1) {
        for (let x = 0; x < img.bitmap.width; x++) {
            for (let y = 0; y < img.bitmap.height; y++) {
                let pos = (x + (y * img.bitmap.width)) * 4;
                let rgb = (img.bitmap.data[pos + 0] << 24 | img.bitmap.data[pos + 1] << 16 | img.bitmap.data[pos + 2] << 8 | img.bitmap.data[pos + 3]) >>> 0;

                let index = colors.indexOf(rgb);
                if (index === -1) {
                    console.error('color not found in palette', rgb.toString(16));
                    break;
                }

                data.p1(index);
            }
        }
    }
}

export async function convertImage(index, srcPath, safeName, meta = null) {
    console.log(safeName);

    let data = new Packet();
    data.p2(index.pos);

    let img = await Jimp.read(`${srcPath}/${safeName}.png`);
    let tileX = img.bitmap.width;
    let tileY = img.bitmap.height;

    let tileable = fs.existsSync(`${srcPath}/${safeName}.sprite`);
    if (tileable) {
        let metadata = fs.readFileSync(`${srcPath}/${safeName}.sprite`, 'utf8').split('x');
        tileX = parseInt(metadata[0]);
        tileY = parseInt(metadata[1]);
    }

    if (meta) {
        tileable = true;
        tileX = meta.tileX;
        tileY = meta.tileY;
    }

    index.p2(tileX);
    index.p2(tileY);

    // generate color palette by counting unique colors
    let colors = [ 0 ]; // reserved for transparency
    for (let j = 0; j < img.bitmap.width * img.bitmap.height; j++) {
        let pos = j * 4;
        let rgb = (img.bitmap.data[pos + 0] << 24 | img.bitmap.data[pos + 1] << 16 | img.bitmap.data[pos + 2] << 8 | img.bitmap.data[pos + 3]) >>> 0;

        if (colors.indexOf(rgb) === -1) {
            colors.push(rgb);
        }
    }

    if (colors.length > 255) {
        // TODO: automatic color quantization would be nice
        console.error('error: too many colors', colors.length);
        return;
    }

    index.p1(colors.length);
    for (let j = 1; j < colors.length; j++) {
        index.p3(colors[j] >> 8);
    }

    if (tileable) {
        // TODO: stop writing extra data for unused tiles
        for (let y = 0; y < img.bitmap.height / tileY; y++) {
            for (let x = 0; x < img.bitmap.width / tileX; x++) {
                let tile = img.clone().crop(x * tileX, y * tileY, tileX, tileY);
                writeImage(tile, data, index, colors);
            }
        }
    } else {
        writeImage(img, data, index, colors);
    }

    return data;
}
