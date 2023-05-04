import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking title...');

const jag = Jagfile.fromFile('dump/title');

if (!fs.existsSync('dump/title.raw')) {
    fs.mkdirSync('dump/title.raw', { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile('dump/title.raw/' + name);
}
