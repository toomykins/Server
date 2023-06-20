import fs from 'fs';

import Jagfile from '#jagex2/io/Jagfile.js';
import Packet from '#jagex2/io/Packet.js';

import { loadDir, loadPack } from '../pack/NameMap.js';

console.log('---- config ----');

/* order:
  'seq.dat',      'seq.idx',
  'loc.dat',      'loc.idx',
  'flo.dat',      'flo.idx',
  'spotanim.dat', 'spotanim.idx',
  'obj.dat',      'obj.idx',
  'npc.dat',      'npc.idx',
  'idk.dat',      'idk.idx',
  'varp.dat',     'varp.idx'
*/

let modelPack = loadPack('data/pack/model.pack');
let animPack = loadPack('data/pack/anim.pack');
let basePack = loadPack('data/pack/base.pack');

let seqPack = loadPack('data/pack/seq.pack');
let locPack = loadPack('data/pack/loc.pack');
let floPack = loadPack('data/pack/flo.pack');
let spotanimPack = loadPack('data/pack/spotanim.pack');
let objPack = loadPack('data/pack/obj.pack');
let npcPack = loadPack('data/pack/npc.pack');
let idkPack = loadPack('data/pack/idk.pack');
let varpPack = loadPack('data/pack/varp.pack');

let config = new Jagfile();

function packSeq(config, dat, idx, id) {
    if (!config.length) {
        console.error('Empty config', id);
        return;
    }

    let start = dat.pos;

    // collect these to write at the end
    let frames = [];
    let iframes = [];
    let delays = [];

    for (let i = 0; i < config.length; i++) {
        let line = config[i];
        let key = line.substring(0, line.indexOf('='));
        let value = line.substring(line.indexOf('=') + 1);

        if (key.startsWith('frame')) {
            let index = parseInt(key.substring('frame'.length)) - 1;
            frames[index] = value;
        } else if (key.startsWith('iframe')) {
            let index = parseInt(key.substring('iframe'.length)) - 1;
            iframes[index] = value;
        } else if (key.startsWith('delay')) {
            let index = parseInt(key.substring('delay'.length)) - 1;
            delays[index] = parseInt(value);
        } else if (key === 'replayoff') {
            dat.p1(2);
            dat.p2(parseInt(value));
        } else if (key === 'walkmerge') {
            dat.p1(3);

            let labels = value.split(',');
            dat.p1(labels.length);

            for (let i = 0; i < labels.length; i++) {
                // not tracking labels by name currently
                let label = parseInt(labels[i].substring(labels[i].indexOf('_') + 1));
                dat.p1(label);
            }
        } else if (key === 'stretches' && value === 'yes') {
            dat.p1(4);
        } else if (key === 'priority') {
            dat.p1(5);
            dat.p1(parseInt(value));
        } else if (key === 'mainhand') {
            dat.p1(6);

            if (value !== 'hide') {
                let obj = objPack.indexOf(value);
                if (obj == -1) {
                    console.error('Missing mainhand', id, value);
                }
                dat.p2(obj + 512);
            } else {
                dat.p2(0);
            }
        } else if (key === 'offhand') {
            dat.p1(7);

            if (value !== 'hide') {
                let obj = objPack.indexOf(value);
                if (obj == -1) {
                    console.error('Missing offhand', id, value);
                }
                dat.p2(obj + 512);
            } else {
                dat.p2(0);
            }
        } else if (key === 'replaycount') {
            dat.p1(8);
            dat.p1(parseInt(value));
        }
    }

    if (frames.length) {
        dat.p1(1);

        dat.p1(frames.length);
        for (let i = 0; i < frames.length; i++) {
            let frame = animPack.indexOf(frames[i]);
            dat.p2(frame);

            if (typeof iframes[i] !== 'undefined') {
                let iframe = animPack.indexOf(iframes[i]);
                dat.p2(iframe);
            } else {
                dat.p2(-1);
            }

            if (typeof delays[i] !== 'undefined') {
                dat.p2(delays[i]);
            } else {
                dat.p2(0);
            }
        }
    }

    dat.p1(0);
    idx.p2(dat.pos - start);
}

{
    let dat = new Packet();
    let idx = new Packet();

    dat.p2(seqPack.length);
    idx.p2(seqPack.length);

    let configs = [];
    loadDir('data/src/scripts', '.seq', (src) => {
        let current = null;
        let config = [];

        for (let i = 0; i < src.length; i++) {
            let line = src[i];

            if (line.startsWith('[')) {
                if (current) {
                    configs[seqPack.indexOf(current)] = config;
                }

                current = line.substring(1, line.length - 1);
                config = [];
                continue;
            }

            config.push(line);
        }

        if (current) {
            configs[seqPack.indexOf(current)] = config;
        }
    });

    for (let i = 0; i < seqPack.length; i++) {
        packSeq(configs[i], dat, idx, i);
    }

    config.write('seq.dat', dat);
    config.write('seq.idx', idx);

    dat.save('dump/seq.dat');
    idx.save('dump/seq.idx');
}
