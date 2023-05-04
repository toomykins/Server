import Packet from '#io/Packet.js';
import Constants from './Constants.js';
import PackOrder from './PackOrder.js';
import SequenceType from './SequenceType.js';

export default class NpcType {
    static config = {};
    static ids = [];
    static count = 0;

    namedId = '';
    id = -1;

    models = [];
    name = '';
    desc = '';
    size = 1;
    readyanim = -1;
    disposeAlpha = false; // TODO: likely auto-generated if an animation uses transparency
    walkanim = -1;
    walkanim_b = -1;
    walkanim_r = -1;
    walkanim_l = -1;
    ops = [];
    recol_s = [];
    recol_d = [];
    heads = [];
    opcode90 = -1;
    opcode91 = -1;
    opcode92 = -1;
    visonmap = true;
    vislevel = -1;
    resizex = 128;
    resizez = 128;

    // server only
    attack = 1;
    strength = 1;
    defence = 1;
    ranged = 1;
    magic = 1;
    hitpoints = 1;

    static get(id) {
        if (NpcType.config[id]) {
            return NpcType.config[id];
        }

        if (NpcType.ids[id]) {
            return NpcType.config[NpcType.ids[id]];
        }

        return null;
    }

    static getId(namedId) {
        if (NpcType.config[namedId]) {
            return NpcType.config[namedId].id;
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
                if (config && !NpcType.ids[config.id]) {
                    // allow for empty configs
                    NpcType.config[config.namedId] = config;
                    NpcType.ids[config.id] = config.namedId;
                }

                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                if (NpcType.config[namedId]) {
                    console.error(`Duplicate npc config: ${namedId}`);
                }

                config = new NpcType();
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

                if (key.startsWith('model')) {
                    let index = parseInt(key.slice(5)) - 1;
                    config.models[index] = parseInt(PackOrder.get(value));
                } else if (key == 'name') {
                    config.name = value;
                } else if (key == 'desc') {
                    config.desc = value;
                } else if (key == 'size') {
                    config.size = parseInt(value);
                } else if (key == 'readyanim') {
                    config.readyanim = SequenceType.getId(value);
                } else if (key == 'walkanim') {
                    config.walkanim = SequenceType.getId(value);
                } else if (key == 'disposealpha') {
                    config.disposeAlpha = value == 'yes';
                } else if (key == 'walkanim_b') {
                    config.walkanim_b = SequenceType.getId(value);
                } else if (key == 'walkanim_r') {
                    config.walkanim_r = SequenceType.getId(value);
                } else if (key == 'walkanim_l') {
                    config.walkanim_l = SequenceType.getId(value);
                } else if (key.startsWith('op')) {
                    let index = parseInt(key.charAt(2)) - 1;
                    config.ops[index] = value;
                } else if (key.startsWith('recol')) {
                    let index = parseInt(key.charAt(5)) - 1;
                    let type = key.charAt(6);

                    if (type == 's') {
                        config.recol_s[index] = parseInt(value);
                    } else if (type == 'd') {
                        config.recol_d[index] = parseInt(value);
                    }
                } else if (key.startsWith('head')) {
                    let index = parseInt(key.slice(4)) - 1;
                    config.heads[index] = parseInt(PackOrder.get(value));
                } else if (key == 'visonmap') {
                    config.visonmap = value == 'yes';
                } else if (key == 'vislevel') {
                    config.vislevel = parseInt(value);
                } else if (key == 'resizex') {
                    config.resizex = parseInt(value);
                } else if (key == 'resizez') {
                    config.resizez = parseInt(value);
                } else if (key === 'attack') {
                    config.attack = parseInt(value);
                } else if (key === 'strength') {
                    config.strength = parseInt(value);
                } else if (key === 'defence') {
                    config.defence = parseInt(value);
                } else if (key === 'ranged') {
                    config.ranged = parseInt(value);
                } else if (key === 'magic') {
                    config.magic = parseInt(value);
                } else if (key === 'hitpoints') {
                    config.hitpoints = parseInt(value);
                } else {
                    console.log(`Unknown config key: ${key}`);
                }

                offset++;
            }

            NpcType.config[config.namedId] = config;
            NpcType.ids[config.id] = config.namedId;
        }

