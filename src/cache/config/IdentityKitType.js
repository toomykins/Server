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

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(IdentityKitType.count);
        dat.p2(IdentityKitType.count);

        for (let i = 0; i < IdentityKitType.count; i++) {
            let id = IdentityKitType.ids[i];
            let config = IdentityKitType.config[id];
            let packed = config.encode();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

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

        let idk;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                idk = new IdentityKitType();
                idk.namedId = namedId;
                idk.id = id;

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

                if (key == 'bodypart') {
                    idk.bodypart = value;
                } else if (key == 'disable') {
                    idk.disable = true;
                } else if (key.startsWith('model')) {
                    idk.models = idk.models || [];

                    let number = key.substring('model'.length) - 1;
                    idk.models[number] = parseInt(value);
                } else if (key.startsWith('recol')) {
                    idk.recol_s = idk.recol_s || [];
                    idk.recol_d = idk.recol_d || [];

                    let number = key.substring('recol'.length, 'recol1'.length) - 1;
                    let type = key.substring('recol1'.length);
                    if (type == 's') {
                        idk.recol_s[number] = parseInt(value);
                    } else if (type == 'd') {
                        idk.recol_d[number] = parseInt(value);
                    }
                } else if (key.startsWith('head')) {
                    idk.heads = idk.heads || [];

                    let number = key.substring('head'.length) - 1;
                    idk.heads[number] = parseInt(value);
                }

                offset++;
            }

            IdentityKitType.config[idk.namedId] = idk;
            IdentityKitType.ids[idk.id] = idk.namedId;
        }

        IdentityKitType.count = IdentityKitType.ids.length;
    }

    encode() {
        const dat = new Packet();

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
}
