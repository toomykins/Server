import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/pack/Pix.js';

let index = new Packet();

// fonts
let b12 = await convertImage(index, 'data/src/fonts', 'b12', { tileX: 20, tileY: 20 });
b12.file('data/pack/client/title.jag/b12.dat');

let p11 = await convertImage(index, 'data/src/fonts', 'p11', { tileX: 20, tileY: 20 });
p11.file('data/pack/client/title.jag/p11.dat');

let p12 = await convertImage(index, 'data/src/fonts', 'p12', { tileX: 20, tileY: 20 });
p12.file('data/pack/client/title.jag/p12.dat');

let q8 = await convertImage(index, 'data/src/fonts', 'q8', { tileX: 20, tileY: 20 });
q8.file('data/pack/client/title.jag/q8.dat');

// flame masks
let runes = await convertImage(index, 'data/src/binary', 'runes', { tileX: 96, tileY: 96 });
runes.file('data/pack/client/title.jag/runes.dat');

// title screen elements
let logo = await convertImage(index, 'data/src/binary', 'logo');
logo.file('data/pack/client/title.jag/logo.dat');

let titlebox = await convertImage(index, 'data/src/binary', 'titlebox');
titlebox.file('data/pack/client/title.jag/titlebox.dat');

let titlebutton = await convertImage(index, 'data/src/binary', 'titlebutton');
titlebutton.file('data/pack/client/title.jag/titlebutton.dat');

index.file('data/pack/client/title.jag/index.dat');

// background image
let title = Packet.file('data/src/binary/title.jpg');
title.p1(0); // invalidate the JPEG header so it can't be seen in a viewer
title.file('data/pack/client/title.jag/title.dat', title.length);
