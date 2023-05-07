import Packet from '#jagex2/io/Packet.js';

export default class NpcType {
    static count = 0;
    static instances = [];

    static unpack(config) {
        let dat = new Packet(config.read('npc.dat'));
        NpcType.count = dat.g2();

        for (let i = 0; i < NpcType.count; i++) {
            NpcType.instances[i] = new NpcType();
            NpcType.instances[i].decode(dat);
        }
    }

    decode(dat) {
        while (true) {
            let code = dat.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
            } else {
                console.log(`Error unrecognized npc config code ${code}`);
            }
        }
    }
}
