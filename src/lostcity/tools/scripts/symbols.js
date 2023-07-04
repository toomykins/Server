import fs from 'fs';
import { loadPack } from '#lostcity/tools/pack/NameMap.js';

fs.mkdirSync('data/symbols', { recursive: true });
fs.writeFileSync('data/symbols/constants.tsv', '');

let npcSymbols = '';
let npcs = loadPack('data/pack/npc.pack');
for (let i = 0; i < npcs.length; i++) {
    npcSymbols += `${i}\t${npcs[i]}\n`;
}
fs.writeFileSync('data/symbols/npcs.tsv', npcSymbols);

let objSymbols = '';
let objs = loadPack('data/pack/obj.pack');
for (let i = 0; i < objs.length; i++) {
    objSymbols += `${i}\t${objs[i]}\n`;
}
fs.writeFileSync('data/symbols/objs.tsv', objSymbols);

let invSymbols = '';
let invs = loadPack('data/pack/inv.pack');
for (let i = 0; i < invs.length; i++) {
    invSymbols += `${i}\t${invs[i]}\n`;
}
fs.writeFileSync('data/symbols/invs.tsv', invSymbols);

let scriptSymbols = '';
let scripts = loadPack('data/pack/script.pack');
for (let i = 0; i < scripts.length; i++) {
    if (!scripts[i]) {
        continue;
    }

    scriptSymbols += `${i}\t${scripts[i]}\n`;
}
fs.writeFileSync('data/symbols/scripts.tsv', scriptSymbols);
