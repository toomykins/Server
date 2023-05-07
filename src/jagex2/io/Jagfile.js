import Packet from '#jagex2/io/Packet.js';
import Bunzip2 from '#jagex2/io/BZip2.js';

export default class Jagfile {
    data = new Uint8Array();
    fileCount = 0;
    fileHash = [];
    fileSizeUnpacked = [];
    fileSizePacked = [];
    filePos = [];
    unpacked = false;

    constructor(src) {
        this.load(src);
    }

    load(src) {
        let data = new Packet(src);
        let unpackedSize = data.g3();
        let packedSize = data.g3();

        if (unpackedSize === packedSize) {
            this.buffer = src;
            this.unpacked = false;
        } else {
            let temp = new Uint8Array(unpackedSize);
            temp.set(Bunzip2(src.subarray(6)));
            this.buffer = temp;
            data = new Packet(temp);
            this.unpacked = true;
        }

        this.fileCount = data.g2();
        let pos = data.pos + this.fileCount * 10;
        for (let i = 0; i < this.fileCount; i++) {
            this.fileHash[i] = data.g4();
            this.fileSizeUnpacked[i] = data.g3();
            this.fileSizePacked[i] = data.g3();
            this.filePos[i] = pos;
            pos += this.fileSizePacked[i];
        }
    }

    read(name) {
        let hash = 0;
        name = name.toUpperCase();

        for (let i = 0; i < name.length; i++) {
            hash = hash * 61 + name.charCodeAt(i) - 32;
        }
        hash &= 0xFFFFFFFF;

        for (let i = 0; i < this.fileCount; i++) {
            if (this.fileHash[i] === hash) {
                let data = new Uint8Array(this.fileSizeUnpacked[i]);

                let compressed = this.buffer.subarray(this.filePos[i], this.filePos[i] + this.fileSizeUnpacked[i]);
                if (this.unpacked) {
                    data.set(compressed);
                } else {
                    data.set(Bunzip2(compressed));
                }

                return data;
            }
        }

        return null;
    }
}
