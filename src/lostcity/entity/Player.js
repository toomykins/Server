import Packet from '#jagex2/io/Packet.js';

export default class Player {
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
