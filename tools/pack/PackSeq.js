import Packet from '#io/Packet.js';
import fs from 'fs';

let configFiles = [];
function findConfigFiles(srcPath) {
    let files = fs.readdirSync(srcPath);

    for (let i = 0; i < files.length; i++) {
        let stat = fs.statSync(`${srcPath}/${files[i]}`);

        if (stat.isDirectory()) {
            findConfigFiles(`${srcPath}/${files[i]}`);
        } else if (files[i].endsWith('.seq')) {
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
let objOrder = loadPackOrder('data/pack/obj.order');
let seqOrder = loadPackOrder('data/pack/seq.order');

let dat = new Packet();
let idx = new Packet();

dat.p2(Object.keys(seqOrder).length);
idx.p2(Object.keys(seqOrder).length);

// pack configs into dat file
function packConfig(config) {
    if (!config.length) {
        console.log('Empty config');
        return;
    }

    let configName = config[0].substring(1, config[0].length - 1);

    let id = seqOrder[configName];
    if (typeof id === 'undefined') {
        console.log(`Unknown seq: ${configName}`);
        return;
    }

    let offset = 1;
    let start = dat.pos;

    let walkmerge = [];
    let frames = [];
    let iframes = [];
    let delays = [];

    while (offset < config.length) {
        let key = config[offset].substring(0, config[offset].indexOf('='));
        let value = config[offset].substring(config[offset].indexOf('=') + 1);

        if (key.startsWith('frame')) {
            let index = parseInt(key.substring('frame'.length)) - 1;
            frames[index] = value;
        } else if (key.startsWith('iframe')) {
            let index = parseInt(key.substring('iframe'.length)) - 1;
            iframes[index] = value;
        } else if (key.startsWith('delay')) {
            let index = parseInt(key.substring('delay'.length)) - 1;
            delays[index] = parseInt(value);
        } else if (key.startsWith('walkmerge')) {
            let index = parseInt(key.substring('walkmerge'.length)) - 1;
            walkmerge[index] = value;
        } else if (key === 'replayoff') {
            dat.p1(2);
            dat.p2(parseInt(value));
        } else if (key === 'stretches' && value === 'yes') {
            // stretches and priority ordering will throw off CRC matching but there's no good solution yet
            dat.p1(4);
        } else if (key === 'priority') {
            dat.p1(5);
            dat.p1(parseInt(value));
        } else if (key === 'mainhand') {
            dat.p1(6);
            if (value !== 'hide') {
                dat.p2(objOrder[value]);
            } else {
                dat.p2(0);
            }
        } else if (key === 'offhand') {
            dat.p1(7);
            if (value !== 'hide') {
                dat.p2(objOrder[value]);
            } else {
                dat.p2(0);
            }
        } else if (key === 'replaycount') {
            dat.p1(8);
            dat.p1(parseInt(value));
        }

        offset++;
    }

    if (walkmerge.length) {
        dat.p1(3);
        dat.p1(walkmerge.length);

        for (let i = 0; i < walkmerge.length; i++) {
            // no label tracking currently
            let label = parseInt(walkmerge[i].substring(walkmerge[i].indexOf('_') + 1));
            dat.p1(label);
        }
    }

    if (frames.length) {
        dat.p1(1);
        dat.p1(frames.length);

        for (let i = 0; i < frames.length; i++) {
            // no frame tracking currently
            let frame = parseInt(frames[i].substring(frames[i].indexOf('_') + 1));
            dat.p2(frame);

            if (typeof iframes[i] !== 'undefined') {
                let iframe = parseInt(iframes[i].substring(iframes[i].indexOf('_') + 1));
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

// read through all files
let seqConfigs = [];
for (let i = 0; i < configFiles.length; i++) {
    let src = fs.readFileSync(configFiles[i], 'utf8').replaceAll('\r\n', '\n').split('\n');
    let offset = 0;

    let seq = null;
    let seqConfig = [];

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
            if (seq) {
                seqConfigs[seqOrder[seq]] = seqConfig;
            }

            seq = line.substring(1, line.length - 1);
            seqConfig = [];
        }

        seqConfig.push(line);
        offset++;
    }

    if (seq) {
        seqConfigs[seqOrder[seq]] = seqConfig;
    }
}

// sort in ascending pack order and pack everything
for (let i = 0; i < seqConfigs.length; i++) {
    let config = seqConfigs[i];
    packConfig(config);
}

dat.toFile('data/pack/client/config/seq.dat');
idx.toFile('data/pack/client/config/seq.idx');
