import fs from 'fs';

import Packet from '#jagex2/io/Packet.js';
import { fromBase37, toBase37 } from '#jagex2/jstring/JString.js';
import VarpType from '#lostcity/cache/VarpType.js';
import { Position } from '#lostcity/entity/Position.js';
import { ClientProt, ClientProtLengths } from '#lostcity/server/ClientProt.js';
import { ServerProt } from '#lostcity/server/ServerProt.js';

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
    tempLevels = new Uint8Array(21);
    varps = new Int32Array(VarpType.count);
    invs = [];

    constructor() {
        for (let i = 0; i < 21; i++) {
            this.stats[i] = 0;
            this.levels[i] = 1;
            this.tempLevels[i] = 1;
        }

        // hitpoints starts at level 10
        this.stats[4] = 1154;
        this.levels[4] = 10;
        this.tempLevels[4] = 10;
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
            player.levels[i] = getLevelByExp(player.stats[i]);
            player.tempLevels[i] = sav.g1();
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

            if (this.tempLevels[i] === 0) {
                sav.p1(this.tempLevels[i]);
            } else {
                sav.p1(getLevelByExp(this.stats[i]));
            }
        }

        sav.p2(this.varps.length);
        for (let i = 0; i < this.varps.length; i++) {
            sav.p4(this.varps[i]);
        }

        sav.p1(this.invs.length);
        for (let i = 0; i < this.invs.length; i++) {
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
    uid = -1;
    username37 = -1;
    lowMemory = false;
    webClient = false;
    combatLevel = 0;
    headicons = 0;
    appearance = null; // cached appearance
    levels = new Uint8Array(21);
    loadedX = -1;
    loadedZ = -1;
    walkQueue = [];

    client = null;
    netOut = [];
    mask = 0;
    faceEntity = -1;
    faceCoordX = -1;
    faceCoordZ = -1;
    animId = -1;
    animDelay = -1;
    message = null;
    messageColor = 0;
    messageEffect = 0;
    messageType = 0;

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

    // ---- client protocol ----
    decodeIn(data) {
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
                            this.data_land(x, z, land.gdata(CHUNK_SIZE), off, land.length);
                        }

                        this.data_land_done(x, z);
                    } else if (type == 1) {
                        let loc = Packet.load(`data/pack/server/maps/l${x}_${z}`);

                        for (let off = 0; off < loc.length; off += CHUNK_SIZE) {
                            this.data_loc(x, z, loc.gdata(CHUNK_SIZE), off, loc.length);
                        }

                        this.data_loc_done(x, z);
                    }
                }
            }
        }

        this.client.reset();
    }

    // ---- server protocol ----

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

    // sorry for the snake_case below, but it's the convention for the server protocol

    if_setcolour(int1, int2) {
        let out = new Packet();
        out.p1(2);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    if_openbottom(int1) {
        let out = new Packet();
        out.p1(14);

        out.p2(int1);

        this.netOut.push(out);
    }

    if_opensub(int1, int2) {
        let out = new Packet();
        out.p1(28);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    if_sethide(int1, bool1) {
        let out = new Packet();
        out.p1(26);

        out.p1(int1);
        out.pbool(bool1);

        this.netOut.push(out);
    }

    if_setobject(int1, int2, int3) {
        let out = new Packet();
        out.p1(46);

        out.p2(int1);
        out.p2(int2);
        out.p2(int3);

        this.netOut.push(out);
    }

    if_settab_active(tab) {
        let out = new Packet();
        out.p1(84);

        out.p1(tab);

        this.netOut.push(out);
    }

    if_setmodel(int1, int2) {
        let out = new Packet();
        out.p1(87);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    if_setmodel_colour(int1, int2, int3) {
        let out = new Packet();
        out.p1(103);

        out.p2(int1);
        out.p2(int2);
        out.p2(int3);

        this.netOut.push(out);
    }

    if_settab_flash(tab) {
        let out = new Packet();
        out.p1(126);

        out.p1(tab);

        this.netOut.push(out);
    }

    if_closesub() {
        let out = new Packet();
        out.p1(129);

        this.netOut.push(out);
    }

    if_setanim(int1, int2) {
        let out = new Packet();
        out.p1(146);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    if_settab(int1, int2) {
        let out = new Packet();
        out.p1(167);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    if_opentop(int1) {
        let out = new Packet();
        out.p1(168);

        out.p2(int1);

        this.netOut.push(out);
    }

    if_opensticky(int1) {
        let out = new Packet();
        out.p1(185);

        out.p2(int1);

        this.netOut.push(out);
    }

    if_opensidebar(int1) {
        let out = new Packet();
        out.p1(195);

        out.p2(int1);

        this.netOut.push(out);
    }

    if_setplayerhead(int1) {
        let out = new Packet();
        out.p1(197);

        out.p2(int1);

        this.netOut.push(out);
    }

    if_settext(int1, string1) {
        let out = new Packet();
        out.p1(201);

        out.p2(int1);
        out.pjstr(string1);

        this.netOut.push(out);
    }

    if_setnpchead(int1, int2) {
        let out = new Packet();
        out.p1(204);

        out.p2(int1);
        out.p2(int2);

        this.netOut.push(out);
    }

    if_setposition(int1, int2, int3) {
        let out = new Packet();
        out.p1(209);

        out.p2(int1);
        out.p2(int2);
        out.p2(int3);

        this.netOut.push(out);
    }

    if_iamount() {
        let out = new Packet();
        out.p1(243);

        this.netOut.push(out);
    }

    if_multizone(bool1) {
        let out = new Packet();
        out.p1(254);

        out.pbool(bool1);

        this.netOut.push(out);
    }

    update_inv_clear(int1) {
        let out = new Packet();
        out.p1(15);

        out.p2(int1);

        this.netOut.push(out);
    }

    update_inv_full(com, inv) {
        let out = new Packet();
        out.p1(98);
        out.p2(0);
        let start = out.pos;

        out.p2(com);
        out.p1(inv.length);
        for (let i = 0; i < inv.length; i++) {
            let obj = inv[i];

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

    update_inv_partial(com, inv) {
        let out = new Packet();
        out.p1(213);
        out.p2(0);
        let start = out.pos;

        out.p2(com);
        for (let i = 0; i < inv.length; i++) {
            let obj = inv[i];

            out.p1(i);
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

    cam_forceangle(int1, int2, int3, int4, int5) {
        let out = new Packet();
        out.p1(3);

        out.p1(int1);
        out.p1(int2);
        out.p2(int3);
        out.p1(int4);
        out.p1(int5);

        this.netOut.push(out);
    }

    cam_shake(int1, int2, int3, int4) {
        let out = new Packet();
        out.p1(13);

        out.p1(int1);
        out.p1(int2);
        out.p1(int3);
        out.p1(int4);

        this.netOut.push(out);
    }

    cam_moveto(int1, int2, int3, int4, int5) {
        let out = new Packet();
        out.p1(74);

        out.p1(int1);
        out.p1(int2);
        out.p2(int3);
        out.p1(int4);
        out.p1(int5);

        this.netOut.push(out);
    }

    cam_reset() {
        let out = new Packet();
        out.p1(239);

        this.netOut.push(out);
    }

    npc_info() {
        let out = new Packet();
        out.p1(1);
        out.p2(0);
        let start = out.pos;

        out.psize2(out.pos - start);
        this.netOut.push(out);
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

    player_info() {
        let out = new Packet();
        out.p1(184);
        out.p2(0);
        let start = out.pos;

        out.bits();

        out.pBit(1, 1);
        // --
        out.pBit(2, 3);
        out.pBit(2, this.level);
        out.pBit(7, Position.local(this.x));
        out.pBit(7, Position.local(this.z));
        out.pBit(1, 1);
        out.pBit(1, 1);
        // --
        out.pBit(8, 0);
        // --
        out.pBit(11, 2047);
        out.bytes();

        out.p1(Player.APPEARANCE);

        if (!this.appearance) {
            this.generateAppearance();
        }
        out.p1(this.appearance.length);
        out.pdata(this.appearance);

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    clear_walking_queue() {
        let out = new Packet();
        out.p1(19);

        this.netOut.push(out);
    }

    update_runweight(int1) {
        let out = new Packet();
        out.p1(22);

        out.p2(int1);

        this.netOut.push(out);
    }

    hint_npc(nid) {
        let out = new Packet();
        out.p1(25); // hint_arrow
        out.p1(0);
        let start = out.pos;

        out.p1(1);
        out.p2(nid);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    hint_tile(x, z, height) {
        let out = new Packet();
        out.p1(25); // hint_arrow
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

    hint_player(pid) {
        let out = new Packet();
        out.p1(25); // hint_arrow
        out.p1(0);
        let start = out.pos;

        out.p1(pid);
        out.p2(pid);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    update_reboot_timer(ticks) {
        let out = new Packet();
        out.p1(43);

        out.p2(ticks);

        this.netOut.push(out);
    }

    update_stat(stat, xp, tempLevel) {
        let out = new Packet();
        out.p1(44);

        out.p1(stat);
        out.p4(xp);
        out.p1(tempLevel);

        this.netOut.push(out);
    }

    update_runenergy(energy) {
        let out = new Packet();
        out.p1(68);

        out.p1(energy);

        this.netOut.push(out);
    }

    finish_tracking() {
        let out = new Packet();
        out.p1(133);

        this.netOut.push(out);
    }

    reset_anims() {
        let out = new Packet();
        out.p1(136);

        this.netOut.push(out);
    }

    update_uid192() {
        let out = new Packet();
        out.p1(139);

        this.netOut.push(out);
    }

    last_login_info(pid) {
        let out = new Packet();
        out.p1(140);

        out.p2(pid);

        this.netOut.push(out);
    }

    logout() {
        let out = new Packet();
        out.p1(142);

        this.netOut.push(out);
    }

    enable_tracking() {
        let out = new Packet();
        out.p1(226);

        this.netOut.push(out);
    }

    message_game(str1) {
        let out = new Packet();
        out.p1(4);
        out.p1(0);
        let start = out.pos;

        out.pjstr(str1);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    update_ignorelist(name37s) {
        let out = new Packet();
        out.p1(21);

        for (let i = 0; i < name37s.length; i++) {
            out.p8(name37s[i]);
        }

        this.netOut.push(out);
    }

    chat_filter_settings(int1, int2, int3) {
        let out = new Packet();
        out.p1(32);

        out.p1(int1);
        out.p1(int2);
        out.p1(int3);

        this.netOut.push(out);
    }

    message_private(from37, messageId, fromRights, message) {
        let out = new Packet();
        out.p1(41);
        out.p1(0);
        let start = out.pos;

        out.p8(from37);
        out.p4(messageId);
        out.p1(fromRights);
        out.pdata(message);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    update_friendlist(username37, world) {
        let out = new Packet();
        out.p1(152);

        out.p8(username37);
        out.p1(world);

        this.netOut.push(out);
    }

    data_loc_done(x, z) {
        let out = new Packet();
        out.p1(20);

        out.p1(x);
        out.p1(z);

        this.netOut.push(out);
    }

    data_land_done(x, z) {
        let out = new Packet();
        out.p1(80);

        out.p1(x);
        out.p1(z);

        this.netOut.push(out);
    }

    data_land(x, z, data, off, length) {
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

    data_loc(x, z, data, off, length) {
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

    load_area() {
        let dx = Math.abs(this.x - this.loadedX);
        let dz = Math.abs(this.z - this.loadedZ);
        if (dx < 36 && dz < 36) {
            return;
        }

        let out = new Packet();
        out.p1(237);
        out.p2(0);
        let start = out.pos;

        out.p2(Position.zone(this.x));
        out.p2(Position.zone(this.z));

        // build area is 13x13 zones (8*13 = 104 tiles), so we need to load 6 zones in each direction
        let areas = [];
        for (let x = Position.zone(this.x) - 6; x <= Position.zone(this.x) + 6; x++) {
            for (let z = Position.zone(this.z) - 6; z <= Position.zone(this.z) + 6; z++) {
                let fileX = Position.mapsquare(x << 3);
                let fileZ = Position.mapsquare(z << 3);

                let landExists = fs.existsSync(`data/pack/server/maps/m${fileX}_${fileZ}`);
                let locExists = fs.existsSync(`data/pack/server/maps/l${fileX}_${fileZ}`);
                if ((landExists || locExists) && areas.findIndex(a => a.x === fileX && a.z === fileZ) === -1) {
                    areas.push({ x: fileX, z: fileZ });
                }
            }
        }

        for (let i = 0; i < areas.length; i++) {
            const { x, z } = areas[i];
            out.p1(x);
            out.p1(z);

            let landExists = fs.existsSync(`data/pack/server/maps/m${x}_${z}`);
            let locExists = fs.existsSync(`data/pack/server/maps/l${x}_${z}`);
            out.p4(landExists ? Packet.crc32(Packet.load(`data/pack/server/maps/m${x}_${z}`)) : 0);
            out.p4(locExists ? Packet.crc32(Packet.load(`data/pack/server/maps/l${x}_${z}`)) : 0);
        }

        out.psize2(out.pos - start);
        this.netOut.push(out);

        this.loadedX = this.x;
        this.loadedZ = this.z;
    }

    varp_small(varp, value) {
        let out = new Packet();
        out.p1(150);

        out.p2(varp);
        out.p1(value);

        this.netOut.push(out);
    }

    varp_large(varp, value) {
        let out = new Packet();
        out.p1(175);

        out.p2(varp);
        out.p4(value);

        this.netOut.push(out);
    }

    reset_client_varcache() {
        let out = new Packet();
        out.p1(193);

        this.netOut.push(out);
    }

    synth_sound(id, loops, delay) {
        let out = new Packet();
        out.p1(12);

        out.p2(id);
        out.p1(loops);
        out.p2(delay);

        this.netOut.push(out);
    }

    midi_song(name, crc, length) {
        let out = new Packet();
        out.p1(54);
        out.p1(0);
        let start = out.pos;

        out.pjstr(name);
        out.p4(crc);
        out.p4(length);

        out.psize1(out.pos - start);
        this.netOut.push(out);
    }

    midi_jingle() {
        let out = new Packet();
        out.p1(212);
        out.p2(0);
        let start = out.pos;

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    update_zone_partial_follows(baseX, baseZ) {
        let out = new Packet();
        out.p1(7);

        out.p1(baseX);
        out.p1(baseZ);

        this.netOut.push(out);
    }

    update_zone_full_follows(baseX, baseZ) {
        let out = new Packet();
        out.p1(135);

        out.p1(baseX);
        out.p1(baseZ);

        this.netOut.push(out);
    }

    update_zone_partial_enclosed() {
        let out = new Packet();
        out.p1(162);
        out.p2(0);
        let start = out.pos;

        out.psize2(out.pos - start);
        this.netOut.push(out);
    }

    loc_add_change() {
        let out = new Packet();
        out.p1(23);

        this.netOut.push(out);
    }

    loc_anim() {
        let out = new Packet();
        out.p1(42);

        this.netOut.push(out);
    }

    obj_del() {
        let out = new Packet();
        out.p1(49);

        this.netOut.push(out);
    }

    obj_reveal() {
        let out = new Packet();
        out.p1(50);

        this.netOut.push(out);
    }

    loc_add() {
        let out = new Packet();
        out.p1(59);

        this.netOut.push(out);
    }

    map_projanim() {
        let out = new Packet();
        out.p1(69);

        this.netOut.push(out);
    }

    loc_del() {
        let out = new Packet();
        out.p1(76);

        this.netOut.push(out);
    }

    obj_count() {
        let out = new Packet();
        out.p1(151);

        this.netOut.push(out);
    }

    map_anim() {
        let out = new Packet();
        out.p1(191);

        this.netOut.push(out);
    }

    obj_add() {
        let out = new Packet();
        out.p1(223);

        this.netOut.push(out);
    }
}
