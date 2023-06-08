import fs from 'fs';
import Jimp from 'jimp';

import Packet from '#jagex2/io/Packet.js';
import { generatePixelOrder, writeImage } from '#lostcity/pack/Pix.js';

let sprites = fs.readdirSync('data/src/sprites').filter(x => x.endsWith('.png'));
let index = new Packet();

for (let i = 0; i < sprites.length; i++) {
    let safeName = sprites[i].replace('.png', '');
    console.log(safeName);

    let data = new Packet();
    data.p2(index.pos);

    let img = await Jimp.read(`data/src/sprites/${safeName}.png`);
    let tileX = img.bitmap.width;
    let tileY = img.bitmap.height;

    let tileable = fs.existsSync(`data/src/sprites/${safeName}.meta`);
    if (tileable) {
        let metadata = fs.readFileSync(`data/src/sprites/${safeName}.meta`, 'utf8').split('x');
        tileX = parseInt(metadata[0]);
        tileY = parseInt(metadata[1]);
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
        console.error('too many colors');
        break;
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

    data.file(`dump/media/${safeName}.dat`);
}

index.file('dump/media/index.dat');
