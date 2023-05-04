import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking textures...');

const jag = Jagfile.fromFile('dump/textures');

if (!fs.existsSync('dump/textures.raw')) {
    fs.mkdirSync('dump/textures.raw', { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile('dump/textures.raw/' + name);
}
