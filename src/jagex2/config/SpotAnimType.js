import Packet from '#jagex2/io/Packet.js';

export default class SpotAnimType {
    static count = 0;
    static instances = [];

    static unpack(config) {
        let dat = new Packet(config.read('spotanim.dat'));
        SpotAnimType.count = dat.g2();

        for (let i = 0; i < SpotAnimType.count; i++) {
            SpotAnimType.instances[i] = new SpotAnimType();
            SpotAnimType.instances[i].decode(dat);
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
                console.log(`Error unrecognized spotanim config code ${code}`);
            }
        }
    }
}
