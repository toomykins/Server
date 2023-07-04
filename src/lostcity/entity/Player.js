import fs from 'fs';

import Packet from '#jagex2/io/Packet.js';
import { fromBase37, toBase37 } from '#jagex2/jstring/JString.js';
import VarpType from '#lostcity/cache/VarpType.js';
import { Position } from '#lostcity/entity/Position.js';
import { ClientProt, ClientProtLengths } from '#lostcity/server/ClientProt.js';
import { ServerProt } from '#lostcity/server/ServerProt.js';
import IfType from '#lostcity/cache/IfType.js';
import InvType from '#lostcity/cache/InvType.js';
import ObjType from '#lostcity/cache/ObjType.js';
import { Inventory } from '#lostcity/engine/Inventory.js';
import ScriptProvider from '#lostcity/engine/ScriptProvider.js';
import ScriptState from '#lostcity/engine/ScriptState.js';
import ScriptRunner from '#lostcity/engine/ScriptRunner.js';

const EXP_LEVELS = [
    0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411, 2746,
    3115, 3523, 3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824, 12031, 13363,
    14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648, 37224, 41171, 45529,
    50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333, 111945, 123660, 136594, 150872,
    166636, 184040, 203254, 224466, 247886, 273742, 302288, 333804, 368599, 407015, 449428,
    496254, 547953, 605032, 668051, 737627, 814445, 899257, 992895, 1096278, 1210421, 1336443,
    1475581, 1629200, 1798808, 1986068, 2192818, 2421087, 2673114, 2951373, 3258594, 3597792,
    3972294, 4385776, 4842295, 5346332, 5902831, 6517253, 7195629, 7944614, 8771558,
    9684577, 10692629, 11805606, 13034431
];

function getLevelByExp(exp) {
    if (exp > EXP_LEVELS[EXP_LEVELS.length - 1]) {
        return 99;
    } else if (!exp) {
        return 1;
    }

    for (let i = 1; i < EXP_LEVELS.length; ++i) {
        if (exp < EXP_LEVELS[i]) {
            return i;
        }
    }

    return 1;
}

function getExpByLevel(level) {
    return EXP_LEVELS[level - 1];
}

export default class Player {
    static APPEARANCE = 0x1;
    static ANIM = 0x2;
    static FACE_ENTITY = 0x4;
    static FORCED_CHAT = 0x8;
    static DAMAGE = 0x10;
    static FACE_COORD = 0x20;
    static CHAT = 0x40;
    static SPOTANIM = 0x100;
    static FORCED_MOVEMENT = 0x200;

    username = 'invalid_name';
    x = 3222;
    z = 3222;
    level = 0;
    body = [
        0, // hair
        10, // beard
        18, // body
        26, // arms
        33, // gloves
        36, // legs
        42, // boots
    ];
    colors = [
        0,
        0,
        0,
        0,
        0
    ];
    gender = 0;
    runenergy = 10000;
    runweight = 0;
    playtime = 0;
    stats = new Int32Array(21);
    level = new Uint8Array(21);
    varps = new Int32Array(VarpType.count);
    invs = [
        Inventory.fromType('inv'),
        Inventory.fromType('worn'),
        Inventory.fromType('bank')
    ];

    constructor() {
        for (let i = 0; i < 21; i++) {
            this.stats[i] = 0;
            this.baseLevel[i] = 1;
            this.level[i] = 1;
        }

        // hitpoints starts at level 10
        this.stats[3] = 1154;
        this.baseLevel[3] = 10;
        this.level[3] = 10;

        // temp
        this.placement = true;
        this.mask = Player.APPEARANCE;
    }

    static load(name) {
        let name37 = toBase37(name);
        let safeName = fromBase37(name37);

        let player = new Player();
        player.username = safeName;
        player.username37 = name37;

        if (!fs.existsSync(`data/players/${safeName}.sav`)) {
            return player;
        }

        let sav = Packet.load(`data/players/${safeName}.sav`);
        if (sav.g2() !== 0x2004) {
            throw new Error('Invalid player save');
        }

        if (sav.g2() > 1) {
            throw new Error('Unsupported player save format');
        }

        sav.pos = sav.length - 4;
        let crc = sav.g4();
        if (crc != Packet.crc32(sav, sav.length - 4)) {
            throw new Error('Player save corrupted');
        }

        sav.pos = 4;
        player.x = sav.g2();
        player.z = sav.g2();
        player.level = sav.g1();
        for (let i = 0; i < 7; i++) {
            player.body[i] = sav.g1();
        }
        for (let i = 0; i < 5; i++) {
            player.colors[i] = sav.g1();
        }
        player.gender = sav.g1();
        player.runenergy = sav.g2();
        player.playtime = sav.g2();

        for (let i = 0; i < 21; i++) {
            player.stats[i] = sav.g4();
            player.baseLevel[i] = getLevelByExp(player.stats[i]);
            player.level[i] = sav.g1();
        }

        let varpCount = sav.g2();
        for (let i = 0; i < varpCount; i++) {
            player.varps[i] = sav.g4();
        }

        let invCount = sav.g1();
        for (let i = 0; i < invCount; i++) {
            let size = sav.g1();

            // todo
            for (let j = 0; j < size; j++) {
                sav.g2();
                sav.g4();
            }
        }

        return player;
    }

