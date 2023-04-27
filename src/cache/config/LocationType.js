import Constants from '#cache/config/Constants.js';
import Packet from '#util/Packet.js';

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
    interactable = false;
    _interactable = -1;
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
    active = true;
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

    static fromDef(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');
        let offset = 0;

        let loc;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                loc = new LocationType();
                loc.namedId = namedId;
                loc.id = id;

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
                let value = parts[1].trim().replaceAll('model_', '').replaceAll('seq_', '');

                if (value[0] === '^') {
                    value = Constants.get(value);
                }

                if (key.startsWith('model')) {
                    let index = parseInt(key.slice(5)) - 1;

                    if (value.indexOf(',') !== -1) {
                        const parts = value.split(',');
                        loc.models[index] = parseInt(parts[0]);
                        loc.shapes[index] = LocationType[parts[1].replace('^', '')];
                    } else {
                        loc.models[index] = parseInt(value);
                        loc.shapes[index] = LocationType.CENTREPIECE_STRAIGHT;
                    }
                } else if (key == 'name') {
                    loc.name = value;
                } else if (key == 'desc') {
                    loc.desc = value;
                } else if (key == 'width') {
                    loc.width = parseInt(value);
                } else if (key == 'length') {
                    loc.length = parseInt(value);
                } else if (key == 'blockwalk') {
                    loc.blockwalk = value == 'yes';
                } else if (key == 'blockrange') {
                    loc.blockrange = value == 'yes';
                } else if (key == 'interactable') {
                    loc._interactable = parseInt(value);
                } else if (key == 'hillskew') {
                    loc.hillskew = value == 'yes';
                } else if (key == 'sharelight') {
                    loc.sharelight = value == 'yes';
                } else if (key == 'occlude') {
                    loc.occlude = value == 'yes';
                } else if (key == 'anim') {
                    loc.anim = parseInt(value);
                } else if (key == 'disposealpha') {
                    loc.disposeAlpha = value == 'yes';
                } else if (key == 'walloff') {
                    loc.walloff = parseInt(value);
                } else if (key == 'ambient') {
                    loc.ambient = parseInt(value);
                } else if (key == 'contrast') {
                    loc.contrast = parseInt(value);
                } else if (key.startsWith('op')) {
                    let index = parseInt(key.charAt(2)) - 1;
                    loc.ops[index] = value;
                } else if (key.startsWith('recol')) {
                    let index = parseInt(key.charAt(5)) - 1;
                    let type = key.charAt(6);

                    if (type == 's') {
                        loc.recol_s[index] = parseInt(value);
                    } else if (type == 'd') {
                        loc.recol_d[index] = parseInt(value);
                    }
                } else if (key == 'mapfunction') {
                    loc.mapfunction = parseInt(value);
                } else if (key == 'mirror') {
                    loc.mirror = value == 'yes';
                } else if (key == 'active') {
                    loc.active = value == 'yes';
                } else if (key == 'resizex') {
                    loc.resizex = parseInt(value);
                } else if (key == 'resizey') {
                    loc.resizey = parseInt(value);
                } else if (key == 'resizez') {
                    loc.resizez = parseInt(value);
                } else if (key == 'mapscene') {
                    loc.mapscene = parseInt(value);
                } else if (key == 'blocksides') {
                    loc.blocksides = parseInt(value);
                } else if (key == 'xoff') {
                    loc.xoff = parseInt(value);
                } else if (key == 'yoff') {
                    loc.yoff = parseInt(value);
                } else if (key == 'zoff') {
                    loc.zoff = parseInt(value);
                } else if (key == 'forcedecor') {
                    loc.forcedecor = value == 'yes';
                } else {
                    console.log(`Unrecognized loc config "${key}" in ${loc.namedId}`);
                }

                offset++;
            }

            LocationType.config[loc.namedId] = loc;
            LocationType.ids[loc.id] = loc.namedId;
        }

        LocationType.count = LocationType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(LocationType.count);
        dat.p2(LocationType.count);

        for (let i = 0; i < LocationType.count; i++) {
            const loc = LocationType.config[LocationType.ids[i]];
            const packed = loc.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        const dat = new Packet();

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

        if (this._interactable != -1) {
            dat.p1(19);
            dat.p1(this._interactable);
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

        if (!this.active) {
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
        let count = dat.g2();

        for (let i = 0; i < count; i++) {
            let loc = new LocationType();
            loc.namedId = `loc_${i}`;
            loc.id = i;

            let interactive = -1;
            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        this.models[i] = dat.g2();
                        this.shapes[i] = dat.g1();
                    }
                } else if (code == 2) {
                    this.name = dat.gjstr();
                } else if (code == 3) {
                    this.desc = dat.gjstr();
                } else if (code == 14) {
                    this.width = dat.g1();
                } else if (code == 15) {
                    this.length = dat.g1();
                } else if (code == 17) {
                    this.blockwalk = false;
                } else if (code == 18) {
                    this.blockrange = false;
                } else if (code == 19) {
                    interactive = dat.g1();
                    this._interactable = interactive; // so we can preserve the original value

                    if (interactive == 1) {
                        this.interactable = true;
                    }
                } else if (code == 21) {
                    this.hillskew = true;
                } else if (code == 22) {
                    this.sharelight = true;
                } else if (code == 23) {
                    this.occlude = true;
                } else if (code == 24) {
                    this.anim = dat.g2();

                    if (this.anim == 65535) {
                        this.anim = -1;
                    }
                } else if (code == 25) {
                    this.disposeAlpha = true;
                } else if (code == 28) {
                    this.walloff = dat.g1();
                } else if (code == 29) {
                    this.ambient = dat.g1b();
                } else if (code == 39) {
                    this.contrast = dat.g1b();
                } else if (code >= 30 && code < 35) {
                    this.ops[code - 30] = dat.gjstr();
                } else if (code == 40) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        this.recol_s[i] = dat.g2();
                        this.recol_d[i] = dat.g2();
                    }
                } else if (code == 60) {
                    this.mapfunction = dat.g2();
                } else if (code == 62) {
                    this.mirror = true;
                } else if (code == 64) {
                    this.active = false;
                } else if (code == 65) {
                    this.resizex = dat.g2();
                } else if (code == 66) {
                    this.resizey = dat.g2();
                } else if (code == 67) {
                    this.resizez = dat.g2();
                } else if (code == 68) {
                    this.mapscene = dat.g2();
                } else if (code == 69) {
                    this.blocksides = dat.g1();
                } else if (code == 70) {
                    this.xoff = dat.g2s();
                } else if (code == 71) {
                    this.yoff = dat.g2s();
                } else if (code == 72) {
                    this.zoff = dat.g2s();
                } else if (code == 73) {
                    this.forcedecor = true;
                } else {
                    console.log(`Unrecognised loc config code ${code} in ${loc.namedId}`);
                }
            }

            if (interactive == -1) {
                this.interactable = false;

                if ((this.shapes.length && this.shapes[0] == LocationType.CENTREPIECE_STRAIGHT) || this.ops.length) {
                    this.interactable = true;
                }
            }

            LocationType.config[loc.namedId] = loc;
            LocationType.ids[loc.id] = loc.namedId;
        }

        LocationType.count = LocationType.ids.length;
    }
}
