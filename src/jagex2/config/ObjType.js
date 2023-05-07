import Packet from '#jagex2/io/Packet.js';

export default class ObjType {
    static count = 0;
    static instances = [];

    static unpack(config) {
        let dat = new Packet(config.read('obj.dat'));
        ObjType.count = dat.g2();

        for (let i = 0; i < ObjType.count; i++) {
            ObjType.instances[i] = new ObjType();
            ObjType.instances[i].decode(dat);
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
                console.log(`Error unrecognized obj config code ${code}`);
            }
        }
    }
}
