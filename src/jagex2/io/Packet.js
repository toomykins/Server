import LinkList from '#jagex2/datastruct/LinkList.js';
import Linkable from '#jagex2/datastruct/Linkable.js';

// Buffer wrapper for reading and writing data
export default class Packet extends Linkable {
    static crctable = new Int32Array(256);
    static BITMASK = new Int32Array(32);

    // cache instances to avoid allocations
    static cacheMinCount = 0;
    static cacheMidCount = 0;
    static cacheMaxCount = 0;

    static cacheMin = new LinkList();
    static cacheMid = new LinkList();
    static cacheMax = new LinkList();

    static {
        for (let i = 0; i < 256; i++) {
            let crc = i;

            for (let j = 0; j < 8; j++) {
                if ((crc & 1) === 1) {
                    crc = (crc >>> 1) ^ 0xEDB88320;
                } else {
                    crc >>>= 1;
                }
            }

            Packet.crctable[i] = crc;
        }

        for (let i = 0; i < 32; i++) {
            Packet.BITMASK[i] = (1 << i) - 1;
        }
    }

    data = new Int8Array();
    pos = 0;
    bitPos = 0;
    random = null;

    constructor(src) {
        super();

        if (src) {
            this.data = new Int8Array(src);
        }

        this.pos = 0;
    }

    // ----

    static alloc(type) {
        let packet = null;

        if (type === 0 && Packet.cacheMinCount > 0) {
            Packet.cacheMinCount--;
            packet = Packet.cacheMin.pollFront();
        } else if (type === 1 && Packet.cacheMidCount > 0) {
            Packet.cacheMidCount--;
            packet = Packet.cacheMid.pollFront();
        } else if (type === 2 && Packet.cacheMaxCount > 0) {
            Packet.cacheMaxCount--;
            packet = Packet.cacheMax.pollFront();
        }

        if (packet !== null) {
            packet.pos = 0;
            return packet;
        }

        packet = new Packet();
        packet.pos = 0;
        if (type === 0) {
            packet.data = new Int8Array(100);
        } else if (type === 1) {
            packet.data = new Int8Array(5000);
        } else if (type === 2) {
            packet.data = new Int8Array(30000);
        }
        return packet;
    }

    release() {
        this.pos = 0;

        if (this.data.length === 100 && Packet.cacheMinCount < 1000) {
            Packet.cacheMin.pushBack(this);
            Packet.cacheMinCount++;
        } else if (this.data.length === 5000 && Packet.cacheMidCount < 250) {
            Packet.cacheMid.pushBack(this);
            Packet.cacheMidCount++;
        } else if (this.data.length === 30000 && Packet.cacheMaxCount < 50) {
            Packet.cacheMax.pushBack(this);
            Packet.cacheMaxCount++;
        }
    }

    // ----

    p1isaac(opcode) {
        this.data[this.pos++] = (opcode + this.random.nextInt());
    }

    p1(value) {
        this.data[this.pos++] = value;
    }

    p2(value) {
        this.data[this.pos++] = (value >> 8);
        this.data[this.pos++] = value;
    }

    ip2(value) {
        this.data[this.pos++] = value;
        this.data[this.pos++] = (value >> 8);
    }

    p3(value) {
        this.data[this.pos++] = (value >> 16);
        this.data[this.pos++] = (value >> 8);
        this.data[this.pos++] = value;
    }

    p4(value) {
        this.data[this.pos++] = (value >> 24);
        this.data[this.pos++] = (value >> 16);
        this.data[this.pos++] = (value >> 8);
        this.data[this.pos++] = value;
    }

    ip4(value) {
        this.data[this.pos++] = value;
        this.data[this.pos++] = (value >> 8);
        this.data[this.pos++] = (value >> 16);
        this.data[this.pos++] = (value >> 24);
    }

    p8(value) {
        this.p4(Number(value >> 32n));
        this.p4(Number(value & 0xFFFFFFFFn));
    }

    pjstr(str) {
        this.data.set(Buffer.from(str), this.pos);
        this.pos += str.length;
        this.data[this.pos++] = 10;
    }

    pdata(src, len, off) {
        this.data.set(src.data.subarray(off, off + len), this.pos);
    }

    psize1(len) {
        this.data[this.pos - len - 1] = len;
    }

