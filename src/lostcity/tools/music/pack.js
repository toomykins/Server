import fs from 'fs';

import BZip2 from '#jagex2/io/BZip2.js';

console.log('---- music ----');

console.log('----- jingles ------');
fs.readdirSync('data/src/jingles').forEach(f => {
    let file = fs.readFileSync(`data/src/jingles/${f}`);

    let safeName = f.split('.')[0];
    if (fs.existsSync(`data/pack/server/jingles/${safeName}`)) {
        // TODO: mtime-based check
        return;
    }

    let compressed = BZip2.compress(file, true);

    // TODO: base37 name
    // TODO: file crc
    fs.mkdirSync('data/pack/server/jingles', { recursive: true });
    fs.writeFileSync(`data/pack/server/jingles/${safeName}`, compressed);
});

console.log('----- songs ------');
fs.readdirSync('data/src/songs').forEach(f => {
    let file = fs.readFileSync(`data/src/songs/${f}`);

    let safeName = f.split('.')[0];
    if (fs.existsSync(`data/pack/server/songs/${safeName}`)) {
        // TODO: mtime-based check
        return;
    }

    let compressed = BZip2.compress(file, true);

    // TODO: base37 name
    // TODO: file crc
    fs.mkdirSync('data/pack/server/songs', { recursive: true });
    fs.writeFileSync(`data/pack/server/songs/${safeName}`, compressed);
});
