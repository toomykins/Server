import Constants from '#cache/config/Constants.js';
import Packet from '#io/Packet.js';
import PackOrder from './PackOrder.js';
import SequenceType from './SequenceType.js';

export default class LocationType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    models = [];
    shapes = [];
    name = '';
    desc = '';
    width = 1;
    length = 1;
    blockwalk = true;
    blockrange = true;
    active = -1;
    hillskew = false;
    sharelight = false;
    occlude = false;
    anim = -1;
    disposeAlpha = false;
    walloff = 16;
    ambient = 0;
    contrast = 0;
    ops = [];
    recol_s = [];
    recol_d = [];
    mapfunction = -1;
    mirror = false;
    shadow = true;
    resizex = 128;
    resizey = 128;
    resizez = 128;
    mapscene = -1;
    blocksides = 0;
    xoff = 0;
    yoff = 0;
    zoff = 0;
    forcedecor = false;

    static get(id) {
        if (LocationType.config[id]) {
            return LocationType.config[id];
        }

        if (LocationType.ids[id]) {
            return LocationType.config[LocationType.ids[id]];
        }

        return null;
    }

    static getId(namedId) {
        if (LocationType.config[namedId]) {
            return LocationType.config[namedId].id;
        }

        return -1;
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
                if (config && !LocationType.ids[config.id]) {
                    // allow for empty configs
                    LocationType.config[config.namedId] = config;
                    LocationType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (LocationType.config[namedId]) {
                    console.error(`Duplicate loc config: ${namedId}`);
                }

                config = new LocationType();
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
                let value = parts.slice(1).join('='); // re-join because value may contain '='

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

                // if value is a number, convert it
                if (!isNaN(value)) {
                    value = parseInt(value);
                }

                if (key.startsWith('model')) {
                    let index = parseInt(key.slice(5)) - 1;

                    if (typeof value === 'string' && value.indexOf(',') !== -1) {
                        const parts = value.split(',');
                        config.models[index] = parseInt(PackOrder.get(parts[0]));
                        config.shapes[index] = parseInt(parts[1]);
                    } else {
                        config.models[index] = parseInt(PackOrder.get(value));
                        config.shapes[index] = 10;
                    }
                } else if (key == 'name') {
                    config.name = value;
                } else if (key == 'desc') {
                    config.desc = value;
                } else if (key == 'width') {
                    config.width = parseInt(value);
                } else if (key == 'length') {
                    config.length = parseInt(value);
                } else if (key == 'blockwalk') {
                    config.blockwalk = value == 'yes';
                } else if (key == 'blockrange') {
                    config.blockrange = value == 'yes';
                } else if (key == 'active') {
                    config.active = value == 'yes' ? 1 : 0;
                } else if (key == 'hillskew') {
                    config.hillskew = value == 'yes';
                } else if (key == 'sharelight') {
                    config.sharelight = value == 'yes';
                } else if (key == 'occlude') {
                    config.occlude = value == 'yes';
                } else if (key == 'anim') {
                    config.anim = SequenceType.getId(value);
                } else if (key == 'disposealpha') {
                    config.disposeAlpha = value == 'yes';
                } else if (key == 'walloff') {
                    config.walloff = parseInt(value);
                } else if (key == 'ambient') {
                    config.ambient = parseInt(value);
                } else if (key == 'contrast') {
                    config.contrast = parseInt(value);
                } else if (key.startsWith('op')) {
                    let index = parseInt(key.charAt(2)) - 1;
                    config.ops[index] = value;
                } else if (key.startsWith('recol')) {
                    let index = parseInt(key.charAt(5)) - 1;
                    let type = key.charAt(6);

                    if (type == 's') {
                        config.recol_s[index] = parseInt(value);
                    } else if (type == 'd') {
                        config.recol_d[index] = parseInt(value);
                    }
                } else if (key == 'mapfunction') {
                    config.mapfunction = parseInt(value);
                } else if (key == 'mirror') {
                    config.mirror = value == 'yes';
                } else if (key == 'shadow') {
                    config.shadow = value == 'yes';
                } else if (key == 'resizex') {
                    config.resizex = parseInt(value);
                } else if (key == 'resizey') {
                    config.resizey = parseInt(value);
                } else if (key == 'resizez') {
                    config.resizez = parseInt(value);
                } else if (key == 'mapscene') {
                    config.mapscene = parseInt(value);
                } else if (key == 'blocksides') {
                    config.blocksides = parseInt(value);
                } else if (key == 'xoff') {
                    config.xoff = parseInt(value);
                } else if (key == 'yoff') {
                    config.yoff = parseInt(value);
                } else if (key == 'zoff') {
                    config.zoff = parseInt(value);
                } else if (key == 'forcedecor') {
                    config.forcedecor = value == 'yes';
                } else {
                    console.log(`Unrecognized loc config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            LocationType.config[config.namedId] = config;
            LocationType.ids[config.id] = config.namedId;
        }

        LocationType.count = LocationType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(LocationType.count);
        dat.p2(LocationType.count);

        for (let i = 0; i < LocationType.count; i++) {
            const config = LocationType.config[LocationType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.models.length) {
            dat.p1(1);
            dat.p1(this.models.length);

            for (let i = 0; i < this.models.length; i++) {
                dat.p2(this.models[i]);
                dat.p1(this.shapes[i]);
            }
        }

        if (this.name) {
            dat.p1(2);
            dat.pjstr(this.name);
        }

        if (this.desc) {
            dat.p1(3);
            dat.pjstr(this.desc);
        }

        if (this.width) {
            dat.p1(14);
            dat.p1(this.width);
        }

        if (this.length) {
            dat.p1(15);
            dat.p1(this.length);
        }

        if (!this.blockwalk) {
            dat.p1(17);
        }

        if (!this.blockrange) {
            dat.p1(18);
        }

        if (this.active != -1) {
            dat.p1(19);
            dat.p1(this.active);
        }

        if (this.hillskew) {
            dat.p1(21);
        }

        if (this.sharelight) {
            dat.p1(22);
        }

        if (this.occlude) {
            dat.p1(23);
        }

        if (this.anim != -1) {
            dat.p1(24);
            dat.p2(this.anim);
        }

        if (this.disposeAlpha) {
            dat.p1(25);
        }

        if (this.walloff != 16) {
            dat.p1(28);
            dat.p1(this.walloff);
        }

        if (this.ambient != 0) {
            dat.p1(29);
            dat.p1(this.ambient);
        }

        if (this.contrast != 0) {
            dat.p1(39);
            dat.p1(this.contrast);
        }

        for (let i = 0; i < 5; i++) {
            if (this.ops[i] != null) {
                dat.p1(30 + i);
                dat.pjstr(this.ops[i]);
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

        if (this.mapfunction != -1) {
            dat.p1(60);
            dat.p2(this.mapfunction);
        }

        if (this.mirror) {
            dat.p1(62);
        }

        if (!this.shadow) {
            dat.p1(64);
        }

        if (this.resizex != 128) {
            dat.p1(65);
            dat.p2(this.resizex);
        }

        if (this.resizey != 128) {
            dat.p1(66);
            dat.p2(this.resizey);
        }

        if (this.resizez != 128) {
            dat.p1(67);
            dat.p2(this.resizez);
        }

        if (this.mapscene != -1) {
            dat.p1(68);
            dat.p2(this.mapscene);
        }

        if (this.blocksides != 0) {
            dat.p1(69);
            dat.p1(this.blocksides);
        }

        if (this.xoff != 0) {
            dat.p1(70);
            dat.p2(this.xoff);
        }

        if (this.yoff != 0) {
            dat.p1(71);
            dat.p2(this.yoff);
        }

        if (this.zoff != 0) {
            dat.p1(72);
            dat.p2(this.zoff);
        }

        if (this.forcedecor) {
            dat.p1(73);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    static unpack(dat) {
        LocationType.count = dat.g2();

        for (let i = 0; i < LocationType.count; i++) {
            let config = new LocationType();
            config.namedId = `loc_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.models[i] = dat.g2();
                        config.shapes[i] = dat.g1();
                    }
                } else if (code == 2) {
                    config.name = dat.gjstr();
                } else if (code == 3) {
                    config.desc = dat.gjstr();
                } else if (code == 14) {
                    config.width = dat.g1();
                } else if (code == 15) {
                    config.length = dat.g1();
                } else if (code == 17) {
                    config.blockwalk = false;
                } else if (code == 18) {
                    config.blockrange = false;
                } else if (code == 19) {
                    config.active = dat.g1();
                } else if (code == 21) {
                    config.hillskew = true;
                } else if (code == 22) {
                    config.sharelight = true;
                } else if (code == 23) {
                    config.occlude = true;
                } else if (code == 24) {
                    config.anim = dat.g2();

                    if (config.anim == 65535) {
                        config.anim = -1;
                    }
                } else if (code == 25) {
                    config.disposeAlpha = true;
                } else if (code == 28) {
                    config.walloff = dat.g1();
                } else if (code == 29) {
                    config.ambient = dat.g1b();
                } else if (code == 39) {
                    config.contrast = dat.g1b();
                } else if (code >= 30 && code < 35) {
                    config.ops[code - 30] = dat.gjstr();
                } else if (code == 40) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.recol_s[i] = dat.g2();
                        config.recol_d[i] = dat.g2();
                    }
                } else if (code == 60) {
                    config.mapfunction = dat.g2();
                } else if (code == 62) {
                    config.mirror = true;
                } else if (code == 64) {
                    config.shadow = false;
                } else if (code == 65) {
                    config.resizex = dat.g2();
                } else if (code == 66) {
                    config.resizey = dat.g2();
                } else if (code == 67) {
                    config.resizez = dat.g2();
                } else if (code == 68) {
                    config.mapscene = dat.g2();
                } else if (code == 69) {
                    config.blocksides = dat.g1();
                } else if (code == 70) {
                    config.xoff = dat.g2s();
                } else if (code == 71) {
                    config.yoff = dat.g2s();
                } else if (code == 72) {
                    config.zoff = dat.g2s();
                } else if (code == 73) {
                    config.forcedecor = true;
                } else {
                    console.log(`Unrecognised loc config code ${code} in ${config.namedId}`);
                }
            }

            LocationType.config[config.namedId] = config;
            LocationType.ids[config.id] = config.namedId;
        }
    }
}
