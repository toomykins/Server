import Packet from '#util/Packet.js';
import Constants from './Constants.js';

export default class FloorType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    rgb = 0;
    texture = -1;
    opcode3 = false;
    occlude = true;
    name = '';

    static get(id) {
        if (FloorType.config[id]) {
            return FloorType.config[id];
        }

        if (FloorType.ids[id]) {
            return FloorType.config[FloorType.ids[id]];
        }

        return null;
    }

    static getId(namedId) {
        if (FloorType.config[namedId]) {
            return FloorType.config[namedId].id;
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
                if (config && !FloorType.ids[config.id]) {
                    // allow for empty configs
                    FloorType.config[config.namedId] = config;
                    FloorType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (FloorType.config[namedId]) {
                    console.error(`Duplicate flo config: ${namedId}`);
                }

                config = new FloorType();
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
                let value = parts[1];

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

                if (key == 'name') {
                    config.name = value;
                } else if (key == 'texture') {
                    config.texture = parseInt(value);
                } else if (key == 'colour') {
                    config.rgb = parseInt(value, 16);
                } else if (key == 'occlude') {
                    config.occlude = value == 'yes';
                } else {
                    console.log(`Unrecognized flo config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            FloorType.config[config.namedId] = config;
            FloorType.ids[config.id] = config.namedId;
        }

        FloorType.count = FloorType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(FloorType.count);
        dat.p2(FloorType.count);

        for (let i = 0; i < FloorType.count; i++) {
            const config = FloorType.config[FloorType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.rgb != 0) {
            dat.p1(1);
            dat.p3(this.rgb);
        }

        if (this.texture != -1) {
            dat.p1(2);
            dat.p1(this.texture);
        }

        if (this.opcode3) {
            dat.p1(3);
        }

        if (!this.occlude) {
            dat.p1(5);
        }

        if (this.name) {
            dat.p1(6);
            dat.pjstr(this.name);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    static unpack(dat) {
        FloorType.count = dat.g2();

        for (let i = 0; i < FloorType.count; i++) {
            let config = new FloorType();
            config.namedId = `flo_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    this.rgb = dat.g3();
                } else if (code === 2) {
                    this.texture = dat.g1();
                } else if (code === 3) {
                    this.opcode3 = true;
                } else if (code === 5) {
                    this.occlude = false;
                } else if (code === 6) {
                    this.name = dat.gjstr();
                } else {
                    console.log(`Unrecognized flo config code ${code} in ${config.namedId}`);
                }
            }

            FloorType.config[config.namedId] = config;
            FloorType.ids[config.id] = config.namedId;
        }
    }
}
