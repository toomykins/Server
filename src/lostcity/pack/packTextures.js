import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/pack/Pix.js';

let index = new Packet();

for (let i = 0; i < 50; i++) {
    let safeName = i.toString();
    let data = await convertImage(index, 'data/src/textures', safeName);
    data.file(`data/pack/client/textures.jag/${safeName}.dat`);
}

index.file('data/pack/client/textures.jag/index.dat');
