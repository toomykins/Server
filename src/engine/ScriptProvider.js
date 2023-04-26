import fs from 'fs';
import ScriptBuilder from '#engine/ScriptBuilder.js';
import Packet from '#util/Packet.js';

class ScriptProvider {
    scripts = [];

    load(path) {
        let scriptFiles = fs.readdirSync(path);

        for (let i = 0; i < scriptFiles.length; i++) {
            let id = Number(scriptFiles[i]);
            this.scripts[id] = ScriptBuilder.decode(Packet.fromFile(`${path}/${id}`));
            this.scripts[id].sourceInfo.id = id;
        }
    }

    get(id) {
        return this.scripts[id];
    }

    getByName(name) {
        return this.scripts.find(script => script.sourceInfo && script.sourceInfo.name === name);
    }
}

export default new ScriptProvider();
