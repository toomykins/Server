import fs from 'fs';
import Jagfile from '#io/Jagfile.js';

console.log('Unpacking loc.dat...');

const jag = Jagfile.fromFile('dump/config');
const dat = jag.read('loc.dat');

fs.writeFileSync('dump/loc.order', '');
fs.writeFileSync('dump/all.loc', '');

const count = dat.g2();
for (let i = 0; i < count; i++) {
    fs.appendFileSync('dump/loc.order', `loc_${i}=${i}\n`);

    if (i > 0) {
        fs.appendFileSync('dump/all.loc', `\n[loc_${i}]\n`);
    } else {
        fs.appendFileSync('dump/all.loc', `[loc_${i}]\n`);
    }

    while (true) {
        const code = dat.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            const models = dat.g1();

            for (let j = 1; j <= models; j++) {
                const model = dat.g2();
                let shape = dat.g1();

                // shape is part of the model filename, but we can't edit the model packorder names here
                switch (shape) {
                    case 10:
                        shape = '^centrepiece_straight';
                        break;
                    case 0:
                        shape = '^wall_straight';
                        break;
                    case 1:
                        shape = '^wall_diagonalcorner';
                        break;
                    case 2:
                        shape = '^wall_l';
                        break;
                    case 3:
                        shape = '^wall_squarecorner';
                        break;
                    case 9:
                        shape = '^wall_diagonal';
                        break;
                    case 4:
                        shape = '^walldecor_straight';
                        break;
                    case 5:
                        shape = '^walldecor_straight_offset';
                        break;
                    case 6:
                        shape = '^walldecor_diagonal_nooffset';
                        break;
                    case 7:
                        shape = '^walldecor_diagonal_offset';
                        break;
                    case 8:
                        shape = '^walldecor_diagonal_both';
                        break;
                    case 11:
                        shape = '^centrepiece_diagonal';
                        break;
                    case 12:
                        shape = '^roof_straight';
                        break;
                    case 13:
                        shape = '^roof_diagonal_with_roofedge';
                        break;
                    case 14:
                        shape = '^roof_diagonal';
                        break;
                    case 15:
                        shape = '^roof_l_concave';
                        break;
                    case 16:
                        shape = '^roof_l_convex';
                        break;
                    case 17:
                        shape = '^roof_flat';
                        break;
                    case 18:
                        shape = '^roofedge_straight';
                        break;
                    case 19:
                        shape = '^roofedge_diagonalcorner';
                        break;
                    case 20:
                        shape = '^roofedge_l';
                        break;
                    case 21:
                        shape = '^roofedge_squarecorner';
                        break;
                    case 22:
                        shape = '^grounddecor';
                        break;
                }

                fs.appendFileSync('dump/all.loc', `model${j}=model_${model},${shape}\n`);
            }
        } else if (code === 2) {
            fs.appendFileSync('dump/all.loc', `name=${dat.gjstr()}\n`);
        } else if (code === 3) {
            fs.appendFileSync('dump/all.loc', `desc=${dat.gjstr()}\n`);
        } else if (code === 14) {
            fs.appendFileSync('dump/all.loc', `width=${dat.g1()}\n`);
        } else if (code === 15) {
            fs.appendFileSync('dump/all.loc', `length=${dat.g1()}\n`);
        } else if (code === 17) {
            fs.appendFileSync('dump/all.loc', `blockwalk=no\n`);
        } else if (code === 18) {
            fs.appendFileSync('dump/all.loc', `blockrange=no\n`);
        } else if (code === 19) {
            const active = dat.gbool();

            fs.appendFileSync('dump/all.loc', `active=${active ? 'yes' : 'no'}\n`);
        } else if (code === 21) {
            fs.appendFileSync('dump/all.loc', `hillskew=yes\n`);
        } else if (code === 22) {
            fs.appendFileSync('dump/all.loc', `sharelight=yes\n`);
        } else if (code === 23) {
            fs.appendFileSync('dump/all.loc', `occlude=yes\n`);
        } else if (code === 24) {
            fs.appendFileSync('dump/all.loc', `anim=seq_${dat.g2()}\n`);
        } else if (code === 25) {
            fs.appendFileSync('dump/all.loc', `alpha=yes\n`);
        } else if (code === 28) {
            fs.appendFileSync('dump/all.loc', `walloff=${dat.g1()}\n`);
        } else if (code === 29) {
            fs.appendFileSync('dump/all.loc', `ambient=${dat.g1b()}\n`);
        } else if (code === 39) {
            fs.appendFileSync('dump/all.loc', `contrast=${dat.g1b()}\n`);
        } else if (code >= 30 && code < 35) {
            fs.appendFileSync('dump/all.loc', `op${(code - 30) + 1}=${dat.gjstr()}\n`);
        } else if (code === 40) {
            const recol = dat.g1();

            for (let j = 1; j <= recol; j++) {
                fs.appendFileSync('dump/all.loc', `recol${j}s=${dat.g2()}\nrecol${j}d=${dat.g2()}\n`);
            }
        } else if (code === 60) {
            fs.appendFileSync('dump/all.loc', `mapfunction=${dat.g2()}\n`);
        } else if (code === 62) {
            fs.appendFileSync('dump/all.loc', `mirror=yes\n`);
        } else if (code === 64) {
            fs.appendFileSync('dump/all.loc', `shadow=no\n`);
        } else if (code === 65) {
            fs.appendFileSync('dump/all.loc', `resizex=${dat.g2()}\n`);
        } else if (code === 66) {
            fs.appendFileSync('dump/all.loc', `resizey=${dat.g2()}\n`);
        } else if (code === 67) {
            fs.appendFileSync('dump/all.loc', `resizez=${dat.g2()}\n`);
        } else if (code === 68) {
            fs.appendFileSync('dump/all.loc', `mapscene=${dat.g2()}\n`);
        } else if (code === 69) {
            fs.appendFileSync('dump/all.loc', `blocksides=${dat.g1()}\n`);
        } else if (code === 70) {
            fs.appendFileSync('dump/all.loc', `xoff=${dat.g2s()}\n`);
        } else if (code === 71) {
            fs.appendFileSync('dump/all.loc', `yoff=${dat.g2s()}\n`);
        } else if (code === 72) {
            fs.appendFileSync('dump/all.loc', `zoff=${dat.g2s()}\n`);
        } else if (code === 73) {
            fs.appendFileSync('dump/all.loc', `forcedecor=yes\n`);
        } else {
            throw new Error(`Unrecognized loc config code: ${code}`);
        }
    }
}