    save() {
        let sav = new Packet();
        sav.p2(0x2004); // magic
        sav.p2(1); // version

        sav.p2(this.x);
        sav.p2(this.z);
        sav.p1(this.level);
        for (let i = 0; i < 7; i++) {
            sav.p1(this.body[i]);
        }
        for (let i = 0; i < 5; i++) {
            sav.p1(this.colors[i]);
        }
        sav.p1(this.gender);
        sav.p2(this.runenergy);
        sav.p2(this.playtime);

        for (let i = 0; i < 21; i++) {
            sav.p4(this.stats[i]);

            if (this.level[i] === 0) {
                sav.p1(this.level[i]);
            } else {
                sav.p1(getLevelByExp(this.stats[i]));
            }
        }

        sav.p2(this.varps.length);
        for (let i = 0; i < this.varps.length; i++) {
            let type = VarpType.get(i);

            if (type.scope === 'perm') {
                sav.p4(this.varps[i]);
            } else {
                sav.p4(0);
            }
        }

        sav.p1(0); // this.invs.length);
        for (let i = 0; i < 0; i++) {
            sav.p1(this.invs[i].size);

            for (let j = 0; j < this.invs[i].size; j++) {
                sav.p2(this.invs[i].objs[j].id);
                sav.p4(this.invs[i].objs[j].count);
            }
        }

        sav.p4(Packet.crc32(sav));
        let safeName = fromBase37(this.username37);
        sav.save(`data/players/${safeName}.sav`);
        return sav;
    }

    // runtime variables
    pid = -1;
    username37 = -1;
    lowMemory = false;
    webClient = false;
    combatLevel = 0;
    headicons = 0;
    appearance = null; // cached appearance
    baseLevel = new Uint8Array(21);
    loadedX = -1;
    loadedZ = -1;
    walkQueue = [];

    client = null;
    netOut = [];
    mask = 0;
    placement = false;
    faceEntity = -1;
    faceCoordX = -1;
    faceCoordZ = -1;
    animId = -1;
    animDelay = -1;

    // script variables
    delay = 0;
    queue = [];
    weakQueue = [];
    modalOpen = false;
    apScript = null;
    opScript = null;
    currentApRange = 10;
    apRangeCalled = false;
    target = null;
    persistent = false;

    interfaceScript = null; // used to store a paused script (waiting for input)
    countInput = 0; // p_countdialog input
    lastVerifyObj = null;
    lastVerifySlot = null;
    lastVerifyCom = null;

    decodeIn() {
        let offset = 0;

        let decoded = [];
        while (offset < this.client.inOffset) {
            const opcode = this.client.in[offset++];

            let length = ClientProtLengths[opcode];
            if (length == -1) {
                length = this.client.in[offset++];
            } else if (length == -2) {
                length = this.client.in[offset++] << 8 | this.client.in[offset++];
            }

            decoded.push({
                opcode,
                data: new Packet(this.client.in.subarray(offset, offset + length))
            });

            offset += length;
        }

        for (let it = 0; it < decoded.length; it++) {
            const { opcode, data } = decoded[it];

            if (opcode === ClientProt.MAP_REQUEST_AREAS) {
                let requested = [];

                for (let i = 0; i < data.length / 3; i++) {
                    let type = data.g1();
                    let x = data.g1();
                    let z = data.g1();

                    requested.push({ type, x, z });
                }

                for (let i = 0; i < requested.length; i++) {
                    const { type, x, z } = requested[i];

                    const CHUNK_SIZE = 5000 - 1 - 2 - 1 - 1 - 2 - 2;
                    if (type == 0) {
                        let land = Packet.load(`data/pack/server/maps/m${x}_${z}`);

                        for (let off = 0; off < land.length; off += CHUNK_SIZE) {
                            this.dataLand(x, z, land.gdata(CHUNK_SIZE), off, land.length);
                        }

                        this.dataLandDone(x, z);
                    } else if (type == 1) {
                        let loc = Packet.load(`data/pack/server/maps/l${x}_${z}`);

                        for (let off = 0; off < loc.length; off += CHUNK_SIZE) {
                            this.dataLoc(x, z, loc.gdata(CHUNK_SIZE), off, loc.length);
                        }

                        this.dataLocDone(x, z);
                    }
                }
            } else if (opcode === ClientProt.CLIENT_CHEAT) {
                this.onCheat(data.gjstr());
            } else if (opcode == ClientProt.OPHELD1 || opcode == ClientProt.OPHELD2 || opcode == ClientProt.OPHELD3 || opcode == ClientProt.OPHELD4 || opcode == ClientProt.OPHELD5) {
                this.lastVerifyObj = data.g2();
                this.lastVerifySlot = data.g2();
                this.lastVerifyCom = data.g2();

                let atSlot = this.invGetSlot('inv', this.lastVerifySlot);
                if (!atSlot || atSlot.id != this.lastVerifyObj) {
                    return;
                }

                // TODO: check com visibility

                let trigger = 'opheld';
                if (opcode == ClientProt.OPHELD1) {
                    trigger += '1';
                } else if (opcode == ClientProt.OPHELD2) {
                    trigger += '2';
                } else if (opcode == ClientProt.OPHELD3) {
                    trigger += '3';
                } else if (opcode == ClientProt.OPHELD4) {
                    trigger += '4';
                } else if (opcode == ClientProt.OPHELD5) {
                    trigger += '5';
                }

                let objType = ObjType.get(this.lastVerifyObj);
                let script = ScriptProvider.getByName(`[${trigger},${objType.config}]`);
                let state = ScriptRunner.init(script, this, null, null, objType);
                this.executeInterface(state);
            }
        }

        this.client.reset();
    }

