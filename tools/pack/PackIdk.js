import Packet from '#io/Packet.js';
import fs from 'fs';

let configFiles = [];
function findConfigFiles(srcPath) {
    let files = fs.readdirSync(srcPath);

    for (let i = 0; i < files.length; i++) {
        let stat = fs.statSync(`${srcPath}/${files[i]}`);

        if (stat.isDirectory()) {
            findConfigFiles(`${srcPath}/${files[i]}`);
        } else if (files[i].endsWith('.idk')) {
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
let idkOrder = loadPackOrder('data/pack/idk.order');

let dat = new Packet();
let idx = new Packet();

dat.p2(Object.keys(idkOrder).length);
idx.p2(Object.keys(idkOrder).length);

// pack configs into dat file
function packConfig(config) {
    if (!config.length) {
        console.log('Empty config');
        return;
    }

    let configName = config[0].substring(1, config[0].length - 1);

    let id = idkOrder[configName];
    if (typeof id === 'undefined') {
        console.log(`Unknown idk: ${configName}`);
        return;
    }

    let offset = 1;
    let start = dat.pos;

    let recols = [];
    let recold = [];
    let models = [];
    let heads = [];

    while (offset < config.length) {
        let key = config[offset].substring(0, config[offset].indexOf('='));
        let value = config[offset].substring(config[offset].indexOf('=') + 1);

        if (key.startsWith('model')) {
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
        } else if (key === 'bodypart') {
            dat.p1(1);

            // I don't want to load constants yet
            let bodypart = 0;
            switch (value) {
                case '^bodypart_man_hair':
                    bodypart = 0;
                    break;
                case '^bodypart_man_jaw':
                    bodypart = 1;
                    break;
                case '^bodypart_man_torso':
                    bodypart = 2;
                    break;
                case '^bodypart_man_arms':
                    bodypart = 3;
                    break;
                case '^bodypart_man_hands':
                    bodypart = 4;
                    break;
                case '^bodypart_man_legs':
                    bodypart = 5;
                    break;
                case '^bodypart_man_feet':
                    bodypart = 6;
                    break;
                case '^bodypart_woman_hair':
                    bodypart = 7;
                    break;
                case '^bodypart_woman_jaw':
                    bodypart = 8;
                    break;
                case '^bodypart_woman_torso':
                    bodypart = 9;
                    break;
                case '^bodypart_woman_arms':
                    bodypart = 10;
                    break;
                case '^bodypart_woman_hands':
                    bodypart = 11;
                    break;
                case '^bodypart_woman_legs':
                    bodypart = 12;
                    break;
                case '^bodypart_woman_feet':
                    bodypart = 13;
                    break;
            }

            dat.p1(bodypart);
        } else if (key === 'disable' && value === 'yes') {
            dat.p1(3);
        }

        offset++;
    }

    if (recols.length) {
        for (let i = 0; i < recols.length; i++) {
            dat.p1(40 + i);
            dat.p2(recols[i]);
        }
    }

    if (recold.length) {
        for (let i = 0; i < recold.length; i++) {
            dat.p1(50 + i);
            dat.p2(recold[i]);
        }
    }

    if (heads.length) {
        for (let i = 0; i < heads.length; i++) {
            dat.p1(60 + i);
            dat.p2(heads[i]);
        }
    }

    if (models.length) {
        dat.p1(2);
        dat.p1(models.length);

        for (let i = 0; i < models.length; i++) {
            dat.p2(models[i]);
        }
    }

    dat.p1(0);
    idx.p2(dat.pos - start);
}

// read through all files
let idkConfigs = [];
for (let i = 0; i < configFiles.length; i++) {
    let src = fs.readFileSync(configFiles[i], 'utf8').replaceAll('\r\n', '\n').split('\n');
    let offset = 0;

    let idk = null;
    let idkConfig = [];

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
            if (idk) {
                idkConfigs[idkOrder[idk]] = idkConfig;
            }

            idk = line.substring(1, line.length - 1);
            idkConfig = [];
        }

        idkConfig.push(line);
        offset++;
    }

    if (idk) {
        idkConfigs[idkOrder[idk]] = idkConfig;
    }
}

// sort in ascending pack order and pack everything
for (let i = 0; i < idkConfigs.length; i++) {
    let config = idkConfigs[i];
    packConfig(config);
}

dat.toFile('data/pack/client/config/idk.dat');
idx.toFile('data/pack/client/config/idk.idx');
