import fs from 'fs';

import Jagfile from '#jagex2/io/Jagfile.js';

let config = Jagfile.load('data/pack/client/config');

// read all ahead of time

let flo = config.read('flo.dat');
let idk = config.read('idk.dat');
let loc = config.read('loc.dat');
let npc = config.read('npc.dat');
let obj = config.read('obj.dat');
let seq = config.read('seq.dat');
let spotanim = config.read('spotanim.dat');
let varp = config.read('varp.dat');

function append(file, str) {
    fs.appendFileSync(`data/src/scripts/${file}`, str + '\n');
}

// ----

fs.writeFileSync('data/src/scripts/all.flo', '');

let count = flo.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.flo', '');
    }

    append('all.flo', `[flo_${id}]`);

    while (true) {
        let code = flo.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            append('all.flo', `rgb=0x${flo.g3().toString(16).toUpperCase()}`);
        } else if (code === 2) {
            append('all.flo', `texture=${flo.g1()}`);
        } else if (code === 3) {
            append('all.flo', `overlay=yes`);
        } else if (code === 5) {
            append('all.flo', `occlude=no`);
        } else if (code === 6) {
            append('all.flo', `name=${flo.gjstr()}`);
        } else {
            console.error(`Unrecognized flo config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.idk', '');

count = idk.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.idk', '');
    }

    append('all.idk', `[idk_${id}]`);

    while (true) {
        let code = idk.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            append('all.idk', `type=${idk.g1()}`);
        } else if (code === 2) {
            let models = idk.g1();

            for (let i = 0; i < models; i++) {
                append('all.idk', `model${i + 1}=model_${idk.g2()}`);
            }
        } else if (code === 3) {
            append('all.idk', `disable=yes`);
        } else if (code >= 40 && code < 50) {
            append('all.idk', `recol${code - 40 + 1}s=${idk.g2()}`);
        } else if (code >= 50 && code < 60) {
            append('all.idk', `recol${code - 50 + 1}d=${idk.g2()}`);
        } else if (code >= 60 && code < 70) {
            append('all.idk', `head${code - 60 + 1}=model_${idk.g2()}`);
        } else {
            console.error(`Unrecognized idk config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.loc', '');

count = loc.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.loc', '');
    }

    append('all.loc', `[loc_${id}]`);

    while (true) {
        let code = loc.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            let models = loc.g1();

            for (let i = 0; i < models; i++) {
                append('all.loc', `model${i + 1}=model_${loc.g2()},${loc.g1()}`);
            }
        } else if (code === 2) {
            append('all.loc', `name=${loc.gjstr()}`);
        } else if (code === 3) {
            append('all.loc', `desc=${loc.gjstr()}`);
        } else if (code === 14) {
            append('all.loc', `width=${loc.g1()}`);
        } else if (code === 15) {
            append('all.loc', `length=${loc.g1()}`);
        } else if (code === 17) {
            append('all.loc', `blockwalk=no`);
        } else if (code === 18) {
            append('all.loc', `blockrange=no`);
        } else if (code === 19) {
            append('all.loc', `active=${loc.gbool() ? 'yes' : 'no'}`);
        } else if (code === 21) {
            append('all.loc', `hillskew=yes`);
        } else if (code === 22) {
            append('all.loc', `sharelight=yes`);
        } else if (code === 23) {
            append('all.loc', `occlude=yes`);
        } else if (code === 24) {
            append('all.loc', `anim=seq_${loc.g2()}`);
        } else if (code === 25) {
            append('all.loc', `disposeAlpha=yes`); // temp
        } else if (code === 28) {
            append('all.loc', `walloff=${loc.g1()}`);
        } else if (code === 29) {
            append('all.loc', `ambient=${loc.g1b()}`);
        } else if (code === 39) {
            append('all.loc', `contrast=${loc.g1b()}`);
        } else if (code >= 30 && code < 39) {
            append('all.loc', `op${code - 30 + 1}=${loc.gjstr()}`);
        } else if (code === 40) {
            let recol = loc.g1();

            for (let i = 0; i < recol; i++) {
                append('all.loc', `recol${i + 1}s=${loc.g2()}`);
                append('all.loc', `recol${i + 1}d=${loc.g2()}`);
            }
        } else if (code === 60) {
            append('all.loc', `mapfunction=${loc.g2()}`);
        } else if (code === 62) {
            append('all.loc', `mirror=yes`);
        } else if (code === 64) {
            append('all.loc', `shadow=yes`);
        } else if (code === 65) {
            append('all.loc', `resizex=${loc.g2()}`);
        } else if (code === 66) {
            append('all.loc', `resizey=${loc.g2()}`);
        } else if (code === 67) {
            append('all.loc', `resizez=${loc.g2()}`);
        } else if (code === 68) {
            append('all.loc', `mapscene=${loc.g2()}`);
        } else if (code === 69) {
            append('all.loc', `forceapproach=${loc.g1()}`);
        } else if (code === 70) {
            append('all.loc', `xoff=${loc.g2s()}`);
        } else if (code === 71) {
            append('all.loc', `yoff=${loc.g2s()}`);
        } else if (code === 72) {
            append('all.loc', `zoff=${loc.g2s()}`);
        } else if (code === 73) {
            append('all.loc', `forcedecor=yes`);
        } else {
            console.error(`Unrecognized loc config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.npc', '');

count = npc.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.npc', '');
    }

    append('all.npc', `[npc_${id}]`);

    while (true) {
        let code = npc.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            let models = npc.g1();

            for (let i = 0; i < models; i++) {
                append('all.npc', `model${i + 1}=model_${npc.g2()}`);
            }
        } else if (code === 2) {
            append('all.npc', `name=${npc.gjstr()}`);
        } else if (code === 3) {
            append('all.npc', `desc=${npc.gjstr()}`);
        } else if (code === 12) {
            append('all.npc', `size=${npc.g1()}`);
        } else if (code === 13) {
            append('all.npc', `readyanim=seq_${npc.g2()}`);
        } else if (code === 14) {
            append('all.npc', `walkanim=seq_${npc.g2()}`);
        } else if (code === 16) {
            append('all.npc', `disposeAlpha=yes`); // temp
        } else if (code === 17) {
            append('all.npc', `walkanim=seq_${npc.g2()}`);
            append('all.npc', `walkanim_b=seq_${npc.g2()}`);
            append('all.npc', `walkanim_r=seq_${npc.g2()}`);
            append('all.npc', `walkanim_l=seq_${npc.g2()}`);
        } else if (code >= 30 && code < 40) {
            append('all.npc', `op${code - 30 + 1}=${npc.gjstr()}`);
        } else if (code === 40) {
            let recol = npc.g1();

            for (let i = 0; i < recol; i++) {
                append('all.npc', `recol${i + 1}s=${npc.g2()}`);
                append('all.npc', `recol${i + 1}d=${npc.g2()}`);
            }
        } else if (code === 60) {
            let models = npc.g1();

            for (let i = 0; i < models; i++) {
                append('all.npc', `head${i + 1}=model_${npc.g2()}`);
            }
        } else if (code === 90) {
            append('all.npc', `code90=${npc.g2()}`);
        } else if (code === 91) {
            append('all.npc', `code91=${npc.g2()}`);
        } else if (code === 92) {
            append('all.npc', `code92=${npc.g2()}`);
        } else if (code === 93) {
            append('all.npc', `visonmap=no`);
        } else if (code === 95) {
            append('all.npc', `vislevel=${npc.g2()}`);
        } else if (code === 97) {
            append('all.npc', `resizeh=${npc.g2()}`);
        } else if (code === 98) {
            append('all.npc', `resizev=${npc.g2()}`);
        } else {
            console.error(`Unrecognized npc config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.obj', '');

count = obj.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.obj', '');
    }

    append('all.obj', `[obj_${id}]`);

    while (true) {
        let code = obj.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            append('all.obj', `model=model_${obj.g2()}`);
        } else if (code === 2) {
            append('all.obj', `name=${obj.gjstr()}`);
        } else if (code === 3) {
            append('all.obj', `desc=${obj.gjstr()}`);
        } else if (code === 4) {
            append('all.obj', `2dzoom=${obj.g2()}`);
        } else if (code === 5) {
            append('all.obj', `2dxan=${obj.g2()}`);
        } else if (code === 6) {
            append('all.obj', `2dyan=${obj.g2()}`);
        } else if (code === 7) {
            append('all.obj', `2dxof=${obj.g2s()}`);
        } else if (code === 8) {
            append('all.obj', `2dyof=${obj.g2s()}`);
        } else if (code === 9) {
            append('all.obj', `code9=yes`);
        } else if (code === 10) {
            append('all.obj', `code10=seq_${obj.g2()}`);
        } else if (code === 11) {
            append('all.obj', `stackable=yes`);
        } else if (code === 12) {
            append('all.obj', `cost=${obj.g4()}`);
        } else if (code === 16) {
            append('all.obj', `members=yes`);
        } else if (code === 23) {
            append('all.obj', `manwear=model_${obj.g2()},${obj.g1()}`);
        } else if (code === 24) {
            append('all.obj', `manwear2=model_${obj.g2()}`);
        } else if (code === 25) {
            append('all.obj', `womanwear=model_${obj.g2()},${obj.g1()}`);
        } else if (code === 26) {
            append('all.obj', `womanwear2=model_${obj.g2()}`);
        } else if (code >= 30 && code < 35) {
            append('all.obj', `op${code - 30 + 1}=${obj.gjstr()}`);
        } else if (code >= 35 && code < 40) {
            append('all.obj', `iop${code - 35 + 1}=${obj.gjstr()}`);
        } else if (code === 40) {
            let recol = obj.g1();

            for (let i = 0; i < recol; i++) {
                append('all.obj', `recol${i + 1}s=${obj.g2()}`);
                append('all.obj', `recol${i + 1}d=${obj.g2()}`);
            }
        } else if (code === 78) {
            append('all.obj', `manwear3=model_${obj.g2()}`);
        } else if (code === 79) {
            append('all.obj', `womanwear3=model_${obj.g2()}`);
        } else if (code === 90) {
            append('all.obj', `manhead=model_${obj.g2()}`);
        } else if (code === 91) {
            append('all.obj', `womanhead=model_${obj.g2()}`);
        } else if (code === 92) {
            append('all.obj', `manhead2=model_${obj.g2()}`);
        } else if (code === 93) {
            append('all.obj', `womanhead2=model_${obj.g2()}`);
        } else if (code === 95) {
            append('all.obj', `2dzan=${obj.g2()}`);
        } else if (code === 97) {
            append('all.obj', `certlink=obj_${obj.g2()}`);
        } else if (code === 98) {
            append('all.obj', `certlink=obj_${obj.g2()}`);
        } else if (code >= 100 && code < 110) {
            append('all.obj', `count${code - 100 + 1}=obj_${obj.g2()},${obj.g2()}`);
        } else {
            console.error(`Unrecognized obj config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.seq', '');

count = seq.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.seq', '');
    }

    append('all.seq', `[seq_${id}]`);

    while (true) {
        let code = seq.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            let frames = seq.g1();

            for (let i = 0; i < frames; i++) {
                append('all.seq', `frame${i + 1}=anim_${seq.g2()}`);

                let iframe = seq.g2();
                if (iframe !== 65535) {
                    append('all.seq', `iframe${i + 1}=anim_${iframe}`);
                }

                let delay = seq.g2();
                if (delay !== 0) {
                    append('all.seq', `delay${i + 1}=${delay}`);
                }
            }
        } else if (code === 2) {
            append('all.seq', `replayoff=${seq.g2()}`);
        } else if (code === 3) {
            let labels = seq.g1();

            let str = '';
            for (let i = 0; i < labels; i++) {
                if (i > 0) {
                    str += ',';
                }

                str += `label_${seq.g1()}`;
            }

            append('all.seq', `walkmerge=${str}`);
        } else if (code === 4) {
            append('all.seq', `stretches=yes`);
        } else if (code === 5) {
            append('all.seq', `priority=${seq.g1()}`);
        } else if (code === 6) {
            append('all.seq', `mainhand=obj_${seq.g2()}`);
        } else if (code === 7) {
            append('all.seq', `offhand=obj_${seq.g2()}`);
        } else if (code === 8) {
            append('all.seq', `replaycount=${seq.g1()}`);
        } else {
            console.error(`Unrecognized seq config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.spotanim', '');

count = spotanim.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.spotanim', '');
    }

    append('all.spotanim', `[spotanim_${id}]`);

    while (true) {
        let code = spotanim.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            append('all.spotanim', `model=model_${spotanim.g2()}`);
        } else if (code === 2) {
            append('all.spotanim', `anim=seq_${spotanim.g2()}`);
        } else if (code === 3) {
            append('all.spotanim', `disposeAlpha=yes`); // temp
        } else if (code === 4) {
            append('all.spotanim', `resizeh=${spotanim.g2()}`);
        } else if (code === 5) {
            append('all.spotanim', `resizev=${spotanim.g2()}`);
        } else if (code === 6) {
            append('all.spotanim', `orientation=${spotanim.g2()}`);
        } else if (code === 7) {
            append('all.spotanim', `ambient=${spotanim.g1()}`);
        } else if (code === 8) {
            append('all.spotanim', `contrast=${spotanim.g1()}`);
        } else if (code >= 40 && code < 50) {
            append('all.spotanim', `recol${code - 40 + 1}s=${spotanim.g2()}`);
        } else if (code >= 50 && code < 60) {
            append('all.spotanim', `recol${code - 50 + 1}d=${spotanim.g2()}`);
        } else {
            console.error(`Unrecognized spotanim config code: ${code}`);
            process.exit(1);
        }
    }
}

// ----

fs.writeFileSync('data/src/scripts/all.varp', '');

count = varp.g2();
for (let id = 0; id < count; id++) {
    if (id > 0) {
        append('all.varp', '');
    }

    append('all.varp', `[varp_${id}]`);

    while (true) {
        let code = varp.g1();
        if (code === 0) {
            break;
        }

        if (code === 1) {
            append('all.varp', `code1=${varp.g1()}`);
        } else if (code === 2) {
            append('all.varp', `code2=${varp.g1()}`);
        } else if (code === 3) {
            append('all.varp', `code3=yes`);
        } else if (code === 4) {
            append('all.varp', `code4=no`);
        } else if (code === 5) {
            append('all.varp', `clientcode=${varp.g2()}`);
        } else if (code === 6) {
            append('all.varp', `code6=yes`);
        } else if (code === 7) {
            append('all.varp', `code7=${varp.g4()}`);
        } else if (code === 8) {
            append('all.varp', `code8=yes`);
        } else if (code === 10) {
            append('all.varp', `code10=${varp.gjstr()}`);
        } else {
            console.error(`Unrecognized varp config code: ${code}`);
            process.exit(1);
        }
    }
}
