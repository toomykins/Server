import fs from 'fs';
import Jagfile from '#io/Jagfile.js';
import Pix from './Pix.js';

console.log('Unpacking title...');

const jag = Jagfile.fromFile('dump/title');

let title = jag.read('title.dat');
title.p1(0xFF);
title.toFile('data/src/binary/title.jpg');

let logo = new Pix(jag, 'logo');
fs.writeFileSync('data/src/sprites/title/logo.png', await logo.toPng());

let titlebox = new Pix(jag, 'titlebox');
fs.writeFileSync('data/src/sprites/title/titlebox.png', await titlebox.toPng());

let titlebutton = new Pix(jag, 'titlebutton');
fs.writeFileSync('data/src/sprites/title/titlebutton.png', await titlebutton.toPng());

let runesCount = Pix.count(jag, 'runes');
for (let i = 0; i < runesCount; i++) {
    let runes = new Pix(jag, 'runes', i);
    fs.mkdirSync('data/src/sprites/title/runes', { recursive: true });
    fs.writeFileSync(`data/src/sprites/title/runes/${i}.png`, await runes.toPng());
}

// TODO: font sprite atlases

for (let i = 0; i < 94; i++) {
    let p11 = new Pix(jag, 'p11', i);
    fs.mkdirSync('data/src/sprites/title/p11', { recursive: true });
    fs.writeFileSync(`data/src/sprites/title/p11/${i}.png`, await p11.toPng());
}

for (let i = 0; i < 94; i++) {
    let p12 = new Pix(jag, 'p12', i);
    fs.mkdirSync('data/src/sprites/title/p12', { recursive: true });
    fs.writeFileSync(`data/src/sprites/title/p12/${i}.png`, await p12.toPng());
}

for (let i = 0; i < 94; i++) {
    let b12 = new Pix(jag, 'b12', i);
    fs.mkdirSync('data/src/sprites/title/b12', { recursive: true });
    fs.writeFileSync(`data/src/sprites/title/b12/${i}.png`, await b12.toPng());
}

for (let i = 0; i < 94; i++) {
    let q8 = new Pix(jag, 'q8', i);
    fs.mkdirSync('data/src/sprites/title/q8', { recursive: true });
    fs.writeFileSync(`data/src/sprites/title/q8/${i}.png`, await q8.toPng());
}
