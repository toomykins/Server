import fs from 'fs';

import Jagfile from '#jagex2/io/Jagfile.js';
import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/tools/pack/Pix.js';

/* order:
  'combatboxes.dat',   'staticons.dat',     'gnomeball_buttons.dat',
  'miscgraphics2.dat', 'miscgraphics3.dat', 'backleft1.dat',
  'backleft2.dat',     'tradebacking.dat',  'steelborder.dat',
  'prayeron.dat',      'mapflag.dat',       'compass.dat',
  'mapback.dat',       'headicons.dat',     'mapscene.dat',
  'staticons2.dat',    'cross.dat',         'magicoff.dat',
  'magicon2.dat',      'miscgraphics.dat',  'index.dat',
  'magicon.dat',       'combaticons.dat',   'mapdots.dat',
  'backtop1.dat',      'backtop2.dat',      'chatback.dat',
  'backbase1.dat',     'backbase2.dat',     'hitmarks.dat',
  'sideicons.dat',     'scrollbar.dat',     'prayerglow.dat',
  'redstone1.dat',     'redstone2.dat',     'redstone3.dat',
  'backhmid1.dat',     'backhmid2.dat',     'combaticons2.dat',
  'combaticons3.dat',  'backvmid1.dat',     'backvmid2.dat',
  'backvmid3.dat',     'wornicons.dat',     'sworddecor.dat',
  'invback.dat',       'leftarrow.dat',     'magicoff2.dat',
  'mapfunction.dat',   'prayeroff.dat',     'steelborder2.dat',
  'rightarrow.dat',    'backright1.dat',    'backright2.dat'
*/

console.log('---- media ----');
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
