import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/cache/pack/Pix.js';

let index = new Packet();

// fonts
let b12 = await convertImage(index, 'data/src/fonts', 'b12', { tileX: 20, tileY: 20 });
b12.save('data/pack/client/title.jag/b12.dat');

let p11 = await convertImage(index, 'data/src/fonts', 'p11', { tileX: 20, tileY: 20 });
p11.save('data/pack/client/title.jag/p11.dat');

let p12 = await convertImage(index, 'data/src/fonts', 'p12', { tileX: 20, tileY: 20 });
p12.save('data/pack/client/title.jag/p12.dat');

let q8 = await convertImage(index, 'data/src/fonts', 'q8', { tileX: 20, tileY: 20 });
q8.save('data/pack/client/title.jag/q8.dat');

// flame masks
let runes = await convertImage(index, 'data/src/title', 'runes', { tileX: 96, tileY: 96 });
runes.save('data/pack/client/title.jag/runes.dat');

// title screen elements
let logo = await convertImage(index, 'data/src/title', 'logo');
logo.save('data/pack/client/title.jag/logo.dat');

let titlebox = await convertImage(index, 'data/src/title', 'titlebox');
titlebox.save('data/pack/client/title.jag/titlebox.dat');

let titlebutton = await convertImage(index, 'data/src/title', 'titlebutton');
titlebutton.save('data/pack/client/title.jag/titlebutton.dat');

index.save('data/pack/client/title.jag/index.dat');

// background image
let title = Packet.load('data/src/binary/title.jpg');
title.p1(0); // invalidate the JPEG header so it can't be seen in a viewer
title.save('data/pack/client/title.jag/title.dat', title.length);
