import fs from 'fs';
import Jimp from 'jimp';

import Jagfile from '#jagex2/io/Jagfile.js';
import { pixSize, countPix, unpackPix } from '#lostcity/tools/unpack/Pix.js';

let title = Jagfile.load('data/pack/client/title');

let jpg = title.read('title.dat');
jpg.p1(0xFF); // restore JPEG header
jpg.save('data/src/binary/title.jpg', jpg.length);

let index = title.read('index.dat');
for (let i = 0; i < title.fileCount; i++) {
    if (title.fileName[i] === 'index.dat' || title.fileName[i] === 'title.dat') {
        continue;
    }

    let data = title.read(title.fileName[i]);
    let size = pixSize(data, index);
    let count = countPix(data, index);
    console.log(title.fileName[i], count, size.width + 'x' + size.height);

    let dest = 'title';
    let safeName = title.fileName[i].replace('.dat', '');
    if (safeName === 'p11' || safeName === 'p12' || safeName === 'b12' || safeName === 'q8') {
        dest = 'fonts';
    }

    if (count === 1) {
        let pix = unpackPix(data, index);
        await pix.img.writeAsync(`data/src/${dest}/${safeName}.png`);
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

        let meta = `${size.width}x${size.height}\n`;
        for (let j = 0; j < count; j++) {
            let x = j % width;
            let y = Math.floor(j / width);

            sheet.composite(sprites[j].img, (x * size.width) + sprites[j].cropX, (y * size.height) + sprites[j].cropY);
            meta += `${sprites[j].cropX},${sprites[j].cropY},${sprites[j].width},${sprites[j].height}\n`;
        }

        await sheet.writeAsync(`data/src/${dest}/${safeName}.png`);

        if (meta.length) {
            fs.writeFileSync(`data/src/${dest}/${safeName}.sprite`, meta);
        }
    }
}
