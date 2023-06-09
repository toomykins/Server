import fs from 'fs';

import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/pack/Pix.js';

let index = new Packet();

let pack = fs.readFileSync('data/pack/texture.pack', 'ascii').replaceAll('\r\n', '\n').split('\n').filter(x => x).map(x => {
    let parts = x.split('=');
    return { id: parseInt(parts[0]), name: parts[1] };
});

for (let i = 0; i < pack.length; i++) {
    let data = await convertImage(index, 'data/src/textures', pack[i].name);
    data.save(`data/pack/client/textures.jag/${pack[i].id}.dat`);
}

index.save('data/pack/client/textures.jag/index.dat');
