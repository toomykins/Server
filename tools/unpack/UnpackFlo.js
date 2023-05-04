import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking flo.dat...');

const config = Jagfile.fromFile('dump/config');
const dat = config.read('flo.dat');

fs.writeFileSync('dump/flo.order', '');
fs.writeFileSync('dump/all.flo', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/flo.order', `flo_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.flo', `\n[flo_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.flo', `[flo_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            fs.appendFileSync('dump/all.flo', `rgb=0x${dat.g3().toString(16)}\n`);
        } else if (code === 2) {
            fs.appendFileSync('dump/all.flo', `texture=${dat.g1()}\n`);
        } else if (code === 3) {
            fs.appendFileSync('dump/all.flo', `opcode3=yes\n`);
        } else if (code === 5) {
            fs.appendFileSync('dump/all.flo', `occlude=no\n`);
        } else if (code === 6) {
            fs.appendFileSync('dump/all.flo', `editname=${dat.gjstr()}\n`);
        } else {
            throw new Error(`Unrecognized flo config code: ${code}`);
        }
    }
}
