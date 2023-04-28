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
import Constants from '#cache/config/Constants.js';
import IfType from '#cache/config/IfType.js';
import PackOrder from '#cache/config/PackOrder.js';

Constants.load(fs.readFileSync('data/src/constants.def', 'utf8'));
PackOrder.load(fs.readFileSync('data/src/model.order', 'utf8'));
PackOrder.load(fs.readFileSync('data/src/if.order', 'utf8'));

SequenceType.fromDef(fs.readFileSync('data/src/seq.def', 'utf8'));
LocationType.fromDef(fs.readFileSync('data/src/loc.def', 'utf8'));
FloorType.fromDef(fs.readFileSync('data/src/flo.def', 'utf8'));
SpotAnimationType.fromDef(fs.readFileSync('data/src/spotanim.def', 'utf8'));
ObjectType.fromDef(fs.readFileSync('data/src/obj.def', 'utf8'));
NpcType.fromDef(fs.readFileSync('data/src/npc.def', 'utf8'));
IdentityKitType.fromDef(fs.readFileSync('data/src/idk.def', 'utf8'));
VarpType.fromDef(fs.readFileSync('data/src/varp.def', 'utf8'));

let config = new Jagfile();

let seq = SequenceType.pack();
// seq.dat.toFile('dump/seq.dat');
// seq.idx.toFile('dump/seq.idx');
config.write('seq.dat', seq.dat);
config.write('seq.idx', seq.idx);

let loc = LocationType.pack();
// loc.dat.toFile('dump/loc.dat');
// loc.idx.toFile('dump/loc.idx');
config.write('loc.dat', loc.dat);
config.write('loc.idx', loc.idx);

let flo = FloorType.pack();
// flo.dat.toFile('dump/flo.dat');
// flo.idx.toFile('dump/flo.idx');
config.write('flo.dat', flo.dat);
config.write('flo.idx', flo.idx);

let spotanim = SpotAnimationType.pack();
// spotanim.dat.toFile('dump/spotanim.dat');
// spotanim.idx.toFile('dump/spotanim.idx');
config.write('spotanim.dat', spotanim.dat.data);
config.write('spotanim.idx', spotanim.idx.data);

let obj = ObjectType.pack();
// obj.dat.toFile('dump/obj.dat');
// obj.idx.toFile('dump/obj.idx');
config.write('obj.dat', obj.dat.data);
config.write('obj.idx', obj.idx.data);

let npc = NpcType.pack();
// npc.dat.toFile('dump/npc.dat');
// npc.idx.toFile('dump/npc.idx');
config.write('npc.dat', npc.dat.data);
config.write('npc.idx', npc.idx.data);

let idk = IdentityKitType.pack();
// idk.dat.toFile('dump/idk.dat');
// idk.idx.toFile('dump/idk.idx');
config.write('idk.dat', idk.dat.data);
config.write('idk.idx', idk.idx.data);

let varp = VarpType.pack();
// varp.dat.toFile('dump/varp.dat');
// varp.idx.toFile('dump/varp.idx');
config.write('varp.dat', varp.dat.data);
config.write('varp.idx', varp.idx.data);

config.pack().toFile('data/cache/config');

// ----

IfType.loadDirectory('data/src/ifs');

let interfaces = new Jagfile();

interfaces.write('data', IfType.pack());
