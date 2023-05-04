import Packet from '#io/Packet.js';
import fs from 'fs';

let configFiles = [];
function findConfigFiles(srcPath) {
    let files = fs.readdirSync(srcPath);

    for (let i = 0; i < files.length; i++) {
        let stat = fs.statSync(`${srcPath}/${files[i]}`);

        if (stat.isDirectory()) {
            findConfigFiles(`${srcPath}/${files[i]}`);
        } else if (files[i].endsWith('.flo')) {
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

let floOrder = loadPackOrder('data/pack/flo.order');

let dat = new Packet();
let idx = new Packet();

dat.p2(Object.keys(floOrder).length);
idx.p2(Object.keys(floOrder).length);

// pack configs into dat file
function packConfig(config) {
    if (!config.length) {
        console.log('Empty config');
        return;
    }

    let configName = config[0].substring(1, config[0].length - 1);

    let id = floOrder[configName];
    if (typeof id === 'undefined') {
        console.log(`Unknown flo: ${configName}`);
        return;
    }

    let offset = 1;
    let start = dat.pos;

    while (offset < config.length) {
        let key = config[offset].substring(0, config[offset].indexOf('='));
        let value = config[offset].substring(config[offset].indexOf('=') + 1);

        if (key === 'rgb') {
            dat.p1(1);
            dat.p3(parseInt(value, 16));
        } else if (key === 'texture') {
            dat.p1(2);
            dat.p1(parseInt(value));
        } else if (key === 'opcode3' && value === 'yes') {
            dat.p1(3);
        } else if (key === 'occlude' && value === 'no') {
            dat.p1(5);
        } else if (key === 'editname') {
            dat.p1(6);
            dat.pjstr(value);
        }

        offset++;
    }

    dat.p1(0);
    idx.p2(dat.pos - start);
}

// read through all files
let floConfigs = [];
for (let i = 0; i < configFiles.length; i++) {
    let src = fs.readFileSync(configFiles[i], 'utf8').replaceAll('\r\n', '\n').split('\n');
    let offset = 0;

    let flo = null;
    let floConfig = [];

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
            if (flo) {
                floConfigs[floOrder[flo]] = floConfig;
            }

            flo = line.substring(1, line.length - 1);
            floConfig = [];
        }

        floConfig.push(line);
        offset++;
    }

    if (flo) {
        floConfigs[floOrder[flo]] = floConfig;
    }
}

// sort in ascending pack order and pack everything
for (let i = 0; i < floConfigs.length; i++) {
    let config = floConfigs[i];
    packConfig(config);
}

dat.toFile('data/pack/client/config/flo.dat');
idx.toFile('data/pack/client/config/flo.idx');
