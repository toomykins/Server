import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

const config = Jagfile.fromFile('dump/config');
const dat = config.read('obj.dat');

fs.writeFileSync('dump/obj.order', '');
fs.writeFileSync('dump/all.obj', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/obj.order', `obj_${i}=${i}\n`);

    if (i > 1) {
        fs.appendFileSync('dump/all.obj', `\n[obj_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.obj', `[obj_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            fs.appendFileSync('dump/all.obj', `model=model_${dat.g2()}\n`);
        } else if (code === 2) {
            fs.appendFileSync('dump/all.obj', `name=${dat.gjstr()}\n`);
        } else if (code === 3) {
            fs.appendFileSync('dump/all.obj', `desc=${dat.gjstr()}\n`);
        } else if (code === 4) {
            fs.appendFileSync('dump/all.obj', `2dzoom=${dat.g2()}\n`);
        } else if (code === 5) {
            fs.appendFileSync('dump/all.obj', `2dxan=${dat.g2s()}\n`);
        } else if (code === 6) {
            fs.appendFileSync('dump/all.obj', `2dyan=${dat.g2s()}\n`);
        } else if (code === 7) {
            fs.appendFileSync('dump/all.obj', `2dxof=${dat.g2s()}\n`);
        } else if (code === 8) {
            fs.appendFileSync('dump/all.obj', `2dyof=${dat.g2s()}\n`);
        } else if (code === 9) {
            fs.appendFileSync('dump/all.obj', `code9=yes\n`);
        } else if (code === 10) {
            fs.appendFileSync('dump/all.obj', `code10=seq_${dat.g2()}\n`);
        } else if (code === 11) {
            fs.appendFileSync('dump/all.obj', `stackable=yes\n`);
        } else if (code === 12) {
            fs.appendFileSync('dump/all.obj', `cost=${dat.g4()}\n`);
        } else if (code === 16) {
            fs.appendFileSync('dump/all.obj', `members=yes\n`);
        } else if (code === 23) {
            fs.appendFileSync('dump/all.obj', `manwear=model_${dat.g2()},${dat.g1b()}\n`);
        } else if (code === 24) {
            fs.appendFileSync('dump/all.obj', `manwear2=model_${dat.g2()}\n`);
        } else if (code === 25) {
            fs.appendFileSync('dump/all.obj', `womanwear=model_${dat.g2()},${dat.g1b()}\n`);
        } else if (code === 26) {
            fs.appendFileSync('dump/all.obj', `womanwear2=model_${dat.g2()}\n`);
        } else if (code >= 30 && code < 35) {
            fs.appendFileSync('dump/all.obj', `op${(code - 30) + 1}=${dat.gjstr()}\n`);
        } else if (code >= 35 && code < 40) {
            fs.appendFileSync('dump/all.obj', `iop${(code - 35) + 1}=${dat.gjstr()}\n`);
        } else if (code === 40) {
            const recol = dat.g1();

            for (let j = 1; j <= recol; j++) {
                fs.appendFileSync('dump/all.obj', `recol${j}s=${dat.g2()}\nrecol${j}d=${dat.g2()}\n`);
            }
        } else if (code === 78) {
            fs.appendFileSync('dump/all.obj', `manwear3=model_${dat.g2()}\n`);
        } else if (code === 79) {
            fs.appendFileSync('dump/all.obj', `womanwear3=model_${dat.g2()}\n`);
        } else if (code === 90) {
            fs.appendFileSync('dump/all.obj', `manhead=model_${dat.g2()}\n`);
        } else if (code === 91) {
            fs.appendFileSync('dump/all.obj', `womanhead=model_${dat.g2()}\n`);
        } else if (code === 92) {
            fs.appendFileSync('dump/all.obj', `manhead2=model_${dat.g2()}\n`);
        } else if (code === 93) {
            fs.appendFileSync('dump/all.obj', `womanhead2=model_${dat.g2()}\n`);
        } else if (code === 95) {
            fs.appendFileSync('dump/all.obj', `zan2d=${dat.g2()}\n`);
        } else if (code === 97) {
            fs.appendFileSync('dump/all.obj', `certlink=obj_${dat.g2()}\n`);
        } else if (code === 98) {
            fs.appendFileSync('dump/all.obj', `certtemplate=obj_${dat.g2()}\n`);
        } else if (code >= 100 && code < 110) {
            fs.appendFileSync('dump/all.obj', `count${(code - 100) + 1}=${dat.g2()},${dat.g2()}\n`);
        }
    }

    fs.appendFileSync('dump/all.obj', '\n');
}