    encodeOut() {
        for (let j = 0; j < this.netOut.length; j++) {
            let out = this.netOut[j];

            if (this.client.encryptor) {
                out.data[0] = (out.data[0] + this.client.encryptor.nextInt()) & 0xFF;
            }

            this.client.write(out);
        }

        this.netOut = [];
        this.client.flush();
    }

    onLogin() {
        this.messageGame('Welcome to RuneScape.');
        this.updateUid192(this.pid);

        // normalize client between logins
        this.resetClientVarCache();
        this.camReset();
        this.ifCloseSub();
        this.clearWalkingQueue();

        for (let i = 0; i < this.varps.length; i++) {
            let type = VarpType.get(i);
            let varp = this.varps[i];
            if (varp === 0) {
                continue;
            }

            if ((type.transmit === 'always' || type.transmit === 'once') && scope === 'perm') {
                if (varp < 256) {
                    this.varpSmall(i, varp);
                } else {
                    this.varpLarge(i, varp);
                }
            }
        }

        // TODO: do this automatically when invenory and wornitems get opened
        this.invListenOnCom('inv', 'inventory:inv');
        this.invListenOnCom('worn', 'wornitems:wear');

        for (let i = 0; i < this.stats.length; i++) {
            this.updateStat(i, this.stats[i], this.level[i]);
        }

        this.updateRunEnergy(this.runenergy);
        this.updateRunWeight(this.runweight);

        // TODO: do we want this in runescript instead? (some tabs need text populated too)
        this.ifSetTab('attack_unarmed', 0); // this needs to select based on weapon style equipped
        this.ifSetTab('skills', 1);
        this.ifSetTab('quest_journal', 2); // quest states are not displayed via varp, have to update colors manually
        this.ifSetTab('inventory', 3);
        this.ifSetTab('wornitems', 4); // contains equip bonuses to update
        this.ifSetTab('prayer', 5);
        this.ifSetTab('magic', 6);
        this.ifSetTab('friends', 8);
        this.ifSetTab('ignore', 9);
        this.ifSetTab('logout', 10);
        this.ifSetTab('player_controls', 12);

        if (this.lowMemory) {
            this.ifSetTab('game_options_ld', 11);
            this.ifSetTab('musicplayer_ld', 13);
        } else {
            this.ifSetTab('game_options', 11);
            this.ifSetTab('musicplayer', 13);
        }
    }

    onCheat(cheat) {
        let args = cheat.toLowerCase().split(' ');
        let cmd = args.shift();

        switch (cmd) {
            case 'clearinv': {
                if (args.length > 0) {
                    let inv = args.shift();
                    this.invClear(inv);
                } else {
                    this.invClear('inv');
                }
            } break;
            case 'giveitem': {
                if (args.length < 1) {
                    this.messageGame('Usage: ::giveitem <obj> (count) (inv)');
                    return;
                }

                let obj = args.shift();
                let count = args.shift() || 1;
                let inv = args.shift() || 'inv';

                this.invAdd(inv, obj, count);

                let objType = ObjType.getByName(obj);
                this.messageGame(`Added ${objType.name} x ${count}`);
            } break;
            case 'setvar': {
                if (args.length < 2) {
                    this.messageGame('Usage: ::setvar <var> <value>');
                    return;
                }

                let varp = args.shift();
                let value = args.shift();

                let varpType = VarpType.getByName(varp);
                if (varpType) {
                    this.setVarp(varp, value);
                    this.messageGame(`Setting var ${varp} to ${value}`);
                } else {
                    this.messageGame(`Unknown var ${varp}`);
                }
            } break;
            case 'herbtest': {
                this.invAdd('inv', 'unidentified_guam', 1);
                this.invAdd('inv', 'unidentified_marrentill', 1);
            } break;
        }
    }

