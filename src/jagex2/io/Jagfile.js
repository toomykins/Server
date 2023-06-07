import Packet from '#jagex2/io/Packet.js';
import BZip2 from '#jagex2/io/BZip2.js';

export default class Jagfile {
    data = null;
    fileCount = 0;
    fileHash = [];
    fileName = [];
    fileUnpackedSize = [];
    filePackedSize = [];
    filePos = [];
    unpacked = false;

    static load(path) {
        return new Jagfile(Packet.file(path));
    }

    constructor(src) {
        let unpackedSize = src.g3();
        let packedSize = src.g3();

        if (unpackedSize === packedSize) {
            this.data = new Uint8Array(src.data);
            this.unpacked = false;
        } else {
            let temp = new Uint8Array(src.gdata(packedSize));
            this.data = BZip2.decompress(temp);
            src = new Packet(this.data);
            this.unpacked = true;
        }

        this.fileCount = src.g2();

        let pos = src.pos + this.fileCount * 10;
        for (let i = 0; i < this.fileCount; i++) {
            this.fileHash[i] = src.g4s();
            this.fileName[i] = KNOWN_HASHES.find(x => x.hash === this.fileHash[i]).name;
            this.fileUnpackedSize[i] = src.g3();
            this.filePackedSize[i] = src.g3();

            this.filePos[i] = pos;
            pos += this.filePackedSize[i];
        }
    }

    read(name) {
        let hash = 0;
        name = name.toUpperCase();
        for (let i = 0; i < name.length; i++) {
            hash = ((hash * 61 + name.charCodeAt(i)) - 32) | 0;
        }

        for (let i = 0; i < this.fileCount; i++) {
            if (this.fileHash[i] !== hash) {
                continue;
            }

            if (this.unpacked) {
                return new Packet(this.data.subarray(this.filePos[i], this.filePos[i] + this.filePackedSize[i]));
            } else {
                let temp = this.data.subarray(this.filePos[i], this.filePos[i] + this.filePackedSize[i]);
                return new Packet(BZip2.decompress(temp, false));
            }
        }

        return null;
    }
}

