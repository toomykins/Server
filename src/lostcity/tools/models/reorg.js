import fs from 'fs';

let models = fs.readFileSync('data/pack/model.pack', 'ascii').replaceAll('\r\n', '\n').split('\n');

fs.mkdirSync('data/src/models/idk', { recursive: true });
fs.mkdirSync('data/src/models/obj', { recursive: true });
fs.mkdirSync('data/src/models/npc', { recursive: true });
fs.mkdirSync('data/src/models/spotanim', { recursive: true });
fs.mkdirSync('data/src/models/loc', { recursive: true });

let idk = fs.readFileSync('data/src/scripts/_unpack/all.idk', 'ascii').replace(/\r/g, '').split('\n');
for (let i = 0; i < idk.length; i++) {
    let line = idk[i];
    if (!line.startsWith('model') && !line.startsWith('head')) {
        continue;
    }

    let key = line.substring(0, line.indexOf('='));
    let value = line.substring(line.indexOf('=') + 1);

    if (key.startsWith('model')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/idk/${value}.ob2`);
        }
    } else if (key.startsWith('head')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/idk/${value}.ob2`);
        }
    }
}

let objs = fs.readFileSync('data/src/scripts/_unpack/all.obj', 'ascii').replace(/\r/g, '').split('\n');
for (let i = 0; i < objs.length; i++) {
    let line = objs[i];
    if (!line.startsWith('model') && !line.startsWith('man') && !line.startsWith('woman')) {
        continue;
    }

    let key = line.substring(0, line.indexOf('='));
    let value = line.substring(line.indexOf('=') + 1);

    if (key.startsWith('model')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    } else if (key === 'manwear') {
        if (value.indexOf(',') !== -1) {
            value = value.substring(0, value.indexOf(','));
        }
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    } else if (key.startsWith('manwear')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    } else if (key === 'womanwear') {
        if (value.indexOf(',') !== -1) {
            value = value.substring(0, value.indexOf(','));
        }
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    } else if (key.startsWith('womanwear')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    } else if (key.startsWith('manhead')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    } else if (key.startsWith('womanhead')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/obj/${value}.ob2`);
        }
    }
}

let npcs = fs.readFileSync('data/src/scripts/_unpack/all.npc', 'ascii').replace(/\r/g, '').split('\n');
for (let i = 0; i < npcs.length; i++) {
    let line = npcs[i];
    if (!line.startsWith('model') && !line.startsWith('head')) {
        continue;
    }

    let key = line.substring(0, line.indexOf('='));
    let value = line.substring(line.indexOf('=') + 1);

    if (key.startsWith('model')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/npc/${value}.ob2`);
        }
    } else if (key.startsWith('head')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/npc/${value}.ob2`);
        }
    }
}

let spotanims = fs.readFileSync('data/src/scripts/_unpack/all.spotanim', 'ascii').replace(/\r/g, '').split('\n');
for (let i = 0; i < spotanims.length; i++) {
    let line = spotanims[i];
    if (!line.startsWith('model')) {
        continue;
    }

    let key = line.substring(0, line.indexOf('='));
    let value = line.substring(line.indexOf('=') + 1);

    if (key.startsWith('model')) {
        if (fs.existsSync(`data/src/models/_unpack/${value}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${value}.ob2`, `data/src/models/spotanim/${value}.ob2`);
        }
    }
}

let newModelName = {};

let locs = fs.readFileSync('data/src/scripts/_unpack/all.loc', 'ascii').replace(/\r/g, '').split('\n');
let lastLoc = null;
for (let i = 0; i < locs.length; i++) {
    let line = locs[i];

    if (line.startsWith('[')) {
        lastLoc = line.substring(1, line.indexOf(']'));
        continue;
    }

    if (!line.startsWith('model')) {
        continue;
    }

    let key = line.substring(0, line.indexOf('='));
    let value = line.substring(line.indexOf('=') + 1);

    if (key.startsWith('model')) {
        let id = value.substring(0, value.indexOf(','));
        let modelId = id.substring(id.indexOf('_') + 1);
        let type = value.substring(value.indexOf(',') + 1);

        if (!newModelName[id]) {
            newModelName[id] = 'model_' + lastLoc;
        }

        let target = newModelName[id];
        switch (type) {
            case 'wall_straight':
                target += '_1';
                break;
            case 'wall_diagonalcorner':
                target += '_2';
                break;
            case 'wall_l':
                target += '_3';
                break;
            case 'wall_squarecorner':
                target += '_4';
                break;
            case 'wall_diagonal':
                target += '_5';
                break;
            case 'walldecor_straight_nooffset':
                target += '_q';
                break;
            case 'walldecor_straight_offset':
                target += '_w';
                break;
            case 'walldecor_diagonal_offset':
                target += '_e';
                break;
            case 'walldecor_diagonal_nooffset':
                target += '_r';
                break;
            case 'walldecor_diagonal_both':
                target += '_t';
                break;
            case 'centrepiece_straight':
                // target += '_8';
                break;
            case 'centrepiece_diagonal':
                target += '_9';
                break;
            case 'grounddecor':
                target += '_0';
                break;
            case 'roof_straight':
                target += '_a';
                break;
            case 'roof_diagonal_with_roofedge':
                target += '_s';
                break;
            case 'roof_diagonal':
                target += '_d';
                break;
            case 'roof_l_concave':
                target += '_f';
                break;
            case 'roof_l_convex':
                target += '_g';
                break;
            case 'roof_flat':
                target += '_h';
                break;
            case 'roofedge_straight':
                target += '_z';
                break;
            case 'roofedge_diagonalcorner':
                target += '_x';
                break;
            case 'roofedge_l':
                target += '_c';
                break;
            case 'roofedge_squarecorner':
                target += '_v';
                break;
            default:
                console.error(type);
                process.exit(1);
        }

        models[modelId] = `${modelId}=${target}`;
        locs[i] = `model=${newModelName[id]}`;

        if (fs.existsSync(`data/src/models/_unpack/${id}.ob2`)) {
            fs.renameSync(`data/src/models/_unpack/${id}.ob2`, `data/src/models/loc/${target}.ob2`);
        }

        // check if last line was model and then delete this one if so
        if (locs[i - 1].startsWith('model')) {
            locs.splice(i, 1);
            i--;
            continue;
        }
    }
}

fs.writeFileSync('data/src/scripts/_unpack/all.loc', locs.join('\n'));
fs.writeFileSync('data/pack/model.pack', models.join('\n'));