    updateBuildArea() {
        let dx = Math.abs(this.x - this.loadedX);
        let dz = Math.abs(this.z - this.loadedZ);

        if (dx >= 36 || dz >= 36) {
            this.loadArea(Position.zone(this.x), Position.zone(this.z));

            this.loadedX = this.x;
            this.loadedZ = this.z;
        }

        // TODO: zone updates in build area
    }

    updatePlayers() {
        let out = new Packet();
        out.bits();

        out.pBit(1, (this.placement || this.mask) ? 1 : 0);
        if (this.placement) {
            out.pBit(2, 3);
            out.pBit(2, this.level);
            out.pBit(7, Position.local(this.x));
            out.pBit(7, Position.local(this.z));
            out.pBit(1, 1);
            out.pBit(1, this.mask ? 1 : 0);
        }
        out.pBit(8, 0);
        out.pBit(11, 2047);
        out.bytes();

        if (this.mask) {
            this.writeUpdate(out, true, false);
        }

        this.playerInfo(out);
    }

    getAppearanceInSlot(slot) {
        let part = -1;
        if (slot === 8) {
            part = this.body[0];
        } else if (slot === 11) {
            part = this.body[1];
        } else if (slot === 4) {
            part = this.body[2];
        } else if (slot === 6) {
            part = this.body[3];
        } else if (slot === 9) {
            part = this.body[4];
        } else if (slot === 7) {
            part = this.body[5];
        } else if (slot === 10) {
            part = this.body[6];
        }

        if (part === -1) {
            return 0;
        } else {
            return 0x100 + part;
        }
    }

    generateAppearance() {
        let stream = new Packet();

        stream.p1(this.gender);
        stream.p1(this.headicons);

        for (let slot = 0; slot < 12; slot++) {
            let appearanceValue = this.getAppearanceInSlot(slot);
            if (appearanceValue === 0) {
                stream.p1(0);
            } else {
                stream.p2(appearanceValue);
            }
        }

        for (let i = 0; i < this.colors.length; i++) {
            stream.p1(this.colors[i]);
        }

        stream.p2(808);
        stream.p2(823);
        stream.p2(819);
        stream.p2(820);
        stream.p2(821);
        stream.p2(822);
        stream.p2(824);

        stream.p8(this.username37);
        stream.p1(this.combatLevel);

        this.appearance = stream;
    }

    writeUpdate(out, self = false, firstSeen = false) {
        let mask = this.mask;
        if (firstSeen) {
            mask |= Player.APPEARANCE;
        }
        if (firstSeen && (this.faceCoordX != -1 || this.faceCoordY != -1)) {
            mask |= Player.FACE_COORD;
        }
        if (firstSeen && (this.faceEntity != -1)) {
            mask |= Player.FACE_ENTITY;
        }

        if (mask > 0xFF) {
            mask |= 0x80;
        }

        if (self && (mask & Player.CHAT)) {
            mask &= ~Player.CHAT;
        }

        out.p1(mask & 0xFF);
        if (mask & 0x80) {
            out.p1(mask >> 8);
        }

        if (mask & Player.APPEARANCE) {
            if (!this.appearance) {
                this.generateAppearance();
            }

            out.p1(this.appearance.length);
            out.pdata(this.appearance);
        }

        if (mask & Player.ANIM) {
            out.p2(this.animId);
            out.p2(this.animDelay);
        }

        if (mask & Player.FACE_ENTITY) {
            out.p2(this.faceEntity);
        }

        if (mask & Player.FORCED_CHAT) {
        }

        if (mask & Player.DAMAGE) {
        }

        if (mask & Player.FACE_COORD) {
        }

        if (mask & Player.CHAT) {
        }

        if (mask & Player.SPOTANIM) {
        }

        if (mask & Player.FORCED_MOVEMENT) {
        }
    }

    updateNpcs() {
    }

    updateInvs() {
        for (let i = 0; i < this.invs.length; i++) {
            let inv = this.invs[i];
            if (!inv || inv.com == -1 || !inv.update) {
                continue;
            }

            // TODO: implement partial updates
            this.updateInvFull(inv.com, inv);
            inv.update = false;
        }
    }

    invListenOnCom(inv, com) {
        if (typeof inv === 'string') {
            inv = InvType.getId(inv);
        }

        if (typeof com === 'string') {
            com = IfType.getId(com);
        }

        if (inv === -1 || com === -1) {
            console.error(`Invalid invListenOnCom call: ${inv}, ${com}`);
            return;
        }

        let container = this.invs.find(x => x.type === inv);
        if (!container) {
            console.error(`Invalid invListenOnCom call: ${inv}, ${com}`);
            return;
        }

        container.com = com;
        container.update = true;
    }

