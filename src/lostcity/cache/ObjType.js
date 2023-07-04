import { loadDir, loadPack } from '#lostcity/tools/pack/NameMap.js';
import ParamType from './ParamType.js';

let modelPack = loadPack('data/pack/model.pack');

let objPack = loadPack('data/pack/obj.pack');
let seqPack = loadPack('data/pack/seq.pack');

export default class ObjType {
    static names = [];
    static configs = [];

    static init() {
        // reading
        loadDir('data/src/scripts', '.obj', (src) => {
            let current = null;
            let config = [];

            for (let i = 0; i < src.length; i++) {
                let line = src[i];
                if (line.startsWith('//')) {
                    continue;
                }

                if (line.startsWith('[')) {
                    if (current) {
                        let id = objPack.indexOf(current);
                        ObjType.names[id] = current;
                        ObjType.configs[id] = config;
                    }

                    current = line.substring(1, line.length - 1);
                    config = [];
                    continue;
                }

                config.push(line);
            }

            if (current) {
                let id = objPack.indexOf(current);
                ObjType.names[id] = current;
                ObjType.configs[id] = config;
            }
        });

        // parsing
        for (let i = 0; i < ObjType.configs.length; i++) {
            let lines = ObjType.configs[i];
            if (!lines) {
                continue;
            }

            let config = new ObjType();
            config.id = i;

            for (let j = 0; j < lines.length; j++) {
                let line = lines[j];
                let key = line.substring(0, line.indexOf('='));
                let value = line.substring(line.indexOf('=') + 1);

                if (key === 'name') {
                    config.name = value;
                } else if (key.startsWith('recol') && key.endsWith('s')) {
                    let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
                    config.recol_s[index] = parseInt(value);
                } else if (key.startsWith('recol') && key.endsWith('d')) {
                    let index = parseInt(key.substring('recol'.length, key.length - 1)) - 1;
                    config.recol_d[index] = parseInt(value);
                } else if (key === 'model') {
                    config.model = modelPack.indexOf(value);
                } else if (key === 'desc') {
                    config.desc = value;
                } else if (key === '2dzoom') {
                    config.zoom2d = parseInt(value);
                } else if (key === '2dxan') {
                    config.xan2d = parseInt(value);
                } else if (key === '2dyan') {
                    config.yan2d = parseInt(value);
                } else if (key === '2dxof') {
                    config.xof2d = parseInt(value);
                } else if (key === '2dyof') {
                    config.yof2d = parseInt(value);
                } else if (key === 'code9' && value === 'yes') {
                    config.code9 = true;
                } else if (key === 'code10') {
                    config.code10 = seqPack.indexOf(value);
                } else if (key === 'stackable' && value === 'yes') {
                    config.stackable = true;
                } else if (key === 'cost') {
                    config.cost = parseInt(value);
                } else if (key === 'members' && value === 'yes') {
                    config.members = true;
                } else if (key === 'manwear') {
                    let parts = value.split(',');
                    config.manwear = modelPack.indexOf(parts[0]);
                    config.manwearOffsetY = parseInt(parts[1]);
                } else if (key === 'manwear2') {
                    config.manwear2 = modelPack.indexOf(value);
                } else if (key === 'womanwear') {
                    let parts = value.split(',');
                    config.womanwear = modelPack.indexOf(parts[0]);
                    config.womanwearOffsetY = parseInt(parts[1]);
                } else if (key === 'womanwear2') {
                    config.womanwear2 = modelPack.indexOf(value);
                } else if (key.startsWith('op')) {
                    let index = parseInt(key.substring('op'.length)) - 1;
                    config.ops[index] = value;
                } else if (key.startsWith('iop')) {
                    let index = parseInt(key.substring('iop'.length)) - 1;
                    config.iops[index] = value;
                } else if (key === 'manwear3') {
                    config.manwear3 = modelPack.indexOf(value);
                } else if (key === 'womanwear3') {
                    config.womanwear3 = modelPack.indexOf(value);
                } else if (key === 'manhead') {
                    config.manhead = modelPack.indexOf(value);
                } else if (key === 'womanhead') {
                    config.womanhead = modelPack.indexOf(value);
                } else if (key === 'manhead2') {
                    config.manhead2 = modelPack.indexOf(value);
                } else if (key === 'womanhead2') {
                    config.womanhead2 = modelPack.indexOf(value);
                } else if (key === '2dzan') {
                    config.zan2d = parseInt(value);
                } else if (key === 'certlink') {
                    config.certlink = objPack.indexOf(value);
                } else if (key === 'certtemplate') {
                    config.certtemplate = objPack.indexOf(value);
                } else if (key.startsWith('count')) {
                    let index = parseInt(key.substring('count'.length)) - 1;

                    let parts = value.split(',');
                    let countobj = objPack.indexOf(parts[0]);
                    let countco = parseInt(parts[1]);

                    config.countobj[index] = countobj;
                    config.countco[index] = countco;
                } else if (key.startsWith('wearpos')) {
                    config[key] = value;
                } else if (key === 'weight') {
                    let grams = 0;
                    if (value.indexOf('kg') !== -1) {
                        // in kg, convert to g
                        grams = Number(value.substring(0, value.indexOf('kg'))) * 1000;
                    } else if (value.indexOf('oz') !== -1) {
                        // in oz, convert to g
                        grams = Number(value.substring(0, value.indexOf('oz'))) * 28.3495;
                    } else if (value.indexOf('lb') !== -1) {
                        // in lb, convert to g
                        grams = Number(value.substring(0, value.indexOf('lb'))) * 453.592;
                    } else if (value.indexOf('g') !== -1) {
                        // in g
                        grams = Number(value.substring(0, value.indexOf('g')));
                    }
                    config.weight = grams;
                } else if (key === 'param') {
                    let parts = value.split(',');
                    let paramName = parts[0];
                    let paramValue = parts[1];

                    let paramId = ParamType.getId(paramName);
                    if (paramId !== -1) {
                        let param = ParamType.get(paramId);
                        if (param.type === 'int') {
                            config.params[paramId] = parseInt(paramValue);
                        } else {
                            config.params[paramId] = paramValue;
                        }
                    }
                }
            }

            ObjType.configs[i] = config;
        }

        // generate noted obj data
        for (let i = 0; i < ObjType.configs.length; i++) {
            let config = ObjType.configs[i];

            if (config.certtemplate !== -1) {
                config.toCertificate();
            }
        }
    }