        NpcType.count = NpcType.ids.length;
    }

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(NpcType.count);
        dat.p2(NpcType.count);

        for (let i = 0; i < NpcType.count; i++) {
            const config = NpcType.config[NpcType.ids[i]];
            const packed = config.pack();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    pack() {
        let dat = new Packet();

        if (this.models.length) {
            dat.p1(1);
            dat.p1(this.models.length);

            for (let i = 0; i < this.models.length; i++) {
                dat.p2(this.models[i]);
            }
        }

        if (this.name) {
            dat.p1(2);
            dat.pjstr(this.name);
        }

        if (this.desc) {
            dat.p1(3);
            dat.pjstr(this.desc);
        }

        if (this.size != 1) {
            dat.p1(12);
            dat.p1(this.size);
        }

        if (this.readyanim != -1) {
            dat.p1(13);
            dat.p2(this.readyanim);
        }

        if (this.walkanim != -1 && this.walkanim_b == -1 && this.walkanim_r == -1 && this.walkanim_l == -1) {
            dat.p1(14);
            dat.p2(this.walkanim);
        }

        if (this.disposeAlpha) {
            dat.p1(16);
        }

        if (this.walkanim_b != -1 || this.walkanim_r != -1 || this.walkanim_l != -1) {
            dat.p1(17);
            dat.p2(this.walkanim);
            dat.p2(this.walkanim_b);
            dat.p2(this.walkanim_r);
            dat.p2(this.walkanim_l);
        }

        for (let i = 0; i < 10; i++) {
            if (this.ops[i]) {
                dat.p1(30 + i);
                dat.pjstr(this.ops[i]);
            }
        }

        if (this.recol_s.length) {
            dat.p1(40);
            dat.p1(this.recol_s.length);

            for (let i = 0; i < this.recol_s.length; i++) {
                dat.p2(this.recol_s[i]);
                dat.p2(this.recol_d[i]);
            }
        }

        if (this.heads.length) {
            dat.p1(60);
            dat.p1(this.heads.length);

            for (let i = 0; i < this.heads.length; i++) {
                dat.p2(this.heads[i]);
            }
        }

        if (this.opcode90 != -1) {
            dat.p1(90);
            dat.p2(this.opcode90);
        }

        if (this.opcode91 != -1) {
            dat.p1(91);
            dat.p2(this.opcode91);
        }

        if (this.opcode92 != -1) {
            dat.p1(92);
            dat.p2(this.opcode92);
        }

        if (!this.visonmap) {
            dat.p1(93);
        }

        let vislevel = this.vislevel;
        if (vislevel === -1 && (this.attack != 1 || this.strength != 1 || this.defence != 1 || this.hitpoints != 1 || this.ranged != 1 || this.magic != 1)) {
            let defensive = 0.25 * (this.defence + this.hitpoints);

            let melee = 0.325 * (this.attack + this.strength);
            let range = 0.325 * Math.floor(Math.floor(this.ranged / 2) + this.ranged);
            let magic = 0.325 * Math.floor(Math.floor(this.magic / 2) + this.magic);
            let offensive = Math.max(melee, range, magic);

            // TODO: this combat formula produces a different result than the cache should have.
            // there was an update in august 2004 that corrected a bug with NPC levels.
            // in the meantime we're overriding the computed value with vislevel= and skipping this block of code
            vislevel = Math.floor(defensive + offensive);
        }

        if (vislevel != -1) {
            dat.p1(95);
            dat.p2(vislevel);
        }

        if (this.resizex != 128) {
            dat.p1(97);
            dat.p2(this.resizex);
        }

        if (this.resizez != 128) {
            dat.p1(98);
            dat.p2(this.resizez);
        }

        dat.p1(0);
        dat.pos = 0;
        return dat;
    }

    static unpack(dat) {
        NpcType.count = dat.g2();

        for (let i = 0; i < NpcType.count; i++) {
            let config = new NpcType();
            config.namedId = `npc_${i}`;
            config.id = i;

            while (true) {
                const code = dat.g1();
                if (code == 0) {
                    break;
                }

                if (code == 1) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.models[i] = dat.g2();
                    }
                } else if (code == 2) {
                    config.name = dat.gjstr();
                } else if (code == 3) {
                    config.desc = dat.gjstr();
                } else if (code == 12) {
                    config.size = dat.g1b();
                } else if (code == 13) {
                    config.readyanim = dat.g2();
                } else if (code == 14) {
                    config.walkanim = dat.g2();
                } else if (code == 16) {
                    config.disposeAlpha = true;
                } else if (code == 17) {
                    config.walkanim = dat.g2();
                    config.walkanim_b = dat.g2();
                    config.walkanim_r = dat.g2();
                    config.walkanim_l = dat.g2();
                } else if (code >= 30 && code < 40) {
                    config.ops[code - 30] = dat.gjstr();
                } else if (code == 40) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.recol_s[i] = dat.g2();
                        config.recol_d[i] = dat.g2();
                    }
                } else if (code == 60) {
                    const count = dat.g1();

                    for (let i = 0; i < count; i++) {
                        config.heads[i] = dat.g2();
                    }
                } else if (code == 90) {
                    config.opcode90 = dat.g2();
                } else if (code == 91) {
                    config.opcode91 = dat.g2();
                } else if (code == 92) {
                    config.opcode92 = dat.g2();
                } else if (code == 93) {
                    config.visonmap = false;
                } else if (code == 95) {
                    config.vislevel = dat.g2();
                } else if (code == 97) {
                    config.resizex = dat.g2();
                } else if (code == 98) {
                    config.resizez = dat.g2();
                } else {
                    console.log(`Unrecognised npc config code ${code} in ${config.namedId}`);
                }
            }

            NpcType.config[loc.namedId] = loc;
            NpcType.ids[loc.id] = loc.namedId;
        }
    }
}
