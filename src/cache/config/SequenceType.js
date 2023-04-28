import Packet from '#util/Packet.js';
import Constants from './Constants.js';

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

        let config;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                if (config && !SequenceType.ids[config.id]) {
                    // allow for empty configs
                    SequenceType.config[config.namedId] = config;
                    SequenceType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                config = new SequenceType();
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
                let value = parts[1].trim();

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

                if (key === 'framecount') {
                    config.framecount = parseInt(value);
                    config.primaryFrames = new Array(config.framecount);
                    config.primaryFrames.fill(-1);
                    config.secondaryFrames = new Array(config.framecount);
                    config.secondaryFrames.fill(-1);
                    config.frameDelay = new Array(config.framecount);
                    config.frameDelay.fill(0);
                } else if (key.startsWith('frame_b')) {
                    let index = parseInt(key.substring('frame_b'.length)) - 1;
                    config.secondaryFrames[index] = parseInt(value);
                } else if (key.startsWith('framedel')) {
                    let index = parseInt(key.substring('framedel'.length)) - 1;
                    config.frameDelay[index] = parseInt(value);
                } else if (key.startsWith('frame')) {
                    let index = parseInt(key.substring('frame'.length)) - 1;
                    config.primaryFrames[index] = parseInt(value);
                } else if (key === 'replayoff') {
                    config.replayoff = parseInt(value);
                } else if (key.startsWith('label')) {
                    let index = parseInt(key.substring('label'.length)) - 1;
                    config.labelGroups[index] = parseInt(value);
                } else if (key === 'stretches') {
                    config.stretches = value === 'yes';
                } else if (key === 'priority') {
                    config.priority = parseInt(value);
                } else if (key === 'mainhand') {
                    config.mainhand = parseInt(value);
                } else if (key === 'offhand') {
                    config.offhand = parseInt(value);
                } else if (key === 'replaycount') {
                    config.replaycount = parseInt(value);
                } else {
                    console.log(`Unrecognized seq config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            SequenceType.config[config.namedId] = config;
            SequenceType.ids[config.id] = config.namedId;
        }

        SequenceType.count = SequenceType.ids.length;
    }

    static pack() {
        let dat = new Packet();
        let idx = new Packet();

        dat.p2(SequenceType.count);
        idx.p2(SequenceType.count);

        for (let i = 0; i < SequenceType.count; i++) {
            const config = SequenceType.config[SequenceType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.framecount) {
            dat.p1(1);
            dat.p1(this.framecount);

            for (let i = 0; i < this.framecount; i++) {
                dat.p2(this.primaryFrames[i]);
                dat.p2(this.secondaryFrames[i]);
                dat.p2(this.frameDelay[i]);
            }
        }

        if (this.replayoff != -1) {
            dat.p1(2);
            dat.p2(this.replayoff);
        }

        if (this.labelGroups.length) {
            dat.p1(3);
            dat.p1(this.labelGroups.length);

            for (let i = 0; i < this.labelGroups.length; i++) {
                dat.p1(this.labelGroups[i]);
            }
        }

        if (this.stretches) {
            dat.p1(4);
        }

        if (this.priority != 5) {
            dat.p1(5);
            dat.p1(this.priority);
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
        SequenceType.count = dat.g2();

        for (let i = 0; i < SequenceType.count; i++) {
            let config = new SequenceType();
            config.namedId = `seq_${i}`;
            config.id = i;

            while (true) {
                let code = dat.g1();
                if (code === 0) {
                    break;
                }

                if (code === 1) {
                    config.framecount = dat.g1();

                    config.primaryFrames = new Array(config.framecount);
                    config.secondaryFrames = new Array(config.framecount);
                    config.frameDelay = new Array(config.framecount);

                    for (let i = 0; i < config.framecount; i++) {
                        config.primaryFrames[i] = dat.g2();
                        config.secondaryFrames[i] = dat.g2();
                        if (config.secondaryFrames[i] === 65535) {
                            config.secondaryFrames[i] = -1;
                        }

                        config.frameDelay[i] = dat.g2();
                    }
                } else if (code === 2) {
                    config.replayoff = dat.g2();
                } else if (code === 3) {
                    let count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.labelGroups[i] = dat.g1();
                    }
                } else if (code === 4) {
                    config.stretches = true;
                } else if (code === 5) {
                    config.priority = dat.g1();
                } else if (code === 6) {
                    config.mainhand = dat.g2();
                } else if (code === 7) {
                    config.offhand = dat.g2();
                } else if (code === 8) {
                    config.replaycount = dat.g1();
                } else {
                    console.log(`Unrecognized seq config code ${code} reading ${config.namedId}`);
                    process.exit(0);
                }
            }

            SequenceType.config[config.namedId] = config;
            SequenceType.ids[config.id] = config.namedId;
        }
    }
}
