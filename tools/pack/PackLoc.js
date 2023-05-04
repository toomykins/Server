import Packet from '#io/Packet.js';
import fs from 'fs';

let configFiles = [];
function findConfigFiles(srcPath) {
    let files = fs.readdirSync(srcPath);

    for (let i = 0; i < files.length; i++) {
        let stat = fs.statSync(`${srcPath}/${files[i]}`);

        if (stat.isDirectory()) {
            findConfigFiles(`${srcPath}/${files[i]}`);
        } else if (files[i].endsWith('.loc')) {
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
let locOrder = loadPackOrder('data/pack/loc.order');

let dat = new Packet();
let idx = new Packet();

dat.p2(Object.keys(locOrder).length);
idx.p2(Object.keys(locOrder).length);

// pack configs into dat file
function packConfig(config) {
    if (!config.length) {
        console.log('Empty config');
        return;
    }

    let configName = config[0].substring(1, config[0].length - 1);

    let id = locOrder[configName];
    if (typeof id === 'undefined') {
        console.log(`Unknown loc: ${configName}`);
        return;
    }

    let offset = 1;
    let start = dat.pos;

    let recols = [];
    let recold = [];
    let models = [];
    let name = '';
    let desc = '';

    while (offset < config.length) {
        let key = config[offset].substring(0, config[offset].indexOf('='));
        let value = config[offset].substring(config[offset].indexOf('=') + 1);

        if (key === 'name') {
            name = value;
        } else if (key === 'desc') {
            desc = value;
        } else if (key.startsWith('model')) {
            let index = parseInt(key.substring('model'.length)) - 1;
            models[index] = value;
        } else if (key.startsWith('head')) {
            let index = parseInt(key.substring('head'.length)) - 1;
            heads[index] = modelOrder[value];
        } else if (key.startsWith('recol') && key.endsWith('s')) {
            let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
            recols[index] = parseInt(value);
        } else if (key.startsWith('recol') && key.endsWith('d')) {
            let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
            recold[index] = parseInt(value);
        } else if (key === 'width') {
            dat.p1(14);
            dat.p1(parseInt(value));
        } else if (key === 'length') {
            dat.p1(15);
            dat.p1(parseInt(value));
        } else if (key === 'blockwalk' && value === 'no') {
            dat.p1(17);
        } else if (key === 'blockrange' && value === 'no') {
            dat.p1(18);
        } else if (key === 'active') {
            dat.p1(19);
            dat.pbool(value === 'yes');
        } else if (key === 'hillskew' && value === 'yes') {
            dat.p1(21);
        } else if (key === 'sharelight' && value === 'yes') {
            dat.p1(22);
        } else if (key === 'occlude' && value === 'yes') {
            dat.p1(23);
        } else if (key === 'anim') {
            dat.p1(24);
            dat.p2(seqOrder[value]);
        } else if (key === 'alpha' && value === 'yes') {
            dat.p1(25);
        } else if (key === 'walloff') {
            dat.p1(28);
            dat.p1(parseInt(value));
        } else if (key === 'ambient') {
            dat.p1(29);
            dat.p1(parseInt(value));
        } else if (key === 'contrast') {
            dat.p1(39);
            dat.p1(parseInt(value));
        } else if (key.startsWith('op')) {
            let index = parseInt(key.substring('op'.length)) - 1;
            dat.p1(30 + index);
            dat.pjstr(value);
        } else if (key === 'mapfunction') {
            dat.p1(60);
            dat.p2(parseInt(value));
        } else if (key === 'mirror' && value === 'yes') {
            dat.p1(62);
        } else if (key === 'shadow' && value === 'no') {
            dat.p1(64);
        } else if (key === 'resizex') {
            dat.p1(65);
            dat.p2(parseInt(value));
        } else if (key === 'resizey') {
            dat.p1(66);
            dat.p2(parseInt(value));
        } else if (key === 'resizez') {
            dat.p1(67);
            dat.p2(parseInt(value));
        } else if (key === 'mapscene') {
            dat.p1(68);
            dat.p2(parseInt(value));
        } else if (key === 'blocksides') {
            dat.p1(69);
            dat.p1(parseInt(value));
        } else if (key === 'xoff') {
            dat.p1(70);
            dat.p2(parseInt(value));
        } else if (key === 'yoff') {
            dat.p1(71);
            dat.p2(parseInt(value));
        } else if (key === 'zoff') {
            dat.p1(72);
            dat.p2(parseInt(value));
        } else if (key === 'forcedecor' && value === 'yes') {
            dat.p1(73);
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

    if (models.length) {
        dat.p1(1);
        dat.p1(models.length);

        for (let i = 0; i < models.length; i++) {
            let parts = models[i].split(',');
            dat.p2(modelOrder[parts[0]]);

            // for now, we read the model shape as a constant... and I don't want to search for constants yet.
            // it should really be inferred by the model files under that name, a single model= line can create multiple entries
            let shape = 0;
            switch (parts[1]) {
                case '^wall_straight':
                    shape = 0;
                    break;
                case '^wall_diagonalcorner':
                    shape = 1;
                    break;
                case '^wall_l':
                    shape = 2;
                    break;
                case '^wall_squarecorner':
                    shape = 3;
                    break;
                case '^walldecor_straight':
                    shape = 4;
                    break;
                case '^walldecor_straight_offset':
                    shape = 5;
                    break;
                case '^walldecor_diagonal_nooffset':
                    shape = 6;
                    break;
                case '^walldecor_diagonal_offset':
                    shape = 7;
                    break;
                case '^walldecor_diagonal_both':
                    shape = 8;
                    break;
                case '^wall_diagonal':
                    shape = 9;
                    break;
                case '^centrepiece_straight':
                    shape = 10;
                    break;
                case '^centrepiece_diagonal':
                    shape = 11;
                    break;
                case '^roof_straight':
                    shape = 12;
                    break;
                case '^roof_diagonal_with_roofedge':
                    shape = 13;
                    break;
                case '^roof_diagonal':
                    shape = 14;
                    break;
                case '^roof_l_concave':
                    shape = 15;
                    break;
                case '^roof_l_convex':
                    shape = 16;
                    break;
                case '^roof_flat':
                    shape = 17;
                    break;
                case '^roofedge_straight':
                    shape = 18;
                    break;
                case '^roofedge_diagonalcorner':
                    shape = 19;
                    break;
                case '^roofedge_l':
                    shape = 20;
                    break;
                case '^roofedge_squarecorner':
                    shape = 21;
                    break;
                case '^grounddecor':
                    shape = 22;
                    break;
            }
            dat.p1(shape);
        }
    }

    if (name.length) {
        dat.p1(2);
        dat.pjstr(name);
    }

    if (desc.length) {
        dat.p1(3);
        dat.pjstr(desc);
    }

    dat.p1(0);
    idx.p2(dat.pos - start);
}

// read through all files
let locConfigs = [];
for (let i = 0; i < configFiles.length; i++) {
    let src = fs.readFileSync(configFiles[i], 'utf8').replaceAll('\r\n', '\n').split('\n');
    let offset = 0;

    let loc = null;
    let locConfig = [];

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
            if (loc) {
                locConfigs[locOrder[loc]] = locConfig;
            }

            loc = line.substring(1, line.length - 1);
            locConfig = [];
        }

        locConfig.push(line);
        offset++;
    }

    if (loc) {
        locConfigs[locOrder[loc]] = locConfig;
    }
}

// sort in ascending pack order and pack everything
for (let i = 0; i < locConfigs.length; i++) {
    let config = locConfigs[i];
    packConfig(config);
}

dat.toFile('data/pack/client/config/loc.dat');
idx.toFile('data/pack/client/config/loc.idx');
