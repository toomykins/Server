import fs from 'fs';

import Packet from '#jagex2/io/Packet.js';
import { loadOrder, loadPack } from '#lostcity/tools/pack/NameMap.js';

let order = loadOrder('data/pack/sound.order');
let pack = loadPack('data/pack/sound.pack');

let out = new Packet();
for (let i = 0; i < order.length; i++) {
    let id = Number(order[i]);
    let name = pack[id];

    out.p2(id);
    let data = fs.readFileSync(`data/src/sounds/${name}.synth`);
    out.pdata(data);
}
out.p2(-1);

out.save('data/pack/client/sounds.jag/sounds.dat');
