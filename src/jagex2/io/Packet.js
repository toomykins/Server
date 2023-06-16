import fs from 'fs';
import { dirname } from 'path';

export default class Packet {
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
        return this.data[this.pos++];
    }

    gbool() {
        return this.g1() === 1;
    }

    g1s() {
        let value = this.data[this.pos++];
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
            return this.g1() - 64;
        } else {
            return this.g2() - 0xC000;
        }
    }
}
