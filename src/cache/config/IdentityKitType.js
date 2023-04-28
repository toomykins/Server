import Constants from '#cache/config/Constants.js';
import Packet from '#util/Packet.js';

export default class IdentityKitType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    bodypart = -1;
    disable = false;
    models = [];
    recol_s = [];
    recol_d = [];
    heads = [];

    static get(id) {
        if (IdentityKitType.config[id]) {
            return IdentityKitType.config[id];
        }

        if (IdentityKitType.ids[id]) {
            return IdentityKitType.config[IdentityKitType.ids[id]];
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
                if (config && !IdentityKitType.ids[config.id]) {
                    // allow for empty configs
                    IdentityKitType.config[config.namedId] = config;
                    IdentityKitType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (IdentityKitType.config[namedId]) {
                    console.error(`Duplicate idk config: ${namedId}`);
                }

                config = new IdentityKitType();
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

                if (key == 'bodypart') {
                    config.bodypart = value;
                } else if (key == 'disable') {
                    config.disable = true;
                } else if (key.startsWith('model')) {
                    config.models = config.models || [];

                    let number = key.substring('model'.length) - 1;
                    config.models[number] = parseInt(value);
                } else if (key.startsWith('recol')) {
                    config.recol_s = config.recol_s || [];
                    config.recol_d = config.recol_d || [];

                    let number = key.substring('recol'.length, 'recol1'.length) - 1;
                    let type = key.substring('recol1'.length);
                    if (type == 's') {
                        config.recol_s[number] = parseInt(value);
                    } else if (type == 'd') {
                        config.recol_d[number] = parseInt(value);
                    }
                } else if (key.startsWith('head')) {
                    config.heads = config.heads || [];

                    let number = key.substring('head'.length) - 1;
                    config.heads[number] = parseInt(value);
                } else {
                    console.log(`Unrecognized idk config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            IdentityKitType.config[config.namedId] = config;
            IdentityKitType.ids[config.id] = config.namedId;
        }

        IdentityKitType.count = IdentityKitType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(IdentityKitType.count);
        dat.p2(IdentityKitType.count);

        for (let i = 0; i < IdentityKitType.count; i++) {
            const config = IdentityKitType.config[IdentityKitType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.bodypart != -1) {
            dat.p1(1);
            dat.p1(this.bodypart);
        }

        if (this.models.length) {
            dat.p1(2);
            dat.p1(this.models.length);

            for (let i = 0; i < this.models.length; i++) {
                dat.p2(this.models[i]);
            }
        }

        if (this.disable) {
            dat.p1(3);
        }

        for (let i = 0; i < this.recol_s.length; i++) {
            dat.p1(40 + i);
            dat.p2(this.recol_s[i]);
        }

        for (let i = 0; i < this.recol_d.length; i++) {
            dat.p1(50 + i);
            dat.p2(this.recol_d[i]);
        }

        for (let i = 0; i < this.heads.length; i++) {
            dat.p1(60 + i);
            dat.p2(this.heads[i]);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    static unpack(dat) {
        IdentityKitType.count = dat.g2();

        for (let i = 0; i < IdentityKitType.count; i++) {
            let config = new IdentityKitType();
            config.namedId = `idk_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    config.bodypart = dat.g1();
                } else if (code == 2) {
                    const count = dat.g1();
    
                    for (let i = 0; i < count; i++) {
                        config.models[i] = dat.g2();
                    }
                } else if (code == 3) {
                    config.disable = true;
                } else if (code >= 40 && code < 50) {
                    config.recol_s[code - 40] = dat.g2();
                } else if (code >= 50 && code < 60) {
                    config.recol_d[code - 50] = dat.g2();
                } else if (code >= 60 && code < 70) {
                    config.heads[code - 60] = dat.g2();
                } else {
                    console.log(`Unrecognized idk config code ${code} in ${config.namedId}`);
                }
            }

            IdentityKitType.config[config.namedId] = config;
            IdentityKitType.ids[config.id] = config.namedId;
        }
    }
}
