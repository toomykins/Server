import Packet from '#util/Packet.js';
import _ from 'lodash';
import Constants from './Constants.js';

function getWearPosIndex(pos) {
    if (pos === 'hat') {
        return ObjectType.HAT;
    } else if (pos === 'back') {
        return ObjectType.BACK;
    } else if (pos === 'front') {
        return ObjectType.FRONT;
    } else if (pos === 'righthand') {
        return ObjectType.RIGHT_HAND;
    } else if (pos === 'torso') {
        return ObjectType.TORSO;
    } else if (pos === 'lefthand') {
        return ObjectType.LEFT_HAND;
    } else if (pos === 'arms') {
        return ObjectType.ARMS;
    } else if (pos === 'legs') {
        return ObjectType.LEGS;
    } else if (pos === 'head') {
        return ObjectType.HEAD;
    } else if (pos === 'hands') {
        return ObjectType.HANDS;
    } else if (pos === 'feet') {
        return ObjectType.FEET;
    } else if (pos === 'jaw') {
        return ObjectType.JAW;
    } else if (pos === 'ring') {
        return ObjectType.RING;
    } else if (pos === 'quiver') {
        return ObjectType.QUIVER;
    } else {
        return -1;
    }
}

export default class ObjectType {
    // wearpos values
    static HAT = 0;
    static BACK = 1; // cape
    static FRONT = 2; // amulet
    static RIGHT_HAND = 3;
    static TORSO  = 4;
    static LEFT_HAND = 5;
    static ARMS = 6;
    static LEGS = 7;
    static HEAD = 8;
    static HANDS = 9;
    static FEET = 10;
    static JAW = 11;
    static RING = 12;
    static QUIVER = 13;

    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    model = 0;
    name = '';
    desc = '';
    zoom2d = 2000;
    xan2d = 0;
    yan2d = 0;
    xof2d = 0;
    yof2d = 0;
    code9 = false;
    code10 = -1;
    stackable = false;
    cost = 1;
    members = false;
    manwear = -1;
    manwearOffsetY = 0;
    manwear2 = -1;
    womanwear = -1;
    womanwearOffsetY = 0;
    womanwear2 = -1;
    ops = [];
    iops = [];
    recol_s = [];
    recol_d = [];
    manwear3 = -1;
    womanwear3 = -1;
    manhead = -1;
    womanhead = -1;
    manhead2 = -1;
    womanhead2 = -1;
    zan2d = 0;
    certlink = -1;
    certtemplate = -1;
    countobj = [];
    countco = [];

    // server only
    weight = 0; // in grams
    wearpos = [];
    param = {};
    readyanim = -1; // idle override

    static get(id) {
        if (ObjectType.config[id]) {
            return ObjectType.config[id];
        }

        if (ObjectType.ids[id]) {
            return ObjectType.config[ObjectType.ids[id]];
        }

        return null;
    }

