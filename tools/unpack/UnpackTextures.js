import fs from 'fs';
import Jagfile from '#io/Jagfile.js';
import Pix from './Pix.js';

console.log('Unpacking textures...');

const jag = Jagfile.fromFile('dump/textures');

for (let i = 0; i < 50; i++) {
    let texture = new Pix(jag, `${i}`);
    fs.writeFileSync(`data/src/sprites/textures/${i}.png`, await texture.toPng());
}
