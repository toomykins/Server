import Packet from '#io/Packet.js';
import fs from 'fs';

let configFiles = [];
function findConfigFiles(srcPath) {
    let files = fs.readdirSync(srcPath);

    for (let i = 0; i < files.length; i++) {
        let stat = fs.statSync(`${srcPath}/${files[i]}`);

        if (stat.isDirectory()) {
            findConfigFiles(`${srcPath}/${files[i]}`);
        } else if (files[i].endsWith('.obj')) {
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
let objOrder = loadPackOrder('data/pack/obj.order');

let dat = new Packet();
let idx = new Packet();

dat.p2(Object.keys(objOrder).length);
idx.p2(Object.keys(objOrder).length);

// pack configs into dat file
function packConfig(config) {
    if (!config.length) {
        console.log('Empty config');
        return;
    }

    let configName = config[0].substring(1, config[0].length - 1);

    let id = objOrder[configName];
    if (typeof id === 'undefined') {
        console.log(`Unknown obj: ${configName}`);
        return;
    }

    let offset = 1;
    let start = dat.pos;

    let recols = [];
    let recold = [];
    let name = '';

    while (offset < config.length) {
        let line = config[offset].split('=');
        let key = line[0];
        let value = line[1];

        if (key === 'name') {
            name = value;
        } else if (key.startsWith('recol') && key.endsWith('s')) {
            let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
            recols[index] = parseInt(value);
        } else if (key.startsWith('recol') && key.endsWith('d')) {
            let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
            recold[index] = parseInt(value);
        } else if (key === 'model') {
            dat.p1(1);
            dat.p2(modelOrder[value]);
        } else if (key === 'desc') {
            dat.p1(3);
            dat.pjstr(value);
        } else if (key === '2dzoom') {
            dat.p1(4);
            dat.p2(parseInt(value));
        } else if (key === '2dxan') {
            dat.p1(5);
            dat.p2(parseInt(value));
        } else if (key === '2dyan') {
            dat.p1(6);
            dat.p2(parseInt(value));
        } else if (key === '2dxof') {
            dat.p1(7);
            dat.p2(parseInt(value));
        } else if (key === '2dyof') {
            dat.p1(8);
            dat.p2(parseInt(value));
        } else if (key === 'code9' && value === 'yes') {
            dat.p1(9);
        } else if (key === 'code10') {
            dat.p1(10);
            dat.p2(seqOrder[value]);
        } else if (key === 'stackable' && value === 'yes') {
            dat.p1(11);
        } else if (key === 'cost') {
            dat.p1(12);
            dat.p4(parseInt(value));
        } else if (key === 'members' && value === 'yes') {
            dat.p1(16);
        } else if (key === 'manwear') {
            let parts = value.split(',');
            dat.p1(23);
            dat.p2(modelOrder[parts[0]]);
            dat.p1(parseInt(parts[1]));
        } else if (key === 'manwear2') {
            dat.p1(24);
            dat.p2(modelOrder[value]);
        } else if (key === 'womanwear') {
            let parts = value.split(',');
            dat.p1(25);
            dat.p2(modelOrder[parts[0]]);
            dat.p1(parseInt(parts[1]));
        } else if (key === 'womanwear2') {
            dat.p1(26);
            dat.p2(modelOrder[value]);
        } else if (key.startsWith('op')) {
            let index = parseInt(key.substring('op'.length)) - 1;
            dat.p1(30 + index);
            dat.pjstr(value);
        } else if (key.startsWith('iop')) {
            let index = parseInt(key.substring('iop'.length)) - 1;
            dat.p1(35 + index);
            dat.pjstr(value);
        } else if (key === 'manwear3') {
            dat.p1(78);
            dat.p2(modelOrder[value]);
        } else if (key === 'womanwear3') {
            dat.p1(79);
            dat.p2(modelOrder[value]);
        } else if (key === 'manhead') {
            dat.p1(90);
            dat.p2(modelOrder[value]);
        } else if (key === 'womanhead') {
            dat.p1(91);
            dat.p2(modelOrder[value]);
        } else if (key === 'manhead2') {
            dat.p1(92);
            dat.p2(modelOrder[value]);
        } else if (key === 'womanhead2') {
            dat.p1(93);
            dat.p2(modelOrder[value]);
        } else if (key === '2dzan') {
            dat.p1(95);
            dat.p2(parseInt(value));
        } else if (key === 'certlink') {
            dat.p1(97);
            dat.p2(objOrder[value]);
        } else if (key === 'certtemplate') {
            dat.p1(98);
            dat.p2(objOrder[value]);
        } else if (key.startsWith('count')) {
            let index = parseInt(key.substring('count'.length)) - 1;

            let parts = value.split(',');
            let countobj = objOrder[parts[0]];
            let countco = parseInt(parts[1]);

            dat.p1(100 + index);
            dat.p2(countobj);
            dat.p2(countco);
        } else {
            console.log(`Unrecognized obj config key ${key} in ${configName}`);
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

    dat.p1(0);
    idx.p2(dat.pos - start);
}

// read through all files
let objConfigs = [];
for (let i = 0; i < configFiles.length; i++) {
    let src = fs.readFileSync(configFiles[i], 'utf8').replaceAll('\r\n', '\n').split('\n');
    let offset = 0;

    let obj = null;
    let objConfig = [];

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
            if (obj) {
                objConfigs[objOrder[obj]] = objConfig;
            }

            obj = line.substring(1, line.length - 1);
            objConfig = [];
        }

        objConfig.push(line);
        offset++;
    }

    if (obj) {
        objConfigs[objOrder[obj]] = objConfig;
    }
}

// sort in ascending pack order and pack everything
for (let i = 0; i < objConfigs.length; i++) {
    let config = objConfigs[i];
    packConfig(config);
}

dat.toFile('data/pack/client/config/obj.dat');
idx.toFile('data/pack/client/config/obj.idx');
