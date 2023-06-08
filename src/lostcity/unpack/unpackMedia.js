import fs from 'fs';
import Jimp from 'jimp';

import Jagfile from '#jagex2/io/Jagfile.js';
import { pixSize, countPix, unpackPix } from '#lostcity/unpack/Pix.js';

let media = Jagfile.load('data/pack/client/media');

let index = media.read('index.dat');
for (let i = 0; i < media.fileCount; i++) {
    if (media.fileName[i] === 'index.dat') {
        continue;
    }

    let data = media.read(media.fileName[i]);
    let size = pixSize(data, index);
    let count = countPix(data, index);
    console.log(media.fileName[i], count, size.width + 'x' + size.height);

    let safeName = media.fileName[i].replace('.dat', '');
    if (count === 1) {
        let pix = unpackPix(data, index);
        await pix.img.writeAsync(`data/src/sprites/${safeName}.png`);
    } else {
        // sprite sheet!
        let sprites = [];
        for (let j = 0; j < count; j++) {
            sprites[j] = unpackPix(data, index, j);
        }

        let width = Math.ceil(Math.sqrt(count));
        let height = Math.ceil(count / width);
        let sheet = new Jimp(width * size.width, height * size.height);
        sheet.background(0xFFFFFFFF);

        for (let j = 0; j < count; j++) {
            let x = j % width;
            let y = Math.floor(j / width);

            sheet.composite(sprites[j].img, x * size.width + sprites[j].cropX, y * size.height + sprites[j].cropY);
        }

        await sheet.writeAsync(`data/src/sprites/${safeName}.png`);
        fs.writeFileSync(`data/src/sprites/${safeName}.meta`, `${size.width}x${size.height}`);
    }
}
