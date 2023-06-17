import fs from 'fs';

import BZip2 from '#jagex2/io/BZip2.js';

console.log('---- music ----');

console.log('----- jingles ------');
fs.readdirSync('data/src/jingles').forEach(f => {
    let file = fs.readFileSync(`data/src/jingles/${f}`);

    if (fs.existsSync(`data/pack/server/jingles/${f}`)) {
        // TODO: mtime-based check
        return;
    }

    let compressed = BZip2.compress(file, true);

    fs.mkdirSync('data/pack/server/jingles', { recursive: true });
    fs.writeFileSync(`data/pack/server/jingles/${f}`, compressed);
});

console.log('----- songs ------');
fs.readdirSync('data/src/songs').forEach(f => {
    let file = fs.readFileSync(`data/src/songs/${f}`);

    if (fs.existsSync(`data/pack/server/songs/${f}`)) {
        // TODO: mtime-based check
        return;
    }

    let compressed = BZip2.compress(file, true);

    fs.mkdirSync('data/pack/server/songs', { recursive: true });
    fs.writeFileSync(`data/pack/server/songs/${f}`, compressed);
});
