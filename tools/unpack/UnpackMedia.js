import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking media...');

const jag = Jagfile.fromFile('dump/media');

if (!fs.existsSync('dump/media.raw')) {
    fs.mkdirSync('dump/media.raw', { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile('dump/media.raw/' + name);
}
