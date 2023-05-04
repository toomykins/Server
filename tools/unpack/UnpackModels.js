import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking models...');

const jag = Jagfile.fromFile('dump/models');

if (!fs.existsSync('dump/models.raw')) {
    fs.mkdirSync('dump/models.raw', { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile('dump/models.raw/' + name);
}
