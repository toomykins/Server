import Packet from '#jagex2/io/Packet.js';
import { fromBase37, toBase37 } from '#jagex2/jstring/JString.js';
import VarpType from '#lostcity/cache/VarpType.js';

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
    username = 'invalid_name';
    x = 0;
    z = 0;
    level = 0;
    body = [];
    colors = [];
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
        let sav = Packet.load(`data/players/${safeName}.sav`);
        if (!sav) {
            throw new Error('Player save not found');
        }

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

        let player = new Player();
        player.username = safeName;
        player.username37 = name37;

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
        player.gender = sav.gbool();
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
        sav.pbool(this.gender);
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
    combat = 0;
    headicons = 0;
    appearance = null; // cached appearance
    levels = new Uint8Array(21);
    loadedX = -1;
    loadedZ = -1;
    walkQueue = [];

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

    // ---- server protocol ----
    // sorry for the snake_case, but it's the convention for the server protocol

    if_setcolour() {
        let out = new Packet();
        out.p1(2);
    }

    if_openbottom() {
        let out = new Packet();
        out.p1(14);
    }

    if_opensub() {
        let out = new Packet();
        out.p1(28);
    }

    if_sethide() {
        let out = new Packet();
        out.p1(26);
    }

    if_setobject() {
        let out = new Packet();
        out.p1(46);
    }

    if_settab_active() {
        let out = new Packet();
        out.p1(84);
    }

    if_setmodel() {
        let out = new Packet();
        out.p1(87);
    }

    if_setmodel_colour() {
        let out = new Packet();
        out.p1(103);
    }

    if_settab_flash() {
        let out = new Packet();
        out.p1(126);
    }

    if_closesub() {
        let out = new Packet();
        out.p1(129);
    }

    if_setanim() {
        let out = new Packet();
        out.p1(146);
    }

    if_settab() {
        let out = new Packet();
        out.p1(167);
    }

    if_opentop() {
        let out = new Packet();
        out.p1(168);
    }

    if_opensticky() {
        let out = new Packet();
        out.p1(185);
    }

    if_opensidebar() {
        let out = new Packet();
        out.p1(195);
    }

    if_setplayerhead() {
        let out = new Packet();
        out.p1(197);
    }

    if_settext() {
        let out = new Packet();
        out.p1(201);
    }

    if_setnpchead() {
        let out = new Packet();
        out.p1(204);
    }

    if_setposition() {
        let out = new Packet();
        out.p1(209);
    }

    if_iamount() {
        let out = new Packet();
        out.p1(243);
    }

    if_multizone() {
        let out = new Packet();
        out.p1(254);
    }

    update_inv_clear() {
        let out = new Packet();
        out.p1(15);
    }

    update_inv_full() {
        let out = new Packet();
        out.p1(98);
    }

    update_inv_partial() {
        let out = new Packet();
        out.p1(213);
    }

    cam_forceangle() {
        let out = new Packet();
        out.p1(3);
    }

    cam_shake() {
        let out = new Packet();
        out.p1(13);
    }

    cam_moveto() {
        let out = new Packet();
        out.p1(74);
    }

    cam_reset() {
        let out = new Packet();
        out.p1(239);
    }

    npc_info() {
        let out = new Packet();
        out.p1(1);
    }

    player_info() {
        let out = new Packet();
        out.p1(184);
    }

    clear_walking_queue() {
        let out = new Packet();
        out.p1(19);
    }

    update_runweight() {
        let out = new Packet();
        out.p1(22);
    }

    hint_arrow() {
        let out = new Packet();
        out.p1(25);
    }

    update_reboot_timer() {
        let out = new Packet();
        out.p1(43);
    }

    update_stat() {
        let out = new Packet();
        out.p1(44);
    }

    update_runenergy() {
        let out = new Packet();
        out.p1(68);
    }

    finish_tracking() {
        let out = new Packet();
        out.p1(133);
    }

    reset_anims() {
        let out = new Packet();
        out.p1(136);
    }

    update_uid192() {
        let out = new Packet();
        out.p1(139);
    }

    last_login_info() {
        let out = new Packet();
        out.p1(140);
    }

    logout() {
        let out = new Packet();
        out.p1(142);
    }

    enable_tracking() {
        let out = new Packet();
        out.p1(226);
    }

    message_game() {
        let out = new Packet();
        out.p1(4);
    }

    update_ignorelist() {
        let out = new Packet();
        out.p1(21);
    }

    chat_filter_settings() {
        let out = new Packet();
        out.p1(32);
    }

    message_private() {
        let out = new Packet();
        out.p1(41);
    }

    update_friendlist() {
        let out = new Packet();
        out.p1(152);
    }

    data_loc_done() {
        let out = new Packet();
        out.p1(20);
    }

    data_land_done() {
        let out = new Packet();
        out.p1(80);
    }

    data_land() {
        let out = new Packet();
        out.p1(132);
    }

    data_loc() {
        let out = new Packet();
        out.p1(220);
    }

    load_area() {
        let out = new Packet();
        out.p1(237);
    }

    varp_small() {
        let out = new Packet();
        out.p1(150);
    }

    varp_large() {
        let out = new Packet();
        out.p1(175);
    }

    reset_client_varcache() {
        let out = new Packet();
        out.p1(193);
    }

    synth_sound() {
        let out = new Packet();
        out.p1(12);
    }

    midi_song() {
        let out = new Packet();
        out.p1(54);
    }

    midi_jingle() {
        let out = new Packet();
        out.p1(212);
    }

    update_zone_partial_follows() {
        let out = new Packet();
        out.p1(7);
    }

    update_zone_full_follows() {
        let out = new Packet();
        out.p1(135);
    }

    update_zone_partial_enclosed() {
        let out = new Packet();
        out.p1(162);
    }

    loc_add_change() {
        let out = new Packet();
        out.p1(23);
    }

    loc_anim() {
        let out = new Packet();
        out.p1(42);
    }

    obj_del() {
        let out = new Packet();
        out.p1(49);
    }

    obj_reveal() {
        let out = new Packet();
        out.p1(50);
    }

    loc_add() {
        let out = new Packet();
        out.p1(59);
    }

    map_projanim() {
        let out = new Packet();
        out.p1(69);
    }

    loc_del() {
        let out = new Packet();
        out.p1(76);
    }

    obj_count() {
        let out = new Packet();
        out.p1(151);
    }

    map_anim() {
        let out = new Packet();
        out.p1(191);
    }

    obj_add() {
        let out = new Packet();
        out.p1(223);
    }
}
