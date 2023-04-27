import fs from 'fs';
import Jagfile from '#cache/Jagfile.js';
import FloorType from '#cache/config/FloorType.js';
import IdentityKitType from '#cache/config/IdentityKitType.js';
import LocationType from '#cache/config/LocationType.js';
import NpcType from '#cache/config/NpcType.js';
import ObjectType from '#cache/config/ObjectType.js';
import SpotAnimationType from '#cache/config/SpotAnimationType.js';
import VarpType from '#cache/config/VarpType.js';
import SequenceType from '#cache/config/SequenceType.js';

let config = new Jagfile();

SequenceType.fromDef(fs.readFileSync('data/src/seq.def', 'utf8'));
let seqPack = SequenceType.pack();
config.write('seq.dat', seqPack.dat);
config.write('seq.idx', seqPack.idx);

LocationType.fromJagConfig(fs.readFileSync('data/src/loc.def', 'utf8'));
let locPack = LocationType.pack();
config.write('loc.dat', locPack.dat);
config.write('loc.idx', locPack.idx);

FloorType.fromJagConfig(fs.readFileSync('data/src/flo.def', 'utf8'));
let floPack = FloorType.pack();
config.write('flo.dat', floPack.dat);
config.write('flo.idx', floPack.idx);

SpotAnimationType.fromJagConfig(fs.readFileSync('data/src/spotanim.def', 'utf8'));
let spotanimPack = SpotAnimationType.pack();
config.write('spotanim.dat', spotanimPack.dat.data);
config.write('spotanim.idx', spotanimPack.idx.data);

ObjectType.fromJagConfig(fs.readFileSync('data/src/obj.def', 'utf8'));
let objPack = ObjectType.pack();
config.write('obj.dat', objPack.dat.data);
config.write('obj.idx', objPack.idx.data);

NpcType.fromJagConfig(fs.readFileSync('data/src/npc.def', 'utf8'));
let npcPack = NpcType.pack();
config.write('npc.dat', npcPack.dat.data);
config.write('npc.idx', npcPack.idx.data);

IdentityKitType.fromJagConfig(fs.readFileSync('data/src/idk.def', 'utf8'));
let idkPack = IdentityKitType.pack();
config.write('idk.dat', idkPack.dat.data);
config.write('idk.idx', idkPack.idx.data);

VarpType.fromJagConfig(fs.readFileSync('data/src/varp.def', 'utf8'));
let varpPack = VarpType.pack();
config.write('varp.dat', varpPack.dat.data);
config.write('varp.idx', varpPack.idx.data);

config.pack().toFile('data/cache/config');
