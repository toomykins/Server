import fs from 'fs';

import Jagfile from '#jagex2/io/Jagfile.js';
import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/tools/pack/Pix.js';

let sprites = fs.readdirSync('data/src/sprites').filter(x => x.endsWith('.png'));
let index = new Packet();
let jag = new Jagfile();

for (let i = 0; i < sprites.length; i++) {
    let safeName = sprites[i].replace('.png', '');
    let data = await convertImage(index, 'data/src/sprites', safeName);
    jag.write(`${safeName}.dat`, data);
    // data.save(`data/pack/client/media.jag/${safeName}.dat`);
}

jag.write('index.dat', index);
// index.save('data/pack/client/media.jag/index.dat');

jag.save('data/pack/client/media');

console.log(Jagfile.load('data/pack/client/media'));
