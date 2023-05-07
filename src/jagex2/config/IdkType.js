import Packet from '#jagex2/io/Packet.js';

// IdentityKit definitions (player models)
export default class IdkType {
    static count = 0;
    static instances = [];

    type = -1;
    models = [];
    recol_s = [];
    recol_d = [];
    heads = [];
    disable = false;

    static unpack(config) {
        let dat = new Packet(config.read('idk.dat'));
        IdkType.count = dat.g2();

        for (let i = 0; i < IdkType.count; i++) {
            IdkType.instances[i] = new IdkType();
            IdkType.instances[i].decode(dat);
        }
    }

    decode(dat) {
        while (true) {
            let code = dat.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
                this.type = dat.g1();
            } else if (code === 2) {
                let count = dat.g1();

                for (let i = 0; i < count; i++) {
                    this.models[i] = dat.g2();
                }
            } else if (code === 3) {
                this.disable = true;
            } else if (code >= 40 && code < 50) {
                this.recol_s[code - 40] = dat.g2();
            } else if (code >= 50 && code < 60) {
                this.recol_s[code - 50] = dat.g2();
            } else if (code >= 60 && code < 70) {
                this.heads[code - 60] = dat.g2();
            } else {
                console.log(`Error unrecognized idk config code ${code}`);
            }
        }
    }

    getModel() {
    }

    getHeadModel() {
    }
}
