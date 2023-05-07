import Packet from '#jagex2/io/Packet.js';

export default class SeqType {
    static count = 0;
    static instances = [];

    static unpack(config) {
        let dat = new Packet(config.read('seq.dat'));
        SeqType.count = dat.g2();

        for (let i = 0; i < SeqType.count; i++) {
            SeqType.instances[i] = new SeqType();
            SeqType.instances[i].decode(dat);
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
                console.log(`Error unrecognized seq config code ${code}`);
            }
        }
    }
}
