import Packet from '#util/Packet.js';

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

    static pack() {
        const dat = new Packet();
        const idx = new Packet();

        idx.p2(NpcType.count);
        dat.p2(NpcType.count);

        for (let i = 0; i < NpcType.count; i++) {
            let id = NpcType.ids[i];
            let config = NpcType.config[id];
            let packed = config.encode();
            idx.p2(packed.length);
            dat.pdata(packed);
        }

        return { dat, idx };
    }

    static fromJagConfig(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');
        let offset = 0;

        let npc;
        let id = 0;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                // extract text in brackets
                const namedId = lines[offset].substring(1, lines[offset].indexOf(']'));

                npc = new NpcType();
                npc.namedId = namedId;
                npc.id = id;

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
                const value = parts[1].trim().replaceAll('model_', '').replaceAll('seq_', '');

                if (key.startsWith('model')) {
                    let index = parseInt(key.slice(5)) - 1;
                    npc.models[index] = parseInt(value);
                } else if (key == 'name') {
                    npc.name = value;
                } else if (key == 'desc') {
                    npc.desc = value;
                } else if (key == 'size') {
                    npc.size = parseInt(value);
                } else if (key == 'readyanim') {
                    npc.readyanim = parseInt(value);
                } else if (key == 'walkanim') {
                    npc.walkanim = parseInt(value);
                } else if (key == 'disposealpha') {
                    npc.disposeAlpha = value == 'yes';
                } else if (key == 'walkanim_b') {
                    npc.walkanim_b = parseInt(value);
                } else if (key == 'walkanim_r') {
                    npc.walkanim_r = parseInt(value);
                } else if (key == 'walkanim_l') {
                    npc.walkanim_l = parseInt(value);
                } else if (key.startsWith('op')) {
                    let index = parseInt(key.charAt(2)) - 1;
                    npc.ops[index] = value;
                } else if (key.startsWith('recol')) {
                    let index = parseInt(key.charAt(5)) - 1;
                    let type = key.charAt(6);

                    if (type == 's') {
                        npc.recol_s[index] = parseInt(value);
                    } else if (type == 'd') {
                        npc.recol_d[index] = parseInt(value);
                    }
                } else if (key.startsWith('head')) {
                    let index = parseInt(key.slice(4)) - 1;
                    npc.heads[index] = parseInt(value);
                } else if (key == 'visonmap') {
                    npc.visonmap = value == 'yes';
                } else if (key == 'vislevel') {
                    npc.vislevel = parseInt(value);
                } else if (key == 'resizex') {
                    npc.resizex = parseInt(value);
                } else if (key == 'resizez') {
                    npc.resizez = parseInt(value);
                } else if (key === 'attack') {
                    npc.attack = parseInt(value);
                } else if (key === 'strength') {
                    npc.strength = parseInt(value);
                } else if (key === 'defence') {
                    npc.defence = parseInt(value);
                } else if (key === 'ranged') {
                    npc.ranged = parseInt(value);
                } else if (key === 'magic') {
                    npc.magic = parseInt(value);
                } else if (key === 'hitpoints') {
                    npc.hitpoints = parseInt(value);
                } else {
                    console.log(`Unknown npc key: ${key}`);
                }

                offset++;
            }

            NpcType.config[npc.namedId] = npc;
            NpcType.ids[npc.id] = npc.namedId;
        }

        NpcType.count = NpcType.ids.length;
    }

    static get(id) {
        if (NpcType.config[id]) {
            return NpcType.config[id];
        }

        if (NpcType.ids[id]) {
            return NpcType.config[NpcType.ids[id]];
        }

        return null;
    }

    // encode in client format
    encode() {
        const dat = new Packet();

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

            // TODO: this produces a different result than the cache has.
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
}
