import Packet from '#util/Packet.js';
import Constants from './Constants.js';

export default class VarpType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    opcode1 = 0;
    opcode2 = 0;
    opcode3 = false;
    opcode3_count = 0;
    opcode3_array = [];
    opcode4 = true;
    clientcode = 0;
    opcode6 = false;
    opcode7 = 0;
    opcode8 = false;
    opcode10 = '';
    transmit = false; // technically probably one of the unused opcodes

    static get(id) {
        if (VarpType.config[id]) {
            return VarpType.config[id];
        }

        if (VarpType.ids[id]) {
            return VarpType.config[VarpType.ids[id]];
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
                if (config && !VarpType.ids[config.id]) {
                    // allow for empty configs
                    VarpType.config[config.namedId] = config;
                    VarpType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (VarpType.config[namedId]) {
                    console.error(`Duplicate varp config: ${namedId}`);
                }

                config = new VarpType();
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

                if (key == 'clientcode') {
                    config.clientcode = parseInt(value);
                } else if (key === 'transmit') {
                    config.transmit = value === 'yes';
                } else {
                    console.log(`Unrecognized varp config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            VarpType.config[config.namedId] = config;
            VarpType.ids[config.id] = config.namedId;
        }

        VarpType.count = VarpType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(VarpType.count);
        dat.p2(VarpType.count);

        for (let i = 0; i < VarpType.count; i++) {
            const config = VarpType.config[VarpType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.opcode1 != 0) {
            dat.p1(1);
            dat.p1(this.opcode1);
        }

        if (this.opcode2 != 0) {
            dat.p1(2);
            dat.p1(this.opcode2);
        }

        if (this.opcode3) {
            dat.p1(3);
        }

        if (!this.opcode4) {
            dat.p1(4);
        }

        if (this.clientcode != 0) {
            dat.p1(5);
            dat.p2(this.clientcode);
        }

        if (this.opcode6) {
            dat.p1(6);
        }

        if (this.opcode7 != 0) {
            dat.p1(7);
            dat.p4(this.opcode7);
        }

        if (this.opcode8) {
            dat.p1(8);
        }

        if (this.opcode10) {
            dat.p1(10);
            dat.pjstr(this.opcode10);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    unpack(dat) {
        VarpType.count = dat.g2();

        for (let i = 0; i < VarpType.count; i++) {
            let config = new VarpType();
            config.namedId = `varp_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    config.opcode1 = dat.g1();
                } else if (code == 2) {
                    config.opcode2 = dat.g1();
                } else if (code == 3) {
                    config.opcode3 = true;
                    config.opcode3_array[config.opcode3_count++] = config.id;
                } else if (code == 4) {
                    config.opcode4 = false;
                } else if (code == 5) {
                    config.clientcode = dat.g2();
                } else if (code == 6) {
                    config.opcode6 = true;
                } else if (code == 7) {
                    config.opcode7 = dat.g4();
                } else if (code == 8) {
                    config.opcode8 = true;
                } else if (code == 10) {
                    config.opcode10 = dat.gjstr();
                } else {
                    console.log(`Unrecognized varp config code ${code} in ${config.namedId}`);
                }
            }
        }
    }
}