export const KNOWN_HASHES = [
    // title
    { name: 'index.dat', hash: -1929337337 },
    { name: 'logo.dat', hash: -1752651416 },
    { name: 'p11.dat', hash: 788735113 },
    { name: 'p12.dat', hash: 802580954 },
    { name: 'b12.dat', hash: 1071845628 },
    { name: 'q8.dat', hash: -1228840272 },
    { name: 'runes.dat', hash: -1668775416 },
    { name: 'title.dat', hash: -566502255 },
    { name: 'titlebox.dat', hash: -1891508522 },
    { name: 'titlebutton.dat', hash: 1955686745 },
    // seen in 274
    { name: 'p11_full.dat', hash: 1654911043 },
    { name: 'p12_full.dat', hash: -227242592 },
    { name: 'b12_full.dat', hash: -1124181286 },
    { name: 'q8_full.dat', hash: 204062206 },

    // config
    { name: 'flo.dat', hash: -1569261396 },
    { name: 'flo.idx', hash: -1569242604 },
    { name: 'idk.dat', hash: 150819851 },
    { name: 'idk.idx', hash: 150838643 },
    { name: 'loc.dat', hash: 682978269 },
    { name: 'loc.idx', hash: 682997061 },
    { name: 'npc.dat', hash: 1489108188 },
    { name: 'npc.idx', hash: 1489126980 },
    { name: 'obj.dat', hash: -1667617738 },
    { name: 'obj.idx', hash: -1667598946 },
    { name: 'seq.dat', hash: 886159288 },
    { name: 'seq.idx', hash: 886178080 },
    { name: 'spotanim.dat', hash: -955170442 },
    { name: 'spotanim.idx', hash: -955151650 },
    { name: 'varp.dat', hash: 383739196 },
    { name: 'varp.idx', hash: 383757988 },
    // seen in 254
    { name: 'varbit.dat', hash: -514869585 },
    { name: 'varbit.idx', hash: -514850793 },
    // seen in 274
    { name: 'mesanim.dat', hash: 182685561 },
    { name: 'mesanim.idx', hash: 182704353 },
    { name: 'mes.dat', hash: 1029250116 },
    { name: 'mes.idx', hash: 1029268908 },
    { name: 'param.dat', hash: -1818025236 },
    { name: 'param.idx', hash: -1818006444 },
    { name: 'hunt.dat', hash: 216316762 },
    { name: 'hunt.idx', hash: 216335554 },

    // interface
    { name: 'data', hash: 8297314 },

    // media
    { name: 'backbase1.dat', hash: 125902192 },
    { name: 'backbase2.dat', hash: 139748033 },
    { name: 'backhmid1.dat', hash: -1623648789 },
    { name: 'backhmid2.dat', hash: -1609802948 },
    { name: 'backleft1.dat', hash: 1354546316 },
    { name: 'backleft2.dat', hash: 1368392157 },
    { name: 'backright1.dat', hash: -1593819477 },
    { name: 'backright2.dat', hash: -1579973636 },
    { name: 'backtop1.dat', hash: -1102299012 },
    { name: 'backtop2.dat', hash: -1088453171 },
    { name: 'backvmid1.dat', hash: 1464846521 },
    { name: 'backvmid2.dat', hash: 1478692362 },
    { name: 'backvmid3.dat', hash: 1492538203 },
    { name: 'chatback.dat', hash: 1766681864 },
    { name: 'combatboxes.dat', hash: -1868599050 },
    { name: 'combaticons.dat', hash: 53973365 },
    { name: 'combaticons2.dat', hash: -952192193 },
    { name: 'combaticons3.dat', hash: -938346352 },
    { name: 'compass.dat', hash: -427405255 },
    { name: 'cross.dat', hash: 529843337 },
    { name: 'gnomeball_buttons.dat', hash: 22834782 },
    { name: 'headicons.dat', hash: -288954319 },
    { name: 'hitmarks.dat', hash: -1502153170 },
    // { name: 'index.dat', hash: -1929337337 },
    { name: 'invback.dat', hash: -1568083395 },
    { name: 'leftarrow.dat', hash: 1922934081 },
    { name: 'magicoff.dat', hash: 661178691 },
    { name: 'magicoff2.dat', hash: 1727594325 },
    { name: 'magicon.dat', hash: -869490323 },
    { name: 'magicon2.dat', hash: -1448902313 },
    { name: 'mapback.dat', hash: 1644583778 },
    { name: 'mapdots.dat', hash: 612871759 },
    { name: 'mapflag.dat', hash: -709488597 },
    { name: 'mapfunction.dat', hash: -1204854137 },
    { name: 'mapscene.dat', hash: 839488367 },
    { name: 'miscgraphics.dat', hash: 2081559868 },
    { name: 'miscgraphics2.dat', hash: -1823467094 },
    { name: 'miscgraphics3.dat', hash: -1809621253 },
    { name: 'prayerglow.dat', hash: 1694123055 },
    { name: 'prayeroff.dat', hash: 305236077 },
    { name: 'prayeron.dat', hash: 392041951 },
    { name: 'redstone1.dat', hash: -1392068576 },
    { name: 'redstone2.dat', hash: -1378222735 },
    { name: 'redstone3.dat', hash: -1364376894 },
    { name: 'rightarrow.dat', hash: 1442199444 },
    { name: 'scrollbar.dat', hash: -1571073093 },
    { name: 'sideicons.dat', hash: 1889496696 },
    { name: 'staticons.dat', hash: 661681639 },
    { name: 'staticons2.dat', hash: 1758274153 },
    { name: 'steelborder.dat', hash: 1043559214 },
    { name: 'steelborder2.dat', hash: -716997548 },
    { name: 'sworddecor.dat', hash: -884827257 },
    { name: 'tradebacking.dat', hash: -1000916878 },
    { name: 'wornicons.dat', hash: 1152574301 },
    // seen in 254
    { name: 'mapmarker.dat', hash: 1955804455 },
    { name: 'mod_icons.dat', hash: 449541346 },
    { name: 'mapedge.dat', hash: 1362520410 },
    // seen in 336
    { name: 'blackmark.dat', hash: -1857300557 },
    { name: 'button_brown.dat', hash: 1451391714 },
    { name: 'button_brown_big.dat', hash: -90207845 },
    { name: 'button_red.dat', hash: -888498683 },
    { name: 'chest.dat', hash: -416634290 },
    { name: 'coins.dat', hash: -58065069 },
    { name: 'headicons_hint.dat', hash: 1018124075 },
    { name: 'headicons_pk.dat', hash: 2038060091 },
    { name: 'headicons_prayer.dat', hash: -1337835461 },
    { name: 'key.dat', hash: 1150791544 },
    { name: 'keys.dat', hash: 1986120039 },
    { name: 'leftarrow_small.dat', hash: -1004178375 },
    { name: 'letter.dat', hash: 819035239 },
    { name: 'number_button.dat', hash: 1165431679 },
    { name: 'overlay_duel.dat', hash: 450862262 },
    { name: 'overlay_multiway.dat', hash: 2025126712 },
    { name: 'pen.dat', hash: 902321338 },
    { name: 'rightarrow_small.dat', hash: 523617556 },
    { name: 'startgame.dat', hash: 2004158547 },
    { name: 'tex_brown.dat', hash: -351562801 },
    { name: 'tex_red.dat', hash: -1811229622 },
    { name: 'titlescroll.dat', hash: -384541308 },

    // models (225 and before)
    { name: 'base_head.dat', hash: 659053171 },
    { name: 'base_label.dat', hash: 382250581 },
    { name: 'base_type.dat', hash: -1121516105 },
    { name: 'frame_del.dat', hash: -1313359330 },
    { name: 'frame_head.dat', hash: 690528443 },
    { name: 'frame_tran1.dat', hash: 1186107867 },
    { name: 'frame_tran2.dat', hash: 1199953708 },
    { name: 'ob_axis.dat', hash: -371539808 },
    { name: 'ob_face1.dat', hash: -113454781 },
    { name: 'ob_face2.dat', hash: -99608940 },
    { name: 'ob_face3.dat', hash: -85763099 },
    { name: 'ob_face4.dat', hash: -71917258 },
    { name: 'ob_face5.dat', hash: -58071417 },
    { name: 'ob_head.dat', hash: 1996729425 },
    { name: 'ob_point1.dat', hash: -268804774 },
    { name: 'ob_point2.dat', hash: -254958933 },
    { name: 'ob_point3.dat', hash: -241113092 },
    { name: 'ob_point4.dat', hash: -227267251 },
    { name: 'ob_point5.dat', hash: -213421410 },
    { name: 'ob_vertex1.dat', hash: 1350899006 },
    { name: 'ob_vertex2.dat', hash: 1364744847 },

    // versionlist (introduced in 234)
    { name: 'anim_crc', hash: -40228664 },
    { name: 'anim_index', hash: 715169772 },
    { name: 'anim_version', hash: -797498902 },
    { name: 'map_crc', hash: 1915414053 },
    { name: 'map_index', hash: 1987120305 },
    { name: 'map_version', hash: -923525801 },
    { name: 'midi_crc', hash: -1121254206 },
    { name: 'midi_index', hash: -1691482954 },
    { name: 'midi_version', hash: -945480188 },
    { name: 'model_crc', hash: -1761598724 },
    { name: 'model_index', hash: -706585152 },
    { name: 'model_version', hash: 252137566 },

    // textures
    // { name: 'index.dat', hash: -1929337337 },
    { name: '0.dat', hash: 224847211 },
    { name: '1.dat', hash: 238693052 },
    { name: '2.dat', hash: 252538893 },
    { name: '3.dat', hash: 266384734 },
    { name: '4.dat', hash: 280230575 },
    { name: '5.dat', hash: 294076416 },
    { name: '6.dat', hash: 307922257 },
    { name: '7.dat', hash: 321768098 },
    { name: '8.dat', hash: 335613939 },
    { name: '9.dat', hash: 349459780 },
    { name: '10.dat', hash: 1698082440 },
    { name: '11.dat', hash: 1711928281 },
    { name: '12.dat', hash: 1725774122 },
    { name: '13.dat', hash: 1739619963 },
    { name: '14.dat', hash: 1753465804 },
    { name: '15.dat', hash: 1767311645 },
    { name: '16.dat', hash: 1781157486 },
    { name: '17.dat', hash: 1795003327 },
    { name: '18.dat', hash: 1808849168 },
    { name: '19.dat', hash: 1822695009 },
    { name: '20.dat', hash: -1752288555 },
    { name: '21.dat', hash: -1738442714 },
    { name: '22.dat', hash: -1724596873 },
    { name: '23.dat', hash: -1710751032 },
    { name: '24.dat', hash: -1696905191 },
    { name: '25.dat', hash: -1683059350 },
    { name: '26.dat', hash: -1669213509 },
    { name: '27.dat', hash: -1655367668 },
    { name: '28.dat', hash: -1641521827 },
    { name: '29.dat', hash: -1627675986 },
    { name: '30.dat', hash: -907692254 },
    { name: '31.dat', hash: -893846413 },
    { name: '32.dat', hash: -880000572 },
    { name: '33.dat', hash: -866154731 },
    { name: '34.dat', hash: -852308890 },
    { name: '35.dat', hash: -838463049 },
    { name: '36.dat', hash: -824617208 },
    { name: '37.dat', hash: -810771367 },
    { name: '38.dat', hash: -796925526 },
    { name: '39.dat', hash: -783079685 },
    { name: '40.dat', hash: -63095953 },
    { name: '41.dat', hash: -49250112 },
    { name: '42.dat', hash: -35404271 },
    { name: '43.dat', hash: -21558430 },
    { name: '44.dat', hash: -7712589 },
    { name: '45.dat', hash: 6133252 },
    { name: '46.dat', hash: 19979093 },
    { name: '47.dat', hash: 33824934 },
    { name: '48.dat', hash: 47670775 },
    { name: '49.dat', hash: 61516616 },

    // wordenc
    { name: 'badenc.txt', hash: 1648736955 },
    { name: 'domainenc.txt', hash: 1694783164 },
    { name: 'fragmentsenc.txt', hash: -573349193 },
    { name: 'tldlist.txt', hash: -840867198 },

    // sounds
    { name: 'sounds.dat', hash: 232787039 },
];
