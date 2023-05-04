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

let npcOrder = loadPackOrder('data/pack/npc.order');

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
    let nameIndex = config.findIndex(x => x.startsWith('name'));
    let descIndex = config.findIndex(x => x.startsWith('desc'));

    if (nameIndex !== -1) {
        // place name after config
        let temp = config[1];
        config[1] = config[nameIndex];
        config.splice(nameIndex, 1);
        config.splice(2, 0, temp);
    }

    // if (nameIndex !== -1 && descIndex === -1) {
    //     // place name after config
    //     let temp = config[1];
    //     config[1] = config[nameIndex];
    //     config.splice(nameIndex, 1);
    //     config.splice(2, 0, temp);
    // } else if (nameIndex !== -1 && descIndex !== -1) {
    //     // place name before desc
    //     if (nameIndex > descIndex) {
    //         let name = config[nameIndex];
    //         config.splice(nameIndex, 1);
    //         config.splice(descIndex, 0, name);
    //     }
    // }
}

fs.writeFileSync('dump/all.npc', '');
for (let i = 0; i < npcConfigs.length; i++) {
    let config = npcConfigs[i];

    if (i > 0) {
        fs.appendFileSync('dump/all.npc', '\n');
    }

    for (let j = 0; j < config.length; j++) {
        fs.appendFileSync('dump/all.npc', `${config[j]}\n`);
    }
}