    psize2(len) {
        this.data[this.pos - len - 2] = (len >> 8);
        this.data[this.pos - len - 1] = len;
    }

    psize4(len) {
        this.data[this.pos - len - 4] = (len >> 24);
        this.data[this.pos - len - 3] = (len >> 16);
        this.data[this.pos - len - 2] = (len >> 8);
        this.data[this.pos - len - 1] = len;
    }

    // putsmart saves space by using 1 byte for values < 128
    // range is 0 to 32767
    psmart(value) {
        if (value < 0x80 && value > 0) {
            this.p1(value);
        } else if (value < 0x8000 && value >= 0x80) {
            this.p2(value + 0x8000);
        } else {
            console.error(`Error psmart out of range: ${value}`);
        }
    }

    // put smart signed saves space by using 1 byte for values between -64 and 63
    // range is -16384 to 16383
    psmarts(value) {
        if (value < 0x40 && value >= -0x40) {
            this.p1(value + 0x40);
        } else if (value < 0x4000 && value >= -0x4000) {
            this.p2(value + 0xC000);
        } else {
            console.error(`Error psmarts out of range: ${value}`);
        }
    }

    // ----

    g1isaac() {
        return (this.data[this.pos++] - this.random.nextInt()) & 0xFF;
    }

    g1() {
        return this.data[this.pos++] & 0xFF;
    }

    g1b() {
        return this.data[this.pos++];
    }

    g2() {
        this.pos += 2;
        return ((this.data[this.pos - 2] & 0xFF) << 8) | (this.data[this.pos - 1] & 0xFF);
    }

    g2s() {
        this.pos += 2;
        let value = ((this.data[this.pos - 1] & 0xFF) << 8) | (this.data[this.pos - 2] & 0xFF);
        if (value > 0x8000) {
            value -= 0x10000;
        }
        return value;
    }

    g3() {
        this.pos += 3;
        return ((this.data[this.pos - 3] & 0xFF) << 16) | ((this.data[this.pos - 2] & 0xFF) << 8) | (this.data[this.pos - 1] & 0xFF);
    }

    g4() {
        this.pos += 4;
        let value = ((this.data[this.pos - 4] & 0xFF) << 24) | ((this.data[this.pos - 3] & 0xFF) << 16) | ((this.data[this.pos - 2] & 0xFF) << 8) | (this.data[this.pos - 1] & 0xFF);
        if (value > 0x7FFFFFFF) {
            value -= 0x100000000;
        }
        return value;
    }

    g4s() {
        this.pos += 4;
        return ((this.data[this.pos - 4] & 0xFF) << 24) | ((this.data[this.pos - 3] & 0xFF) << 16) | ((this.data[this.pos - 2] & 0xFF) << 8) | (this.data[this.pos - 1] & 0xFF);
    }

    g8() {
        let high = BigInt(this.g4());
        let low = BigInt(this.g4());
        return (high << 32n) | low;
    }

    gstr() {
        let str = '';
        while (this.data[this.pos] !== 10) {
            str += String.fromCharCode(this.data[this.pos++]);
        }
        this.pos++;
        return str;
    }

    gdata(dest, len, off) {
        dest.set(this.data.subarray(this.pos, this.pos + len), off);
        this.pos += len;
    }

    gsmart() {
        let value = this.data[this.pos] & 0xFF;

        if (value < 128) {
            return this.g1() - 0x40;
        } else {
            return this.g2() - 0xC000;
        }
    }

    gsmarts() {
        let value = this.data[this.pos] & 0xFF;

        if (value < 128) {
            return this.g1();
        } else {
            return this.g2() - 0x8000;
        }
    }

    // ----

    accessBits() {
        this.bitPos = this.pos * 8;
    }

    accessBytes() {
        this.pos = (this.bitPos + 7) / 8;
    }

    gBit(n) {
    }

    // ----

    pad(n) {
        while (this.pos < n) {
            this.data[this.pos++] = 0;
        }
    }

    moveupdata(n) {
        if (n >= this.pos) {
            this.pos = 0;
            return;
        }

        for (let i = n; i < this.pos; i++) {
            this.data[i - n] = this.data[i];
        }

        this.pos -= n;
    }

    rsaenc(mod, exp) {
    }

    rsadec(mod, exp) {
    }

    addcrc() {
    }
}