    invGetSlot(inv, slot) {
        if (typeof inv === 'string') {
            inv = InvType.getId(inv);
        }

        if (inv === -1) {
            console.error(`Invalid invGetSlot call: ${inv} ${slot}`);
            return;
        }

        let container = this.invs.find(x => x.type === inv);
        if (!container) {
            console.error(`Invalid invGetSlot call: ${inv} ${slot}`);
            return;
        }

        return container.get(slot);
    }

    invClear(inv) {
        if (typeof inv === 'string') {
            inv = InvType.getId(inv);
        }

        if (inv === -1) {
            console.error(`Invalid invClear call: ${inv}`);
            return;
        }

        let container = this.invs.find(x => x.type === inv);
        if (!container) {
            console.error(`Invalid invClear call: ${inv}`);
            return;
        }

        container.removeAll();
    }

    invAdd(inv, obj, count) {
        if (typeof inv === 'string') {
            inv = InvType.getId(inv);
        }

        if (typeof obj === 'string') {
            obj = ObjType.getId(obj);
        }

        if (inv === -1 || obj === -1) {
            console.error(`Invalid invAdd call: ${inv}, ${obj}, ${count}`);
            return;
        }

        let container = this.invs.find(x => x.type === inv);
        if (!container) {
            console.error(`Invalid invAdd call: ${inv}, ${obj}, ${count}`);
            return;
        }

        // probably should error if transaction != count
        container.add(obj, count);
    }

    invDel(inv, obj, count) {
        if (typeof inv === 'string') {
            inv = InvType.getId(inv);
        }

        if (typeof obj === 'string') {
            obj = ObjType.getId(obj);
        }

        if (inv === -1 || obj === -1) {
            console.error(`Invalid invDel call: ${inv}, ${obj}, ${count}`);
            return;
        }

        let container = this.invs.find(x => x.type === inv);
        if (!container) {
            console.error(`Invalid invDel call: ${inv}, ${obj}, ${count}`);
            return;
        }

        // probably should error if transaction != count
        container.remove(obj, count);
    }

    invDelSlot(inv, slot) {
        if (typeof inv === 'string') {
            inv = InvType.getId(inv);
        }

        if (inv === -1) {
            console.error(`Invalid invDel call: ${inv}, ${slot}`);
            return;
        }

        let container = this.invs.find(x => x.type === inv);
        if (!container) {
            console.error(`Invalid invDel call: ${inv}, ${slot}`);
            return;
        }

        container.delete(slot);
    }

    setVarp(varp, value) {
        if (typeof varp === 'string') {
            varp = VarpType.getId(varp);
        }

        if (varp === -1) {
            console.error(`Invalid setVarp call: ${varp}, ${value}`);
            return;
        }

        let varpType = VarpType.get(varp);
        if (varpType.transmit !== 'always') {
            return;
        }

        this.varps[varp] = value;

        if (value < 256) {
            this.varpSmall(varp, value);
        } else {
            this.varpLarge(varp, value);
        }
    }

    giveXp(stat, xp) {
        this.stats[stat] += xp;

        // capped to 200m per stat because we store in int32, then divide xp by 10, and round down to 200m (2.147b -> 214.7m -> 200m)
        if (this.stats[stat] > 200_000_000) {
            this.stats[stat] = 200_000_000;
        }

        // TODO: levelup trigger
        this.baseLevel[stat] = getLevelByExp(this.stats[stat]);
        this.updateStat(stat, this.stats[stat], this.level[stat]);
    }

    // ----

    executeInterface(script) {
        if (!script) {
            this.messageGame('Nothing interesting happens.');
            return;
        }

        let state = ScriptRunner.execute(script);
        if (state.execution === ScriptState.SUSPENDED) {
            this.interfaceScript = script;
        }
    }

    // ---- raw server protocol ----

