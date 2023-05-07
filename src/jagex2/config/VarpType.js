import Packet from '#jagex2/io/Packet.js';

// Variable (player) definitions
export default class VarpType {
    static count = 0;
    static instances = [];

    config3Count = 0;
    config3 = [];
    config10 = '';
    config1 = 0;
    config2 = 0;
    hasConfig3 = false;
    config4 = true;
    clientCode = 0;
    config7 = 0;
    config6 = false;
    config8 = false;

    static unpack(config) {
        let dat = new Packet(config.read('varp.dat'));
        VarpType.config3Count = 0;
        VarpType.count = dat.g2();

        for (let i = 0; i < VarpType.count; i++) {
            VarpType.instances[i] = new VarpType();
            VarpType.instances[i].decode(dat, i);
        }
    }

    decode(dat, id) {
        while (true) {
            let code = dat.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
                this.config1 = dat.g1();
            } else if (code === 2) {
                this.config2 = dat.g1();
            } else if (code === 3) {
                this.hasConfig3 = true;
                this.config3[this.config3Count++] = id;
            } else if (code === 4) {
                this.config4 = false;
            } else if (code === 5) {
                this.clientCode = dat.g2();
            } else if (code === 6) {
                this.config6 = true;
            } else if (code === 7) {
                this.config7 = dat.g4();
            } else if (code === 8) {
                this.config8 = true;
            } else if (code === 10) {
                this.config10 = dat.gstr();
            } else {
                console.log(`Error unrecognized varp config code ${code}`);
            }
        }
    }
}
