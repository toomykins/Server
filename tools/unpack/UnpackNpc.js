import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking npc.dat...');

const jag = Jagfile.fromFile('dump/config');
const dat = jag.read('npc.dat');

fs.writeFileSync('dump/npc.order', '');
fs.writeFileSync('dump/all.npc', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/npc.order', `npc_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.npc', `\n[npc_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.npc', `[npc_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            const models = dat.g1();

            for (let j = 1; j <= models; j++) {
                fs.appendFileSync('dump/all.npc', `model${j}=model_${dat.g2()}\n`);
            }
        } else if (code === 2) {
            fs.appendFileSync('dump/all.npc', `name=${dat.gjstr()}\n`);
        } else if (code === 3) {
            fs.appendFileSync('dump/all.npc', `desc=${dat.gjstr()}\n`);
        } else if (code === 12) {
            fs.appendFileSync('dump/all.npc', `size=${dat.g1()}\n`);
        } else if (code === 13) {
            fs.appendFileSync('dump/all.npc', `readyanim=seq_${dat.g2()}\n`);
        } else if (code === 14) {
            fs.appendFileSync('dump/all.npc', `walkanim=seq_${dat.g2()}\n`);
        } else if (code === 16) {
            fs.appendFileSync('dump/all.npc', `alpha=yes\n`);
        } else if (code === 17) {
            fs.appendFileSync('dump/all.npc', `walkanim=seq_${dat.g2()}\nwalkanim_b=seq_${dat.g2()}\nwalkanim_r=seq_${dat.g2()}\nwalkanim_l=seq_${dat.g2()}\n`);
        } else if (code >= 30 && code < 40) {
            fs.appendFileSync('dump/all.npc', `op${(code - 30) + 1}=${dat.gjstr()}\n`);
        } else if (code === 40) {
            const recol = dat.g1();

            for (let j = 1; j <= recol; j++) {
                fs.appendFileSync('dump/all.npc', `recol${j}s=${dat.g2()}\nrecol${j}d=${dat.g2()}\n`);
            }
        } else if (code === 60) {
            const heads = dat.g1();

            for (let j = 1; j <= heads; j++) {
                fs.appendFileSync('dump/all.npc', `head${j}=model_${dat.g2()}\n`);
            }
        } else if (code === 90) {
            fs.appendFileSync('dump/all.npc', `code90=${dat.g2()}\n`);
        } else if (code === 91) {
            fs.appendFileSync('dump/all.npc', `code91=${dat.g2()}\n`);
        } else if (code === 92) {
            fs.appendFileSync('dump/all.npc', `code92=${dat.g2()}\n`);
        } else if (code === 93) {
            fs.appendFileSync('dump/all.npc', `visonmap=no\n`);
        } else if (code === 95) {
            fs.appendFileSync('dump/all.npc', `vislevel=${dat.g2()}\n`);
        } else if (code === 97) {
            fs.appendFileSync('dump/all.npc', `resizeh=${dat.g2()}\n`);
        } else if (code === 98) {
            fs.appendFileSync('dump/all.npc', `resizev=${dat.g2()}\n`);
        } else {
            throw new Error(`Unrecognized npc config code: ${code}`);
        }
    }
}
