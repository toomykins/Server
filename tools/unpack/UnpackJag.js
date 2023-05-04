import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

if (process.argv.length < 3) {
    console.log('Usage: node UnpackJag.js <jagfile>');
    process.exit(1);
}

let jagname = process.argv[2];

console.log(`Unpacking ${jagname}...`);
const jag = Jagfile.fromFile(`${jagname}`);

if (!fs.existsSync(`${jagname}.raw`)) {
    fs.mkdirSync(`${jagname}.raw`, { recursive: true });
}

for (let file of jag.files) {
    let name = file.name;
    if (!name) {
        console.log('No known name for file', file.hashName);
        continue;
    }

    jag.read(name).toFile(`${jagname}.raw/${name}`);
}
