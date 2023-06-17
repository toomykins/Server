import Jagfile from '#jagex2/io/Jagfile.js';
import Packet from '#jagex2/io/Packet.js';
import { convertImage } from '#lostcity/tools/pack/Pix.js';

console.log('---- title ----');

let index = new Packet();
let jag = new Jagfile();

// fonts
let b12 = await convertImage(index, 'data/src/fonts', 'b12');
jag.write('b12.dat', b12);

let p11 = await convertImage(index, 'data/src/fonts', 'p11');
jag.write('p11.dat', p11);

let p12 = await convertImage(index, 'data/src/fonts', 'p12');
jag.write('p12.dat', p12);

let q8 = await convertImage(index, 'data/src/fonts', 'q8');
jag.write('q8.dat', q8);

// flame masks
let runes = await convertImage(index, 'data/src/title', 'runes');
jag.write('runes.dat', runes);

// title screen elements
let logo = await convertImage(index, 'data/src/title', 'logo');
// let logo = await convertImage(index, 'data/src/title', 'logo2'); // unfortunately logo was quantized to <32 colors, this is an attempt to restore it
jag.write('logo.dat', logo);

let titlebox = await convertImage(index, 'data/src/title', 'titlebox');
jag.write('titlebox.dat', titlebox);

let titlebutton = await convertImage(index, 'data/src/title', 'titlebutton');
jag.write('titlebutton.dat', titlebutton);

jag.write('index.dat', index);

// background image
let title = Packet.load('data/src/binary/title.jpg');
// title.p1(0); // invalidate the JPEG header so it can't be seen in a viewer
jag.write('title.dat', title);

jag.save('data/pack/client/title');
