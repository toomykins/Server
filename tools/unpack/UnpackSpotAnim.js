import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking spotanim.dat...');

const config = Jagfile.fromFile('dump/config');
const dat = config.read('spotanim.dat');

fs.writeFileSync('dump/spotanim.order', '');
fs.writeFileSync('dump/all.spotanim', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/spotanim.order', `spotanim_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.spotanim', `\n[spotanim_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.spotanim', `[spotanim_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            fs.appendFileSync('dump/all.spotanim', `model=model_${dat.g2()}\n`);
        } else if (code === 2) {
            fs.appendFileSync('dump/all.spotanim', `anim=seq_${dat.g2()}\n`);
        } else if (code === 3) {
            fs.appendFileSync('dump/all.spotanim', `alpha=yes\n`);
        } else if (code === 4) {
            fs.appendFileSync('dump/all.spotanim', `resizeh=${dat.g2()}\n`);
        } else if (code === 5) {
            fs.appendFileSync('dump/all.spotanim', `resizev=${dat.g2()}\n`);
        } else if (code === 6) {
            fs.appendFileSync('dump/all.spotanim', `rotation=${dat.g2()}\n`);
        } else if (code === 7) {
            fs.appendFileSync('dump/all.spotanim', `ambient=${dat.g1()}\n`);
        } else if (code === 8) {
            fs.appendFileSync('dump/all.spotanim', `contrast=${dat.g1()}\n`);
        } else if (code >= 40 && code < 50) {
            fs.appendFileSync('dump/all.spotanim', `recol${(code - 40) + 1}s=${dat.g2()}\n`);
        } else if (code >= 50 && code < 60) {
            fs.appendFileSync('dump/all.spotanim', `recol${(code - 50) + 1}d=${dat.g2()}\n`);
        } else {
            throw new Error(`Unrecognized spotanim config code: ${code}`);
        }
    }
}
