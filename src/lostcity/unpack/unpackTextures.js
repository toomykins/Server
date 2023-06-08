import fs from 'fs';
import Jimp from 'jimp';

import Jagfile from '#jagex2/io/Jagfile.js';
import { pixSize, unpackPix } from '#lostcity/unpack/Pix.js';

let textures = Jagfile.load('data/pack/client/textures');

// let sprites = [];

let index = textures.read('index.dat');
for (let i = 0; i < textures.fileCount; i++) {
    if (textures.fileName[i] === 'index.dat') {
        continue;
    }

    let data = textures.read(textures.fileName[i]);
    let size = pixSize(data, index);
    console.log(textures.fileName[i], size.width + 'x' + size.height);

    let safeName = textures.fileName[i].replace('.dat', '');
    // sprites[safeName] = unpackPix(data, index);
    let texture = unpackPix(data, index);

    await texture.img.writeAsync(`data/src/textures/${safeName}.png`);
}

// generate a spritesheet:
// let width = Math.ceil(Math.sqrt(sprites.length));
// let height = Math.ceil(sprites.length / width);
// let sheet = new Jimp(width * 128, height * 128);
// sheet.background(0xFFFFFFFF);

// for (let j = 0; j < sprites.length; j++) {
//     let x = j % width;
//     let y = Math.floor(j / width);

//     sheet.composite(sprites[j].img, x * 128 + sprites[j].cropX, y * 128 + sprites[j].cropY);
// }

// await sheet.writeAsync(`data/src/binary/textures.png`);
