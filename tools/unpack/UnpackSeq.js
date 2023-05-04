import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking seq.dat...');

const config = Jagfile.fromFile('dump/config');
const dat = config.read('seq.dat');

fs.writeFileSync('dump/seq.order', '');
fs.writeFileSync('dump/all.seq', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/seq.order', `seq_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.seq', `\n[seq_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.seq', `[seq_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            const frames = dat.g1();

            for (let j = 1; j <= frames; j++) {
                const frame = dat.g2();
                const iframe = dat.g2();
                const delay = dat.g2();

                fs.appendFileSync('dump/all.seq', `frame${j}=animframe_${frame}\n`);

                if (iframe !== 65535) {
                    fs.appendFileSync('dump/all.seq', `iframe${j}=animframe_${iframe}\n`);
                }

                if (delay !== 0) {
                    fs.appendFileSync('dump/all.seq', `delay${j}=${delay}\n`);
                }
            }
        } else if (code === 2) {
            fs.appendFileSync('dump/all.seq', `replayoff=${dat.g2()}\n`);
        } else if (code === 3) {
            const count = dat.g1();

            for (let j = 1; j <= count; j++) {
                fs.appendFileSync('dump/all.seq', `walkmerge${j}=label_${dat.g1()}\n`);
            }
        } else if (code === 4) {
            fs.appendFileSync('dump/all.seq', `stretches=yes\n`);
        } else if (code === 5) {
            fs.appendFileSync('dump/all.seq', `priority=${dat.g1()}\n`);
        } else if (code === 6) {
            let obj = dat.g2();
            if (obj === 0) {
                fs.appendFileSync('dump/all.seq', `mainhand=hide\n`);
            } else {
                fs.appendFileSync('dump/all.seq', `mainhand=obj_${obj}\n`);
            }
        } else if (code === 7) {
            let obj = dat.g2();
            if (obj === 0) {
                fs.appendFileSync('dump/all.seq', `offhand=hide\n`);
            } else {
                fs.appendFileSync('dump/all.seq', `offhand=obj_${obj}\n`);
            }
        } else if (code === 8) {
            fs.appendFileSync('dump/all.seq', `replaycount=${dat.g1()}\n`);
        } else {
            throw new Error(`Unrecognized seq config code: ${code}`);
        }
    }
}
