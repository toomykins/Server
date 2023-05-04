import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking sounds...');

const jag = Jagfile.fromFile('dump/sounds');

if (!fs.existsSync('dump/sounds.raw')) {
    fs.mkdirSync('dump/sounds.raw', { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile('dump/sounds.raw/' + name);
}
