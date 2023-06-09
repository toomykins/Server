import fs from 'fs';
import { dirname } from 'path';

export default class Packet {
    data = new Int8Array();
    pos = 0;
    bitPos = 0;

    constructor(src) {
        if (src instanceof Packet) {
            src = src.data;
        }

        if (src) {
            this.data = new Int8Array(src);
        }
    }

    static load(path) {
        let dir = dirname(path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        return new Packet(fs.readFileSync(path));
    }

    save(path, length = this.pos, start = 0) {
        let dir = dirname(path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(path, this.data.subarray(start, start + length));
    }

    resize(size) {
        let temp = new Int8Array(size);
        temp.set(this.data);
        this.data = temp;
    }

    ensure(size, aggressive = false) {
        if (this.data.length < size) {
            if (aggressive) {
                this.resize(size + 1000);
            } else {
                this.resize(size);
            }
        }
    }

    // ----

    get length() {
        return this.data.length;
    }

    get available() {
        return this.data.length - this.pos;
    }

    // ----

    g1() {
        return this.data[this.pos++] & 0xFF;
    }

    g1b() {
        return this.data[this.pos++];
    }

    gbool() {
        return this.g1() === 1;
    }

    g2() {
        return (((this.data[this.pos++] & 0xFF) << 8) | (this.data[this.pos++] & 0xFF)) >>> 0;
    }

    g2s() {
        let value = ((this.data[this.pos++] & 0xFF) << 8) | (this.data[this.pos++] & 0xFF);
        if (value > 32767) {
            value -= 65536;
        }
        return value;
    }

    g3() {
        return (((this.data[this.pos++] & 0xFF) << 16) | ((this.data[this.pos++] & 0xFF) << 8) | (this.data[this.pos++] & 0xFF)) >>> 0;
    }

    g4() {
        return (((this.data[this.pos++] & 0xFF) << 24) | ((this.data[this.pos++] & 0xFF) << 16) | ((this.data[this.pos++] & 0xFF) << 8) | (this.data[this.pos++] & 0xFF)) >>> 0;
    }

    g4s() {
        return ((this.data[this.pos++] & 0xFF) << 24) | ((this.data[this.pos++] & 0xFF) << 16) | ((this.data[this.pos++] & 0xFF) << 8) | (this.data[this.pos++] & 0xFF);
    }

    g8() {
        let high = BigInt(this.g4());
        let low = BigInt(this.g4());
        return high << 32n | low;
    }

    gjstr() {
        // newline-terminated string
        let str = '';
        while (this.data[this.pos] !== 10) {
            str += String.fromCharCode(this.data[this.pos++]);
        }
        this.pos++;
        return str;
    }

    gdata(length, offset = this.pos, advance = true) {
        let data = this.data.subarray(offset, offset + length);
        if (advance) {
            this.pos += length;
        }
        return data;
    }

    gPacket(length) {
        return new Packet(this.gdata(length));
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

    // ----

    p1(value) {
        this.ensure(this.pos + 1);
        this.data[this.pos++] = value;
    }

    pbool(value) {
        this.ensure(this.pos + 1);
        this.data[this.pos++] = value ? 1 : 0;
    }

    p2(value) {
        this.ensure(this.pos + 2);
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p3(value) {
        this.ensure(this.pos + 3);
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value) {
        this.ensure(this.pos + 4);
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p8(value) {
        this.ensure(this.pos + 8);
        let high = value >> 32n;
        let low = value & 0xFFFFFFFFn;
        this.p4(Number(high));
        this.p4(Number(low));
    }

    pjstr(str) {
        this.ensure(this.pos + str.length + 1);
        for (let i = 0; i < str.length; i++) {
            this.data[this.pos++] = str.charCodeAt(i);
        }
        this.data[this.pos++] = 10;
    }

    pdata(data) {
        if (!data.length) {
            return;
        }

        this.ensure(this.pos + data.length);
        if (data instanceof Packet) {
            data = data.data;
        }

        this.data.set(data, this.pos);
        this.pos += data.length;
    }

    // ----

    bits() {
        this.bitPos = this.pos * 8;
    }

    bytes() {
        this.pos = (this.bitPos + 7) / 8;
    }

    gBit(n) {
    }

    pBit(n, value) {
    }
}
