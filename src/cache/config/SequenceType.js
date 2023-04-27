import Packet from '#util/Packet.js';

export default class SequenceType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;
    framecount = 0;
    primaryFrames = [];
    secondaryFrames = [];
    frameDelay = [];
    replayoff = -1;
    labelGroups = [];
    stretches = false;
    priority = 5;
    mainhand = -1;
    offhand = -1;
    replaycount = 99;

    static get(id) {
        if (SequenceType.config[id]) {
            return SequenceType.config[id];
        }

        if (SequenceType.ids[id]) {
            return SequenceType.config[SequenceType.ids[id]];
        }

        return null;
    }

    static fromDef(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');
        let offset = 0;

        let seq;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                seq = new SequenceType();
                seq.namedId = namedId;
                seq.id = id;

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
                let value = parts[1].trim();

                if (key === 'framecount') {
                    seq.framecount = parseInt(value);
                    seq.primaryFrames = new Array(seq.framecount);
                    seq.primaryFrames.fill(-1);
                    seq.secondaryFrames = new Array(seq.framecount);
                    seq.secondaryFrames.fill(-1);
                    seq.frameDelay = new Array(seq.framecount);
                    seq.frameDelay.fill(0);
                } else if (key.startsWith('frame_b')) {
                    let index = parseInt(key.substring('frame_b'.length)) - 1;
                    seq.secondaryFrames[index] = parseInt(value);
                } else if (key.startsWith('framedel')) {
                    let index = parseInt(key.substring('framedel'.length)) - 1;
                    seq.frameDelay[index] = parseInt(value);
                } else if (key.startsWith('frame')) {
                    let index = parseInt(key.substring('frame'.length)) - 1;
                    seq.primaryFrames[index] = parseInt(value);
                } else if (key === 'replayoff') {
                    seq.replayoff = parseInt(value);
                } else if (key.startsWith('label')) {
                    let index = parseInt(key.substring('label'.length)) - 1;
                    seq.labelGroups[index] = parseInt(value);
                } else if (key === 'stretches') {
                    seq.stretches = value === 'yes';
                } else if (key === 'priority') {
                    seq.priority = parseInt(value);
                } else if (key === 'mainhand') {
                    seq.mainhand = parseInt(value);
                } else if (key === 'offhand') {
                    seq.offhand = parseInt(value);
                } else if (key === 'replaycount') {
                    seq.replaycount = parseInt(value);
                } else {
                    console.log(`Unrecognized seq config "${key}" reading ${seq.namedId}`);
                }
    
                offset++;
            }
    
            SequenceType.config[seq.namedId] = seq;
            SequenceType.ids[seq.id] = seq.namedId;
        }

        SequenceType.count = SequenceType.ids.length;
    }

    static pack() {
        let dat = new Packet();
        let idx = new Packet();

        dat.p2(SequenceType.count);
        idx.p2(SequenceType.count);

        for (let i = 0; i < SequenceType.count; i++) {
            const seq = SequenceType.config[SequenceType.ids[i]];
            const packed = seq.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.stretches) {
            dat.p1(4);
        }

        if (this.replayoff != -1) {
            dat.p1(2);
            dat.p2(this.replayoff);
        }

        if (this.priority != 5) {
            dat.p1(5);
            dat.p1(this.priority);
        }

        if (this.framecount) {
            dat.p1(1);
            dat.p1(this.framecount);

            for (let i = 0; i < this.framecount; i++) {
                dat.p2(this.primaryFrames[i]);
                dat.p2(this.secondaryFrames[i]);
                dat.p2(this.frameDelay[i]);
            }
        }

        if (this.labelGroups.length) {
            dat.p1(3);
            dat.p1(this.labelGroups.length);

            for (let i = 0; i < this.labelGroups.length; i++) {
                dat.p1(this.labelGroups[i]);
            }
        }

        if (this.mainhand != -1) {
            dat.p1(6);
            dat.p2(this.mainhand);
        }

        if (this.offhand != -1) {
            dat.p1(7);
            dat.p2(this.offhand);
        }

        if (this.replaycount != 99) {
            dat.p1(8);
            dat.p1(this.replaycount);
        }

        dat.p1(0);
        return dat;
    }

    static unpack(dat) {
        let count = dat.g2();

        for (let i = 0; i < count; i++) {
            let seq = new SequenceType();
            seq.namedId = `seq_${i}`;
            seq.id = i;

            while (true) {
                let code = dat.g1();
                if (code === 0) {
                    break;
                }

                if (code === 1) {
                    seq.framecount = dat.g1();

                    seq.primaryFrames = new Array(seq.framecount);
                    seq.secondaryFrames = new Array(seq.framecount);
                    seq.frameDelay = new Array(seq.framecount);

                    for (let i = 0; i < seq.framecount; i++) {
                        seq.primaryFrames[i] = dat.g2();
                        seq.secondaryFrames[i] = dat.g2();
                        if (seq.secondaryFrames[i] === 65535) {
                            seq.secondaryFrames[i] = -1;
                        }

                        seq.frameDelay[i] = dat.g2();
                    }
                } else if (code === 2) {
                    seq.replayoff = dat.g2();
                } else if (code === 3) {
                    let count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        seq.labelGroups[i] = dat.g1();
                    }
                } else if (code === 4) {
                    seq.stretches = true;
                } else if (code === 5) {
                    seq.priority = dat.g1();
                } else if (code === 6) {
                    seq.mainhand = dat.g2();
                } else if (code === 7) {
                    seq.offhand = dat.g2();
                } else if (code === 8) {
                    seq.replaycount = dat.g1();
                } else {
                    console.log(`Unrecognized seq config code ${code} reading ${seq.namedId}`);
                    process.exit(0);
                }
            }

            SequenceType.config[seq.namedId] = seq;
            SequenceType.ids[seq.id] = seq.namedId;
        }

        SequenceType.count = SequenceType.ids.length;
    }
}