    ifSetColour(int1, int2) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETCOLOUR);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    ifOpenBottom(int1) {
        let out = new Packet();
        out.p1(ServerProt.IF_OPENBOTTOM);

        out.p2(int1);

        this.netOut.push(out);
    }

    ifOpenSub(int1, int2) {
        let out = new Packet();
        out.p1(ServerProt.IF_OPENSUB);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    ifSetHide(int1, bool1) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETHIDE);

        out.p1(int1);
        out.pbool(bool1);

        this.netOut.push(out);
    }

    ifSetObject(int1, int2, int3) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETOBJECT);

        out.p2(int1);
        out.p2(int2);
        out.p2(int3);

        this.netOut.push(out);
    }

    ifSetTabActive(tab) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETTAB_ACTIVE);

        out.p1(tab);

        this.netOut.push(out);
    }

    ifSetModel(int1, int2) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETMODEL);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    ifSetModelColour(int1, int2, int3) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETMODEL_COLOUR);

        out.p2(int1);
        out.p2(int2);
        out.p2(int3);

        this.netOut.push(out);
    }

    ifSetTabFlash(tab) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETTAB_FLASH);

        out.p1(tab);

        this.netOut.push(out);
    }

    ifCloseSub() {
        let out = new Packet();
        out.p1(ServerProt.IF_CLOSESUB);

        this.netOut.push(out);
    }

    ifSetAnim(int1, int2) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETANIM);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    ifSetTab(com, tab) {
        if (typeof com === 'string') {
            com = IfType.getId(com);
        }

        let out = new Packet();
        out.p1(ServerProt.IF_SETTAB);

        out.p2(com);
        out.p1(tab);

        this.netOut.push(out);
    }

    ifOpenTop(int1) {
        let out = new Packet();
        out.p1(ServerProt.IF_OPENTOP);

        out.p2(int1);

        this.netOut.push(out);
    }

    ifOpenSticky(int1) {
        let out = new Packet();
        out.p1(ServerProt.IF_OPENSTICKY);

        out.p2(int1);

        this.netOut.push(out);
    }

    ifOpenSidebar(int1) {
        let out = new Packet();
        out.p1(ServerProt.IF_OPENSIDEBAR);

        out.p2(int1);

        this.netOut.push(out);
    }

    ifSetPlayerHead(int1) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETPLAYERHEAD);

        out.p2(int1);

        this.netOut.push(out);
    }

    ifSetText(int1, string1) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETTEXT);

        out.p2(int1);
        out.pjstr(string1);

        this.netOut.push(out);
    }

    ifSetNpcHead(int1, int2) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETNPCHEAD);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    ifSetPosition(int1, int2, int3) {
        let out = new Packet();
        out.p1(ServerProt.IF_SETPOSITION);

        out.p2(int1);
        out.p2(int2);
        out.p2(int3);

        this.netOut.push(out);
    }

    ifIAmount() {
        let out = new Packet();
        out.p1(ServerProt.IF_IAMOUNT);

        this.netOut.push(out);
    }

    ifMultiZone(bool1) {
        let out = new Packet();
        out.p1(ServerProt.IF_MULTIZONE);

        out.pbool(bool1);

        this.netOut.push(out);
    }

    updateInvClear(com) {
        if (typeof com === 'string') {
            com = IfType.getId(com);
        }

        let out = new Packet();
        out.p1(ServerProt.UPDATE_INV_CLEAR);

        out.p2(com);

        this.netOut.push(out);
    }

    updateInvFull(com, inv) {
        if (typeof com === 'string') {
            com = IfType.getId(com);
        }

        let out = new Packet();
        out.p1(ServerProt.UPDATE_INV_FULL);
        out.p2(0);
        let start = out.pos;

        out.p2(com);
        out.p1(inv.capacity);
        for (let slot = 0; slot < inv.capacity; slot++) {
            let obj = inv.get(slot);

            if (obj) {
                out.p2(obj.id + 1);

                if (obj.count >= 255) {
                    out.p1(255);
                    out.p4(obj.count);
                } else {
                    out.p1(obj.count);
                }
            } else {
                out.p2(0);
                out.p1(0);
            }
        }

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    updateInvPartial(com, inv, slots = []) {
        if (typeof com === 'string') {
            com = IfType.getId(com);
        }

        let out = new Packet();
        out.p1(ServerProt.UPDATE_INV_PARTIAL);
        out.p2(0);
        let start = out.pos;

        out.p2(com);
        for (let i = 0; i < slots.length; i++) {
            let slot = slots[i];
            let obj = inv.get(slot);
            if (!obj) {
                continue;
            }

            out.p1(slot);
            out.p2(obj.id);
            if (obj.count >= 255) {
                out.p1(255);
                out.p4(obj.count);
            } else {
                out.p1(obj.count);
            }
        }

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    camForceAngle(int1, int2, int3, int4, int5) {
        let out = new Packet();
        out.p1(ServerProt.CAM_FORCEANGLE);

        out.p1(int1);
        out.p1(int2);
        out.p2(int3);
        out.p1(int4);
        out.p1(int5);

        this.netOut.push(out);
    }

    camShake(int1, int2, int3, int4) {
        let out = new Packet();
        out.p1(ServerProt.CAM_SHAKE);

        out.p1(int1);
        out.p1(int2);
        out.p1(int3);
        out.p1(int4);

        this.netOut.push(out);
    }

    camMoveTo(int1, int2, int3, int4, int5) {
        let out = new Packet();
        out.p1(ServerProt.CAM_MOVETO);

        out.p1(int1);
        out.p1(int2);
        out.p2(int3);
        out.p1(int4);
        out.p1(int5);

        this.netOut.push(out);
    }

    camReset() {
        let out = new Packet();
        out.p1(ServerProt.CAM_RESET);

        this.netOut.push(out);
    }

    npcInfo(data) {
        let out = new Packet();
        out.p1(ServerProt.NPC_INFO);
        out.p2(0);
        let start = out.pos;

        out.pdata(data);

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    playerInfo(data) {
        let out = new Packet();
        out.p1(ServerProt.PLAYER_INFO);
        out.p2(0);
        let start = out.pos;

        out.pdata(data);

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    clearWalkingQueue() {
        let out = new Packet();
        out.p1(ServerProt.CLEAR_WALKING_QUEUE);

        this.netOut.push(out);
    }

    updateRunWeight(kg) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_RUNWEIGHT);

        out.p2(kg);

        this.netOut.push(out);
    }

    // pseudo-packet
    hintNpc(nid) {
        let out = new Packet();
        out.p1(ServerProt.HINT_ARROW);
        out.p1(0);
        let start = out.pos;

        out.p1(1);
        out.p2(nid);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    // pseudo-packet
    hintTile(x, z, height) {
        let out = new Packet();
        out.p1(ServerProt.HINT_ARROW);
        out.p1(0);
        let start = out.pos;

        // TODO: how to best represent which type to pick
        // 2 - 64, 64 offset
        // 3 - 0, 64 offset
        // 4 - 128, 64 offset
        // 5 - 64, 0 offset
        // 6 - 64, 128 offset

        out.p1(2);
        out.p2(x);
        out.p2(z);
        out.p1(height);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    // pseudo-packet
    hintPlayer(pid) {
        let out = new Packet();
        out.p1(ServerProt.HINT_ARROW);
        out.p1(0);
        let start = out.pos;

        out.p1(pid);
        out.p2(pid);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    updateRebootTimer(ticks) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_REBOOT_TIMER);

        out.p2(ticks);

        this.netOut.push(out);
    }

    updateStat(stat, xp, tempLevel) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_STAT);

        out.p1(stat);
        out.p4(xp / 10);
        out.p1(tempLevel);

        this.netOut.push(out);
    }

    updateRunEnergy(energy) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_RUNENERGY);

        out.p1(Math.floor(energy / 100));

        this.netOut.push(out);
    }

    finishTracking() {
        let out = new Packet();
        out.p1(ServerProt.FINISH_TRACKING);

        this.netOut.push(out);
    }

    resetAnims() {
        let out = new Packet();
        out.p1(ServerProt.RESET_ANIMS);

        this.netOut.push(out);
    }

    updateUid192(pid) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_UID192);

        out.p2(pid);

        this.netOut.push(out);
    }

    lastLoginInfo(pid) {
        let out = new Packet();
        out.p1(ServerProt.LAST_LOGIN_INFO);

        out.p2(pid);

        this.netOut.push(out);
    }

    logout() {
        let out = new Packet();
        out.p1(ServerProt.LOGOUT);

        this.netOut.push(out);
    }

    enableTracking() {
        let out = new Packet();
        out.p1(ServerProt.ENABLE_TRACKING);

        this.netOut.push(out);
    }

    messageGame(str1) {
        let out = new Packet();
        out.p1(ServerProt.MESSAGE_GAME);
        out.p1(0);
        let start = out.pos;

        out.pjstr(str1);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    updateIgnoreList(name37s) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_IGNORELIST);

        for (let i = 0; i < name37s.length; i++) {
            out.p8(name37s[i]);
        }

        this.netOut.push(out);
    }

    chatFilterSettings(int1, int2, int3) {
        let out = new Packet();
        out.p1(ServerProt.CHAT_FILTER_SETTINGS);

        out.p1(int1);
        out.p1(int2);
        out.p1(int3);

        this.netOut.push(out);
    }

    messagePrivate(from37, messageId, fromRights, message) {
        let out = new Packet();
        out.p1(ServerProt.MESSAGE_PRIVATE);
        out.p1(0);
        let start = out.pos;

        out.p8(from37);
        out.p4(messageId);
        out.p1(fromRights);
        out.pdata(message);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    updateFriendList(username37, world) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_FRIENDLIST);

        out.p8(username37);
        out.p1(world);

        this.netOut.push(out);
    }

    dataLocDone(x, z) {
        let out = new Packet();
        out.p1(ServerProt.DATA_LOC_DONE);

        out.p1(x);
        out.p1(z);

        this.netOut.push(out);
    }

    dataLandDone(x, z) {
        let out = new Packet();
        out.p1(ServerProt.DATA_LAND_DONE);

        out.p1(x);
        out.p1(z);

        this.netOut.push(out);
    }

    dataLand(x, z, data, off, length) {
        let out = new Packet();
        out.p1(ServerProt.DATA_LAND);
        out.p2(0);
        let start = out.pos;

        out.p1(x);
        out.p1(z);
        out.p2(off);
        out.p2(length);
        out.pdata(data);

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    dataLoc(x, z, data, off, length) {
        let out = new Packet();
        out.p1(ServerProt.DATA_LOC);
        out.p2(0);
        let start = out.pos;

        out.p1(x);
        out.p1(z);
        out.p2(off);
        out.p2(length);
        out.pdata(data);

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    loadArea(zoneX, zoneZ) {
        let dx = Math.abs(this.x - this.loadedX);
        let dz = Math.abs(this.z - this.loadedZ);
        if (dx < 36 && dz < 36) {
            return;
        }

        let out = new Packet();
        out.p1(ServerProt.LOAD_AREA);
        out.p2(0);
        let start = out.pos;

        out.p2(zoneX);
        out.p2(zoneZ);

        // build area is 13x13 zones (8*13 = 104 tiles), so we need to load 6 zones in each direction
        let areas = [];
        for (let x = zoneX - 6; x <= zoneX + 6; x++) {
            for (let z = zoneZ - 6; z <= zoneZ + 6; z++) {
                let mapsquareX = Position.mapsquare(x << 3);
                let mapsquareZ = Position.mapsquare(z << 3);

                let landExists = fs.existsSync(`data/pack/server/maps/m${mapsquareX}_${mapsquareZ}`);
                let locExists = fs.existsSync(`data/pack/server/maps/l${mapsquareX}_${mapsquareZ}`);

                if ((landExists || locExists) && areas.findIndex(a => a.mapsquareX === mapsquareX && a.mapsquareZ === mapsquareZ) === -1) {
                    areas.push({ mapsquareX, mapsquareZ, landExists, locExists });
                }
            }
        }

        for (let i = 0; i < areas.length; i++) {
            const { mapsquareX, mapsquareZ, landExists, locExists } = areas[i];

            out.p1(mapsquareX);
            out.p1(mapsquareZ);
            out.p4(landExists ? Packet.crc32(Packet.load(`data/pack/server/maps/m${mapsquareX}_${mapsquareZ}`)) : 0);
            out.p4(locExists ? Packet.crc32(Packet.load(`data/pack/server/maps/l${mapsquareX}_${mapsquareZ}`)) : 0);
        }

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    varpSmall(varp, value) {
        let out = new Packet();
        out.p1(ServerProt.VARP_SMALL);

        out.p2(varp);
        out.p1(value);

        this.netOut.push(out);
    }

    varpLarge(varp, value) {
        let out = new Packet();
        out.p1(ServerProt.VARP_LARGE);

        out.p2(varp);
        out.p4(value);

        this.netOut.push(out);
    }

    resetClientVarCache() {
        let out = new Packet();
        out.p1(ServerProt.RESET_CLIENT_VARCACHE);

        this.netOut.push(out);
    }

    synthSound(id, loops, delay) {
        let out = new Packet();
        out.p1(ServerProt.SYNTH_SOUND);

        out.p2(id);
        out.p1(loops);
        out.p2(delay);

        this.netOut.push(out);
    }

    midiSong(name, crc, length) {
        let out = new Packet();
        out.p1(ServerProt.MIDI_SONG);
        out.p1(0);
        let start = out.pos;

        out.pjstr(name);
        out.p4(crc);
        out.p4(length);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    midiJingle() {
        let out = new Packet();
        out.p1(ServerProt.MIDI_JINGLE);
        out.p2(0);
        let start = out.pos;

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    updateZonePartialFollows(baseX, baseZ) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_ZONE_PARTIAL_FOLLOWS);

        out.p1(baseX);
        out.p1(baseZ);

        this.netOut.push(out);
    }

    updateZoneFullFollows(baseX, baseZ) {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_ZONE_FULL_FOLLOWS);

        out.p1(baseX);
        out.p1(baseZ);

        this.netOut.push(out);
    }

    updateZonePartialEnclosed() {
        let out = new Packet();
        out.p1(ServerProt.UPDATE_ZONE_PARTIAL_ENCLOSED);
        out.p2(0);
        let start = out.pos;

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    locAddChange() {
        let out = new Packet();
        out.p1(ServerProt.LOC_ADD_CHANGE);

        this.netOut.push(out);
    }

    locAnim() {
        let out = new Packet();
        out.p1(ServerProt.LOC_ANIM);

        this.netOut.push(out);
    }

    objDel() {
        let out = new Packet();
        out.p1(ServerProt.OBJ_DEL);

        this.netOut.push(out);
    }

    objReveal() {
        let out = new Packet();
        out.p1(ServerProt.OBJ_REVEAL);

        this.netOut.push(out);
    }

    locAdd() {
        let out = new Packet();
        out.p1(ServerProt.LOC_ADD);

        this.netOut.push(out);
    }

    mapProjAnim() {
        let out = new Packet();
        out.p1(ServerProt.MAP_PROJANIM);

        this.netOut.push(out);
    }

    locDel() {
        let out = new Packet();
        out.p1(ServerProt.LOC_DEL);

        this.netOut.push(out);
    }

    objCount() {
        let out = new Packet();
        out.p1(ServerProt.OBJ_COUNT);

        this.netOut.push(out);
    }

    mapAnim() {
        let out = new Packet();
        out.p1(ServerProt.MAP_ANIM);

        this.netOut.push(out);
    }

    objAdd() {
        let out = new Packet();
        out.p1(ServerProt.OBJ_ADD);

        this.netOut.push(out);
    }
}
