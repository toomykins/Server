import fs from 'fs';
import { dirname } from 'path';

export default class Packet {
    static crctable = new Int32Array(256);

    static {
        for (let i = 0; i < 256; i++) {
            let crc = i;

            for (let j = 0; j < 8; j++) {
                if ((crc & 1) == 1) {
                    crc = crc >>> 1 ^ 0xEDB88320;
                } else {
                    crc >>>= 1;
                }
            }

            Packet.crctable[i] = crc;
        }
    }

    static crc32(src, length = src.length, offset = 0) {
        let crc = 0xFFFFFFFF;

        for (let i = offset; i < offset + length; i++) {
            crc = crc >>> 8 ^ Packet.crctable[(crc ^ src[i]) & 0xFF];
        }

        return ~crc;
    }

    // ----

    constructor(src) {
        if (src instanceof Packet) {
            src = src.data;
        }

        this.data = new Uint8Array(src);
        this.pos = 0;
    }

    get length() {
        return this.data.length;
    }

    get available() {
        return this.data.length - this.pos;
    }

    resize(length) {
        if (this.length < length) {
            let temp = new Uint8Array(length);
            temp.set(this.data);
            this.data = temp;
        }
    }

    ensure(length) {
        if (this.available < length) {
            this.resize(this.length + length);
        }
    }

    // ----

    static load(path) {
        return new Packet(fs.readFileSync(path));
    }

    save(path, length = this.pos, start = 0) {
        let dir = dirname(path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(path, this.data.subarray(start, start + length));
    }

    // ----

    g1() {
        return this.data[this.pos++] & 0xFF;
    }

    gbool() {
        return this.g1() === 1;
    }

    g1s() {
        let value = this.data[this.pos++] & 0xFF;
        if (value > 0x7F) {
            value -= 0x100;
        }
        return value;
    }

    g2() {
        return (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g2s() {
        let value = (this.data[this.pos++] << 8) | this.data[this.pos++];
        if (value > 0x7FFF) {
            value -= 0x10000;
        }
        return value;
    }

    g3() {
        return (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g4() {
        return (this.data[this.pos++] << 24) | (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g4s() {
        let value = (this.data[this.pos++] << 24) | (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++];
        if (value > 0x7FFFFFFF) {
            value -= 0x100000000;
        }
        return value;
    }

    gjstr() {
        let str = '';
        while (this.data[this.pos] != 10) {
            str += String.fromCharCode(this.data[this.pos++]);
        }
        this.pos++;
        return str;
    }

    gdata(length = this.available, offset = this.pos, advance = true) {
        let temp = this.data.subarray(offset, offset + length);
        if (advance) {
            this.pos += length;
        }
        return temp;
    }

    gPacket(length = this.available, offset = this.pos, advance = true) {
        return new Packet(this.gdata(length, offset, advance));
    }

    gsmart() {
        let value = this.data[this.pos] & 0xFF;
        if (value < 128) {
            return this.g1();
        } else {
            return this.g2() - 0x8000;
        }
    }

    gsmarts() {
        let value = this.data[this.pos] & 0xFF;
        if (value < 128) {
            return this.g1() - 0x40;
        } else {
            return this.g2() - 0xC000;
        }
    }

    // ----

    p1(value) {
        this.ensure(1);
        this.data[this.pos++] = value;
    }

    pbool(value) {
        this.p1(value ? 1 : 0);
    }

    p2(value) {
        this.ensure(2);
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p3(value) {
        this.ensure(3);
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value) {
        this.ensure(4);
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    pjstr(str) {
        this.ensure(str.length + 1);
        for (let i = 0; i < str.length; i++) {
            this.data[this.pos++] = str.charCodeAt(i);
        }
        this.data[this.pos++] = 10;
    }

    pdata(src) {
        if (src instanceof Packet) {
            src = src.data;
        }

        if (!src.length) {
            return;
        }

        this.ensure(src.length);
        this.data.set(src, this.pos);
        this.pos += src.length;
    }

    psmart(value) {
        if (value < 128) {
            this.p1(value);
        } else {
            this.p2(value + 0x8000);
        }
    }

    psmarts(value) {
        if (value < 128) {
            this.p1(value + 0x40);
        } else {
            this.p2(value + 0xC000);
        }
    }
}
