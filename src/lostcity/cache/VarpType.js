import { loadDir, loadPack } from '#lostcity/tools/pack/NameMap.js';

let varpPack = loadPack('data/pack/varp.pack');

export default class VarpType {
    static configs = [];

    static init() {
        // reading
        loadDir('data/src/scripts', '.varp', (src) => {
            let current = null;
            let config = [];

            for (let i = 0; i < src.length; i++) {
                let line = src[i];
                if (line.startsWith('//')) {
                    continue;
                }

                if (line.startsWith('[')) {
                    if (current) {
                        let id = varpPack.indexOf(current);
                        VarpType.configs[id] = config;
                    }

                    current = line.substring(1, line.length - 1);
                    config = [];
                    continue;
                }

                config.push(line);
            }

            if (current) {
                let id = varpPack.indexOf(current);
                VarpType.configs[id] = config;
            }
        });

        // parsing
        for (let i = 0; i < VarpType.configs.length; i++) {
            let lines = VarpType.configs[i];

            let config = new VarpType();
            for (let j = 0; j < lines.length; j++) {
                let line = lines[j];
                let key = line.substring(0, line.indexOf('='));
                let value = line.substring(line.indexOf('=') + 1);

                if (key === 'clientcode') {
                    config.clientcode = parseInt(value);
                } else if (key === 'transmit') {
                    // TODO: enum-ify
                    config.transmit = value;
                } else if (key === 'scope') {
                    // TODO: enum-ify
                    config.scope = value;
                }
            }

            VarpType.configs[i] = config;
        }
    }

    static get(id) {
        return VarpType.configs[id];
    }

    // ----

    clientcode = 0;
    transmit = null;
    scope = null;
}

console.time('VarpType.init()');
VarpType.init();
console.timeEnd('VarpType.init()');
