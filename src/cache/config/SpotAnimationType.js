import Packet from '#util/Packet.js';
import Constants from './Constants.js';

export default class SpotAnimationType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    model = 0;
    anim = -1;
    disposeAlpha = false;
    resizeh = 128;
    resizev = 128;
    rotation = 0;
    ambient = 0;
    contrast = 0;
    recol_s = [];
    recol_d = [];

    static get(id) {
        if (SpotAnimationType.config[id]) {
            return SpotAnimationType.config[id];
        }

        if (SpotAnimationType.ids[id]) {
            return SpotAnimationType.config[SpotAnimationType.ids[id]];
        }

        return null;
    }

    static getId(namedId) {
        if (SpotAnimationType.config[namedId]) {
            return SpotAnimationType.config[namedId].id;
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
                if (config && !SpotAnimationType.ids[config.id]) {
                    // allow for empty configs
                    SpotAnimationType.config[config.namedId] = config;
                    SpotAnimationType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (SpotAnimationType.config[namedId]) {
                    console.error(`Duplicate spotanim config: ${namedId}`);
                }

                config = new SpotAnimationType();
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
                let value = parts[1].replaceAll('model_', '').replaceAll('seq_', '');

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
                } else if (key == 'anim') {
                    config.anim = parseInt(value);
                } else if (key == 'disposealpha') {
                    config.disposeAlpha = value == 'yes';
                } else if (key == 'resizeh') {
                    config.resizeh = parseInt(value);
                } else if (key == 'resizev') {
                    config.resizev = parseInt(value);
                } else if (key == 'rotation') {
                    config.rotation = parseInt(value);
                } else if (key == 'ambient') {
                    config.ambient = parseInt(value);
                } else if (key == 'contrast') {
                    config.contrast = parseInt(value);
                } else if (key.startsWith('recol')) {
                    let index = parseInt(key.charAt(5)) - 1;
                    let type = key.charAt(6);

                    if (type == 's') {
                        config.recol_s[index] = parseInt(value);
                    } else if (type == 'd') {
                        config.recol_d[index] = parseInt(value);
                    }
                } else {
                    console.log(`Unrecognized spotanim config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            SpotAnimationType.config[config.namedId] = config;
            SpotAnimationType.ids[config.id] = config.namedId;
        }

        SpotAnimationType.count = SpotAnimationType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(SpotAnimationType.count);
        dat.p2(SpotAnimationType.count);

        for (let i = 0; i < SpotAnimationType.count; i++) {
            const config = SpotAnimationType.config[SpotAnimationType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.model != -1) {
            dat.p1(1);
            dat.p2(this.model);
        }

        if (this.anim != -1) {
            dat.p1(2);
            dat.p2(this.anim);
        }

        if (this.disposeAlpha) {
            dat.p1(3);
        }

        if (this.resizeh != 128) {
            dat.p1(4);
            dat.p2(this.resizeh);
        }

        if (this.resizev != 128) {
            dat.p1(5);
            dat.p2(this.resizev);
        }

        if (this.rotation != 0) {
            dat.p1(6);
            dat.p2(this.rotation);
        }

        if (this.ambient != 0) {
            dat.p1(7);
            dat.p1(this.ambient);
        }

        if (this.contrast != 0) {
            dat.p1(8);
            dat.p1(this.contrast);
        }

        for (let i = 0; i < this.recol_s.length; i++) {
            dat.p1(40 + i);
            dat.p2(this.recol_s[i]);
        }

        for (let i = 0; i < this.recol_d.length; i++) {
            dat.p1(50 + i);
            dat.p2(this.recol_d[i]);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    unpack(dat) {
        SpotAnimationType.count = dat.g2();

        for (let i = 0; i < SpotAnimationType.count; i++) {
            let config = new SpotAnimationType();
            config.namedId = `spotanim_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    config.model = dat.g2();
                } else if (code == 2) {
                    config.anim = dat.g2();
                } else if (code == 3) {
                    config.disposeAlpha = true;
                } else if (code == 4) {
                    config.resizeh = dat.g2();
                } else if (code == 5) {
                    config.resizev = dat.g2();
                } else if (code == 6) {
                    config.rotation = dat.g2();
                } else if (code == 7) {
                    config.ambient = dat.g1();
                } else if (code == 8) {
                    config.contrast = dat.g1();
                } else if (code >= 40 && code < 50) {
                    config.recol_s[code - 40] = dat.g2();
                } else if (code >= 50 && code < 60) {
                    config.recol_d[code - 50] = dat.g2();
                } else {
                    console.log(`Unrecognized spotanim config code ${code} in ${config.namedId}`);
                }
            }

            SpotAnimationType.config[config.namedId] = config;
            SpotAnimationType.ids[config.id] = config.namedId;
        }
    }
}