    static fromDef(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');
        let offset = 0;

        let config;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                if (config && !ObjectType.ids[config.id]) {
                    // allow for empty configs
                    ObjectType.config[config.namedId] = config;
                    ObjectType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (ObjectType.config[namedId]) {
                    console.error(`Duplicate obj config: ${namedId}`);
                }

                config = new ObjectType();
                config.namedId = namedId;
                config.id = id;

                offset++;
                id++;
                continue;
            }

            while (lines[offset] && !lines[offset].startsWith('[')) {
                if (!lines[offset] || lines[offset].startsWith('//')) {
                    offset++;
                    continue;
                }

                const parts = lines[offset].split('=');
                const key = parts[0].trim();
                let value = parts[1].replaceAll('model_', '').replaceAll('seq_', '').replaceAll('obj_', '');

                while (value.indexOf('^') !== -1) {
                    const index = value.indexOf('^');
                    const constant = value.substring(index);

                    let match = Constants.get(constant);
                    if (typeof match !== 'undefined') {
                        value = value.replace(constant, match);
                    } else {
                        console.error(`Could not find constant for ${constant}`);
                    }
                }

                if (key == 'model') {
                    config.model = parseInt(value);
                } else if (key == 'name') {
                    config.name = value;
                } else if (key == 'desc') {
                    config.desc = value;
                } else if (key == '2dzoom') {
                    config.zoom2d = parseInt(value);
                } else if (key == '2dxan') {
                    config.xan2d = parseInt(value);
                } else if (key == '2dyan') {
                    config.yan2d = parseInt(value);
                } else if (key == '2dxof') {
                    config.xof2d = parseInt(value);
                } else if (key == '2dyof') {
                    config.yof2d = parseInt(value);
                } else if (key == 'stackable') {
                    config.stackable = value == 'yes';
                } else if (key == 'cost') {
                    config.cost = parseInt(value);
                } else if (key == 'members') {
                    config.members = value == 'yes';
                } else if (key == 'manwear') {
                    if (value.indexOf(',') !== -1) {
                        const parts = value.split(',');
                        config.manwear = parseInt(parts[0]);
                        config.manwearOffsetY = parseInt(parts[1]);
                    } else {
                        config.manwear = parseInt(value);
                    }
                } else if (key == 'manwear2') {
                    config.manwear2 = parseInt(value);
                } else if (key == 'womanwear') {
                    if (value.indexOf(',') !== -1) {
                        const parts = value.split(',');
                        config.womanwear = parseInt(parts[0]);
                        config.womanwearOffsetY = parseInt(parts[1]);
                    } else {
                        config.womanwear = parseInt(value);
                    }
                } else if (key == 'womanwear2') {
                    config.womanwear2 = parseInt(value);
                } else if (key.startsWith('op')) {
                    let index = parseInt(key.charAt(2)) - 1;
                    config.ops[index] = value;
                } else if (key.startsWith('iop')) {
                    let index = parseInt(key.charAt(3)) - 1;
                    config.iops[index] = value;
                } else if (key.startsWith('recol')) {
                    let index = parseInt(key.charAt(5)) - 1;
                    let type = key.charAt(6);

                    if (type == 's') {
                        config.recol_s[index] = parseInt(value);
                    } else if (type == 'd') {
                        config.recol_d[index] = parseInt(value);
                    }
                } else if (key == 'manwear3') {
                    config.manwear3 = parseInt(value);
                } else if (key == 'womanwear3') {
                    config.womanwear3 = parseInt(value);
                } else if (key == 'manhead') {
                    config.manhead = parseInt(value);
                } else if (key == 'womanhead') {
                    config.womanhead = parseInt(value);
                } else if (key == 'manhead2') {
                    config.manhead2 = parseInt(value);
                } else if (key == 'womanhead2') {
                    config.womanhead2 = parseInt(value);
                } else if (key == '2dzan') {
                    config.zan2d = parseInt(value);
                } else if (key == 'certlink') {
                    config.certlink = parseInt(value);
                } else if (key == 'certtemplate') {
                    config.certtemplate = parseInt(value);
                } else if (key.startsWith('count')) {
                    const parts = value.split(',');
                    let index = parseInt(key.charAt(5)) - 1;
                    config.countobj[index] = parseInt(parts[0]);
                    config.countco[index] = parseInt(parts[1]);
                } else if (key.startsWith('weight')) {
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
                } else if (key === 'wearpos') {
                    config.wearpos[0] = getWearPosIndex(value);
                    if (config.wearpos[0] === -1) {
                        console.log(`Unknown wearpos: ${value}`);
                    }
                } else if (key === 'wearpos2') {
                    config.wearpos[1] = getWearPosIndex(value);
                    if (config.wearpos[1] === -1) {
                        console.log(`Unknown wearpos2: ${value}`);
                    }
                } else if (key === 'wearpos3') {
                    config.wearpos[2] = getWearPosIndex(value);
                    if (config.wearpos[2] === -1) {
                        console.log(`Unknown wearpos3: ${value}`);
                    }
                } else if (key.startsWith('param')) {
                    const parts = value.split(',');
                    let k = parts[0];
                    let v = parts[1];
                    if (!isNaN(v)) {
                        v = Number(v);
                    }
                    config.param[k] = v;
                } else if (key.startsWith('readyanim')) {
                    config.readyanim = Number(value);
                } else {
                    console.log(`Unrecognized obj config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            ObjectType.config[config.namedId] = config;
            ObjectType.ids[config.id] = config.namedId;
        }

        ObjectType.count = ObjectType.ids.length;

        for (let i = 0; i < ObjectType.count; i++) {
            const config = ObjectType.config[ObjectType.ids[i]];

            if (config.certlink != -1 && config.certtemplate != -1) {
                config.toCertificate();
            }
        }
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(ObjectType.count);
        dat.p2(ObjectType.count);

        for (let i = 0; i < ObjectType.count; i++) {
            const config = ObjectType.config[ObjectType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.certlink != -1 && this.certtemplate != -1) {
            dat.p1(97);
            dat.p2(this.certlink);

            dat.p1(98);
            dat.p2(this.certtemplate);

            dat.p1(0);
            dat.pos = 0;
            return dat;
        }

        if (this.model != 0) {
            dat.p1(1);
            dat.p2(this.model);
        }

        if (this.name) {
            dat.p1(2);
            dat.pjstr(this.name);
        }

        if (this.desc) {
            dat.p1(3);
            dat.pjstr(this.desc);
        }

        if (this.zoom2d != 2000) {
            dat.p1(4);
            dat.p2(this.zoom2d);
        }

        if (this.xan2d != 0) {
            dat.p1(5);
            dat.p2(this.xan2d);
        }

        if (this.yan2d != 0) {
            dat.p1(6);
            dat.p2(this.yan2d);
        }

        if (this.xof2d != 0) {
            dat.p1(7);
            dat.p2(this.xof2d);
        }

        if (this.yof2d != 0) {
            dat.p1(8);
            dat.p2(this.yof2d);
        }

        if (this.code9) {
            dat.p1(9);
        }

        if (this.code10 != -1) {
            dat.p1(10);
            dat.p2(this.code10);
        }

        if (this.stackable) {
            dat.p1(11);
        }

        if (this.cost != 1) {
            dat.p1(12);
            dat.p4(this.cost);
        }

        if (this.members) {
            dat.p1(16);
        }

        if (this.manwear != -1) {
            dat.p1(23);
            dat.p2(this.manwear);
            dat.p1(this.manwearOffsetY);
        }

        if (this.manwear2 != -1) {
            dat.p1(24);
            dat.p2(this.manwear2);
        }

        if (this.womanwear != -1) {
            dat.p1(25);
            dat.p2(this.womanwear);
            dat.p1(this.womanwearOffsetY);
        }

        if (this.womanwear2 != -1) {
            dat.p1(26);
            dat.p2(this.womanwear2);
        }

        for (let i = 0; i < 5; i++) {
            if (this.ops[i] != null) {
                dat.p1(30 + i);
                dat.pjstr(this.ops[i]);
            }
        }

        for (let i = 0; i < 5; i++) {
            if (this.iops[i] != null) {
                dat.p1(35 + i);
                dat.pjstr(this.iops[i]);
            }
        }

        if (this.recol_s.length) {
            dat.p1(40);
            dat.p1(this.recol_s.length);

            for (let i = 0; i < this.recol_s.length; i++) {
                dat.p2(this.recol_s[i]);
                dat.p2(this.recol_d[i]);
            }
        }

        if (this.manwear3 != -1) {
            dat.p1(78);
            dat.p2(this.manwear3);
        }

        if (this.womanwear3 != -1) {
            dat.p1(79);
            dat.p2(this.womanwear3);
        }

        if (this.manhead != -1) {
            dat.p1(90);
            dat.p2(this.manhead);
        }

        if (this.womanhead != -1) {
            dat.p1(91);
            dat.p2(this.womanhead);
        }

        if (this.manhead2 != -1) {
            dat.p1(92);
            dat.p2(this.manhead2);
        }

        if (this.womanhead2 != -1) {
            dat.p1(93);
            dat.p2(this.womanhead2);
        }

        if (this.zan2d != 0) {
            dat.p1(95);
            dat.p2(this.zan2d);
        }

        for (let i = 0; i < this.countobj.length; i++) {
            dat.p1(100 + i);
            dat.p2(this.countobj[i]);
            dat.p2(this.countco[i]);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    static unpack(dat) {
        ObjectType.count = dat.g2();

        for (let i = 0; i < ObjectType.count; i++) {
            let config = new ObjectType();
            config.namedId = `obj_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    config.model = dat.g2();
                } else if (code == 2) {
                    config.name = dat.gjstr();
                } else if (code == 3) {
                    config.desc = dat.gjstr();
                } else if (code == 4) {
                    config.zoom2d = dat.g2();
                } else if (code == 5) {
                    config.xan2d = dat.g2s();
                } else if (code == 6) {
                    config.yan2d = dat.g2s();
                } else if (code == 7) {
                    config.xof2d = dat.g2s();
                } else if (code == 8) {
                    config.yof2d = dat.g2s();
                } else if (code == 9) {
                    config.code9 = true;
                } else if (code == 10) {
                    config.code10 = dat.g2();
                } else if (code == 11) {
                    config.stackable = true;
                } else if (code == 12) {
                    config.cost = dat.g4();
                } else if (code == 16) {
                    config.members = true;
                } else if (code == 23) {
                    config.manwear = dat.g2();
                    config.manwearOffsetY = dat.g1b();
                } else if (code == 24) {
                    config.manwear2 = dat.g2();
                } else if (code == 25) {
                    config.womanwear = dat.g2();
                    config.womanwearOffsetY = dat.g1b();
                } else if (code == 26) {
                    config.womanwear2 = dat.g2();
                } else if (code >= 30 && code < 35) {
                    config.ops[code - 30] = dat.gjstr();
                } else if (code >= 35 && code < 40) {
                    config.iops[code - 35] = dat.gjstr();
                } else if (code == 40) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.recol_s[i] = dat.g2();
                        config.recol_d[i] = dat.g2();
                    }
                } else if (code == 78) {
                    config.manwear3 = dat.g2();
                } else if (code == 79) {
                    config.womanwear3 = dat.g2();
                } else if (code == 90) {
                    config.manhead = dat.g2();
                } else if (code == 91) {
                    config.womanhead = dat.g2();
                } else if (code == 92) {
                    config.manhead2 = dat.g2();
                } else if (code == 93) {
                    config.womanhead2 = dat.g2();
                } else if (code == 95) {
                    config.zan2d = dat.g2();
                } else if (code == 97) {
                    config.certlink = dat.g2();
                } else if (code == 98) {
                    config.certtemplate = dat.g2();
                } else if (code >= 100 && code < 110) {
                    config.countobj[code - 100] = dat.g2();
                    config.countco[code - 100] = dat.g2();
                } else {
                    console.log(`Unrecognised obj config code ${code} in ${config.namedId}`);
                }
            }

            ObjectType.config[config.namedId] = config;
            ObjectType.ids[config.id] = config.namedId;
        }
    }

    // ----

    getHighAlchValue() {
        return Math.floor(this.cost * 0.6);
    }

    getLowAlchValue() {
        return Math.floor(this.cost * 0.4);
    }

    toCertificate() {
        let template = ObjectType.get(this.certtemplate);
        this.model = template.model;
        this.zoom2d = template.zoom2d;
        this.xan2d = template.xan2d;
        this.yan2d = template.yan2d;
        this.zan2d = template.zan2d;
        this.xof2d = template.xof2d;
        this.yof2d = template.yof2d;
        this.recol_s = template.recol_s;
        this.recol_d = template.recol_d;

        let link = ObjectType.get(this.certlink);
        this.name = link.name;
        this.desc = link.desc;
        this.cost = link.cost;

        let article = 'a';
        if (link.name[0] == 'A' || link.name[0] == 'E' || link.name[0] == 'I' || link.name[0] == 'O' || link.name[0] == 'U') {
            article = 'an';
        }
        this.desc = `Swap this note at any bank for ${article} ${link.name}.`;
        this.stackable = true;
    }
}
