import Packet from '#io/Packet.js';
import fs from 'fs';

let configFiles = [];
function findConfigFiles(srcPath) {
    let files = fs.readdirSync(srcPath);

    for (let i = 0; i < files.length; i++) {
        let stat = fs.statSync(`${srcPath}/${files[i]}`);

        if (stat.isDirectory()) {
            findConfigFiles(`${srcPath}/${files[i]}`);
        } else if (files[i].endsWith('.npc')) {
            configFiles.push(`${srcPath}/${files[i]}`);
        }
    }
}
findConfigFiles('data/src/scripts');

function loadPackOrder(srcPath) {
    let src = fs.readFileSync(`${srcPath}`, 'utf8').replaceAll('\r\n', '\n').split('\n');
    let packOrder = {};

    for (let i = 0; i < src.length; i++) {
        if (!src[i].length) {
            continue;
        }

        let line = src[i].split('=');
        let key = line[0];
        let value = line[1];

        packOrder[key] = parseInt(value);
    }

    return packOrder;
}

let modelOrder = loadPackOrder('data/pack/model.order');
let seqOrder = loadPackOrder('data/pack/seq.order');
let npcOrder = loadPackOrder('data/pack/npc.order');

let dat = new Packet();
let idx = new Packet();

dat.p2(Object.keys(npcOrder).length);
idx.p2(Object.keys(npcOrder).length);

// pack configs into dat file
function packConfig(config) {
    if (!config.length) {
        console.log('Empty config');
        return;
    }

    let configName = config[0].substring(1, config[0].length - 1);

    let id = npcOrder[configName];
    if (typeof id === 'undefined') {
        console.log(`Unknown NPC: ${configName}`);
        return;
    }

    let offset = 1;
    let start = dat.pos;

    let recols = [];
    let recold = [];
    let name = '';
    let models = [];
    let heads = [];

    while (offset < config.length) {
        let line = config[offset].split('=');
        let key = line[0];
        let value = line[1];

        if (key === 'name') {
            name = value;
        } else if (key.startsWith('model')) {
            let index = parseInt(key.substring('model'.length)) - 1;
            models[index] = modelOrder[value];
        } else if (key.startsWith('head')) {
            let index = parseInt(key.substring('head'.length)) - 1;
            heads[index] = modelOrder[value];
        } else if (key.startsWith('recol') && key.endsWith('s')) {
            let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
            recols[index] = parseInt(value);
        } else if (key.startsWith('recol') && key.endsWith('d')) {
            let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
            recold[index] = parseInt(value);
        } else if (key === 'desc') {
            dat.p1(3);
            dat.pjstr(value);
        } else if (key === 'size') {
            dat.p1(12);
            dat.p1(parseInt(value));
        } else if (key === 'readyanim') {
            dat.p1(13);
            dat.p2(seqOrder[value]);
        } else if (key === 'walkanim' && !config[offset + 1].startsWith('walkanim_b')) {
            // save some space if only one walkanim is defined
            dat.p1(14);
            dat.p2(seqOrder[value]);
        } else if (key === 'alpha' && value === 'yes') {
            dat.p1(16);
        } else if (key === 'walkanim_l') {
            dat.p1(17);

            // this relies on walkanims to be in a very very specific order!
            let walkanim = config[offset - 3].split('=')[1];
            dat.p2(seqOrder[walkanim]);

            let walkanim_b = config[offset - 2].split('=')[1];
            dat.p2(seqOrder[walkanim_b]);

            let walkanim_r = config[offset - 1].split('=')[1];
            dat.p2(seqOrder[walkanim_r]);

            let walkanim_l = value;
            dat.p2(seqOrder[walkanim_l]);
        } else if (key.startsWith('op')) {
            let index = parseInt(key.substring('op'.length)) - 1;
            dat.p1(30 + index);
            dat.pjstr(value);
        } else if (key.startsWith('code90')) {
            dat.p1(90);
            dat.p2(parseInt(value));
        } else if (key.startsWith('code91')) {
            dat.p1(91);
            dat.p2(parseInt(value));
        } else if (key.startsWith('code92')) {
            dat.p1(92);
            dat.p2(parseInt(value));
        } else if (key.startsWith('visonmap') && value === 'no') {
            dat.p1(93);
        } else if (key.startsWith('vislevel')) {
            dat.p1(95);
            dat.p2(parseInt(value));
        } else if (key.startsWith('resizeh')) {
            dat.p1(97);
            dat.p2(parseInt(value));
        } else if (key.startsWith('resizev')) {
            dat.p1(98);
            dat.p2(parseInt(value));
        }

        offset++;
    }

    if (recols.length) {
        dat.p1(40);
        dat.p1(recols.length);

        for (let i = 0; i < recols.length; i++) {
            dat.p2(recols[i]);
            dat.p2(recold[i]);
        }
    }

    if (name.length) {
        dat.p1(2);
        dat.pjstr(name);
    }

    if (models.length) {
        dat.p1(1);
        dat.p1(models.length);

        for (let i = 0; i < models.length; i++) {
            dat.p2(models[i]);
        }
    }

    if (heads.length) {
        dat.p1(60);
        dat.p1(heads.length);

        for (let i = 0; i < heads.length; i++) {
            dat.p2(heads[i]);
        }
    }

    dat.p1(0);
    idx.p2(dat.pos - start);
}

// read through all files
let npcConfigs = [];
for (let i = 0; i < configFiles.length; i++) {
    let src = fs.readFileSync(configFiles[i], 'utf8').replaceAll('\r\n', '\n').split('\n');
    let offset = 0;

    let npc = null;
    let npcConfig = [];

    let comment = false;
    while (offset < src.length) {
        let line = src[offset];

        if (comment && line.endsWith('*/')) {
            comment = false;
            offset++;
            continue;
        } else if (line.startsWith('/*')) {
            comment = true;
            offset++;
            continue;
        } else if (!line.length || comment || line.startsWith('//')) {
            offset++;
            continue;
        }

        if (line.startsWith('[')) {
            if (npc) {
                npcConfigs[npcOrder[npc]] = npcConfig;
            }

            npc = line.substring(1, line.length - 1);
            npcConfig = [];
        }

        npcConfig.push(line);
        offset++;
    }

    if (npc) {
        npcConfigs[npcOrder[npc]] = npcConfig;
    }
}

// sort in ascending pack order and pack everything
for (let i = 0; i < npcConfigs.length; i++) {
    let config = npcConfigs[i];
    packConfig(config);
}

dat.toFile('data/pack/client/npc.dat');
idx.toFile('data/pack/client/npc.idx');
