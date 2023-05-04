import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking varp.dat...');

const jag = Jagfile.fromFile('dump/config');
const dat = jag.read('varp.dat');

fs.writeFileSync('dump/varp.order', '');
fs.writeFileSync('dump/all.varp', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/varp.order', `varp_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.varp', `\n[varp_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.varp', `[varp_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            fs.appendFileSync('dump/all.varp', `opcode1=${dat.g1()}\n`);
        } else if (code === 2) {
            fs.appendFileSync('dump/all.varp', `opcode2=${dat.g1()}\n`);
        } else if (code === 3) {
            fs.appendFileSync('dump/all.varp', `opcode3=${i}\n`);
        } else if (code === 4) {
            fs.appendFileSync('dump/all.varp', `opcode4=no\n`);
        } else if (code === 5) {
            fs.appendFileSync('dump/all.varp', `clientcode=${dat.g2()}\n`);
        } else if (code === 6) {
            fs.appendFileSync('dump/all.varp', `opcode6=yes\n`);
        } else if (code === 7) {
            fs.appendFileSync('dump/all.varp', `opcode7=${dat.g4()}\n`);
        } else if (code === 8) {
            fs.appendFileSync('dump/all.varp', `opcode8=yes\n`);
        } else if (code === 10) {
            fs.appendFileSync('dump/all.varp', `opcode10=${dat.gjstr()}\n`);
        } else {
            throw new Error(`Unrecognized varp config code: ${code}`);
        }
    }
}
