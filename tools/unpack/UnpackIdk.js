import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking idk.dat...');

const config = Jagfile.fromFile('dump/config');
const dat = config.read('idk.dat');

fs.writeFileSync('dump/idk.order', '');
fs.writeFileSync('dump/all.idk', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/idk.order', `idk_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.idk', `\n[idk_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.idk', `[idk_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            let bodypart = dat.g1();

            switch (bodypart) {
                case 0:
                    bodypart = '^bodypart_man_hair';
                    break;
                case 1:
                    bodypart = '^bodypart_man_jaw';
                    break;
                case 2:
                    bodypart = '^bodypart_man_torso';
                    break;
                case 3:
                    bodypart = '^bodypart_man_arms';
                    break;
                case 4:
                    bodypart = '^bodypart_man_hands';
                    break;
                case 5:
                    bodypart = '^bodypart_man_legs';
                    break;
                case 6:
                    bodypart = '^bodypart_man_feet';
                    break;
                case 7:
                    bodypart = '^bodypart_woman_hair';
                    break;
                case 8:
                    bodypart = '^bodypart_woman_jaw';
                    break;
                case 9:
                    bodypart = '^bodypart_woman_torso';
                    break;
                case 10:
                    bodypart = '^bodypart_woman_arms';
                    break;
                case 11:
                    bodypart = '^bodypart_woman_hands';
                    break;
                case 12:
                    bodypart = '^bodypart_woman_legs';
                    break;
                case 13:
                    bodypart = '^bodypart_woman_feet';
                    break;
            }

            fs.appendFileSync('dump/all.idk', `bodypart=${bodypart}\n`);
        } else if (code === 2) {
            const models = dat.g1();

            for (let j = 1; j <= models; j++) {
                fs.appendFileSync('dump/all.idk', `model${j}=model_${dat.g2()}\n`);
            }
        } else if (code === 3) {
            fs.appendFileSync('dump/all.idk', `disable=yes\n`);
        } else if (code >= 40 && code < 50) {
            fs.appendFileSync('dump/all.idk', `recol${(code - 40) + 1}s=${dat.g2()}\n`);
        } else if (code >= 50 && code < 60) {
            fs.appendFileSync('dump/all.idk', `recol${(code - 50) + 1}d=${dat.g2()}\n`);
        } else if (code >= 60 && code < 70) {
            fs.appendFileSync('dump/all.idk', `head${(code - 60) + 1}=model_${dat.g2()}\n`);
        } else {
            throw new Error(`Unrecognized idk config code: ${code}`);
        }
    }
}
