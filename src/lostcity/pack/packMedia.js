import fs from 'fs';

import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/pack/Pix.js';

let sprites = fs.readdirSync('data/src/sprites').filter(x => x.endsWith('.png'));
let index = new Packet();

for (let i = 0; i < sprites.length; i++) {
    let safeName = sprites[i].replace('.png', '');
    let data = await convertImage(index, 'data/src/sprites', safeName);
    data.save(`data/pack/client/media.jag/${safeName}.dat`);
}

index.save('data/pack/client/media.jag/index.dat');
