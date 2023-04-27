import Packet from '#util/Packet.js';

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

    static fromDef(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');
        let offset = 0;

        let flo;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                flo = new FloorType();
                flo.namedId = namedId;
                flo.id = id;

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
                let value = parts[1].trim().replaceAll('texture_', '');

                if (key == 'name') {
                    flo.name = value;
                } else if (key == 'texture') {
                    flo.texture = parseInt(value);
                } else if (key == 'colour') {
                    flo.rgb = parseInt(value, 16);
                } else if (key == 'occlude') {
                    flo.occlude = value == 'yes';
                } else {
                    console.log(`Unrecognized flo config "${key}" in ${flo.namedId}`);
                }

                offset++;
            }

            FloorType.config[flo.namedId] = flo;
            FloorType.ids[flo.id] = flo.namedId;
        }

        FloorType.count = FloorType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(FloorType.count);
        dat.p2(FloorType.count);

        for (let i = 0; i < FloorType.count; i++) {
            const flo = FloorType.config[FloorType.ids[i]];
            const packed = flo.pack();
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
        return dat;
    }

    static unpack(dat) {
        let count = dat.g2();

        for (let i = 0; i < count; i++) {
            let flo = new FloorType();
            flo.namedId = `flo_${i}`;
            flo.id = i;

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
                    console.log(`Unrecognized flo config code ${code} in ${flo.namedId}`);
                }
            }

            FloorType.config[flo.namedId] = flo;
            FloorType.ids[flo.id] = flo.namedId;
        }

        FloorType.count = FloorType.ids.length;
    }
}
