import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking wordenc...');

const jag = Jagfile.fromFile('dump/wordenc');

if (!fs.existsSync('dump/wordenc.raw')) {
    fs.mkdirSync('dump/wordenc.raw', { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile('dump/wordenc.raw/' + name);
}
