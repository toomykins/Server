import fs from 'fs';
import Jagfile from '#io/Jagfile.js';
import Pix from './Pix.js';

console.log('Unpacking media...');

const jag = Jagfile.fromFile('dump/media');

for (let file of jag.files) {
    if (file.name === 'index.dat') {
        continue;
    }

    let name = file.name.substring(0, file.name.length - '.dat'.length);
    let count = Pix.count(jag, name);

    if (count > 1) {
        for (let i = 0; i < count; i++) {
            let sprite = new Pix(jag, name, i);
            fs.mkdirSync(`data/src/sprites/media/${name}`, { recursive: true });
            let png = await sprite.toPng();
            if (png) {
                fs.writeFileSync(`data/src/sprites/media/${name}/${i}.png`, await sprite.toPng());
            }
        }
    } else {
        let sprite = new Pix(jag, name);
        fs.writeFileSync(`data/src/sprites/media/${name}.png`, await sprite.toPng());
    }
}
