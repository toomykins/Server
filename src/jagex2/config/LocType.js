import Packet from '#jagex2/io/Packet.js';

export default class LocType {
    static count = 0;
    static instances = [];

    static unpack(config) {
        let dat = new Packet(config.read('loc.dat'));
        LocType.count = dat.g2();

        for (let i = 0; i < LocType.count; i++) {
            LocType.instances[i] = new LocType();
            LocType.instances[i].decode(dat);
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
                console.log(`Error unrecognized loc config code ${code}`);
            }
        }
    }
}