    static get(id) {
        return ObjType.configs[id];
    }

    static getId(name) {
        return objPack.indexOf(name);
    }

    static getByName(name) {
        let id = this.getId(name);
        if (id === -1) {
            return null;
        }

        return this.get(id);
    }

    // ----

    model = 0;
    name = null;
    desc = null;
    recol_s = [];
    recol_d = [];
    zoom2d = 2000;
    xan2d = 0;
    yan2d = 0;
    zan2d = 0;
    xof2d = 0;
    yof2d = 0;
    code9 = false;
    code10 = -1;
    stackable = false;
    cost = 1;
    members = false;
    ops = [];
    iops = [];
    manwear = -1;
    manwear2 = -1;
    manwearOffsetY = 0;
    womanwear = -1;
    womanwear2 = -1;
    womanwearOffsetY = 0;
    manwear3 = -1;
    womanwear3 = -1;
    manhead = -1;
    manhead2 = -1;
    womanhead = -1;
    womanhead2 = -1;
    countobj = [];
    countco = [];
    certlink = -1;
    certtemplate = -1;

    // server-side
    wearpos = -1;
    wearpos2 = -1;
    wearpos3 = -1;
    weight = 0; // in grams
    params = {};

    toCertificate() {
        let template = ObjType.get(this.certtemplate);
        this.model = template.model;
        this.zoom2d = template.zoom2d;
        this.xan2d = template.xan2d;
        this.yan2d = template.yan2d;
        this.zan2d = template.zan2d;
        this.xof2d = template.xof2d;
        this.yof2d = template.yof2d;
        this.recol_s = template.recol_s;
        this.recol_d = template.recol_d;

        let link = ObjType.get(this.certlink);
        this.name = link.name;
        this.members = link.members;
        this.cost = link.cost;

        let article = 'a';
        let c = link.name.toLowerCase().charAt(0);
        if (c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u') {
            article = 'an';
        }
        this.desc = `Swap this note at any bank for ${article} ${link.name}.`;

        this.stackable = true;
    }
}

console.time('ObjType.init()');
ObjType.init();
console.timeEnd('ObjType.init()');
