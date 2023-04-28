import Jagfile from '#cache/Jagfile.js';
import Packet from '#util/Packet.js';
import fs from 'fs';
import PackOrder from './PackOrder.js';
import Constants from './Constants.js';
import SequenceType from './SequenceType.js';
import VarpType from './VarpType.js';
import ObjectType from './ObjectType.js';

function statToName(stat) {
    switch (stat) {
        case 0:
            return 'attack';
        case 1:
            return 'defence';
        case 2:
            return 'strength';
        case 3:
            return 'hitpoints';
        case 4:
            return 'ranged';
        case 5:
            return 'prayer';
        case 6:
            return 'magic';
        case 7:
            return 'cooking';
        case 8:
            return 'woodcutting';
        case 9:
            return 'fletching';
        case 10:
            return 'fishing';
        case 11:
            return 'firemaking';
        case 12:
            return 'crafting';
        case 13:
            return 'smithing';
        case 14:
            return 'mining';
        case 15:
            return 'herblore';
        case 16:
            return 'agility';
        case 17:
            return 'thieving';
        case 20:
            return 'runecraft';
        default:
            return stat;
    }
}

export default class IfType {
    static TYPE_LAYER = 0;
    static TYPE_UNUSED = 1;
    static TYPE_INVENTORY = 2;
    static TYPE_RECTANGLE = 3;
    static TYPE_TEXT = 4;
    static TYPE_GRAPHIC = 5;
    static TYPE_MODEL = 6;
    static TYPE_INVENTORY_TEXT = 7;

    static BUTTON = 1;
    static TARGET_BUTTON = 2;
    static CLOSE_BUTTON = 3;
    static TOGGLE_BUTTON = 4;
    static SELECT_BUTTON = 5;
    static PAUSE_BUTTON = 6;

    static FONT_P11 = 0;
    static FONT_P12 = 1;
    static FONT_B12 = 2;
    static FONT_Q8 = 3;

    static COMPARATOR_NEQ = 1;
    static COMPARATOR_GEQ = 2;
    static COMPARATOR_LEQ = 3;
    static COMPARATOR_EQ = 4;

    static LOAD_STAT_LEVEL = 1;
    static LOAD_STAT_BASE_LEVEL = 2;
    static LOAD_STAT_XP = 3;
    static LOAD_INV_COUNT = 4;
    static LOAD_VAR = 5;
    static LOAD_STAT_XP_REMAINING = 6;
    static LOAD_OP7 = 7;
    static LOAD_COMBAT_LEVEL = 8;
    static LOAD_TOTAL_LEVEL = 9;
    static LOAD_INV_CONTAINS = 10;
    static LOAD_RUNENERGY = 11;
    static LOAD_RUNWEIGHT = 12;
    static LOAD_BOOL = 13;

    static config = {};
    static ids = [];

    type = 0;
    buttontype = 0;
    contenttype = 0;
    width = 0;
    height = 0;
    scriptComparator = [];
    scriptOperand = [];
    script = [];
    children = [];
    childX = [];
    childY = [];
    inventoryDummy = false;
    inventoryHasOptions = false;
    inventoryIsUsable = false;
    inventoryMarginX = 0;
    inventoryMarginY = 0;
    inventoryOffsetX = [];
    inventoryOffsetY = [];
    inventoryGraphic = [];
    inventoryOptions = ['', '', '', '', ''];
    fill = false;
    halign = false;
    font = 0;
    shadow = false;
    text = '';
    activeText = '';
    colour = 0;
    activecolour = 0;
    overcolour = 0;
    graphic = '';
    activeGraphic = '';
    optionCircumfix = '';
    optionSuffix = '';
    optionFlags = 0;
    option = '';
    hide = false;
    scrollheight = 0;
    xan = 0;
    yan = 0;
    layer = -1;
    overlayer = -1;

    static get(id) {
        if (IfType.config[id]) {
            return IfType.config[id];
        }

        return null;
    }

    static max() {
        let max = 0;
        for (let i = 0; i < IfType.ids.length; i++) {
            if (IfType.ids[i] > max) {
                max = IfType.ids[i];
            }
        }
        return max + 3;
    }

    static loadDirectory(path) {
        let files = fs.readdirSync(path);

        for (let i = 0; i < files.length; i++) {
            IfType.load(fs.readFileSync(`${path}/${files[i]}`, 'utf8'));
        }

        // fixup children now that all types are loaded
        let max = IfType.max();
        for (let i = 0; i < max; i++) {
            const config = IfType.get(i);
            if (!config || config.layer === config.id) {
                continue;
            }

            const parent = IfType.get(config.layer);
            if (!parent) {
                continue;
            }

            if (parent.children.indexOf(config.id) === -1) {
                parent.children.push(config.id);
                parent.childX.push(config.x ?? 0);
                parent.childY.push(config.y ?? 0);
            }

            delete config.x;
            delete config.y;
        }
    }

    static load(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');
        let offset = 0;

        let config;
        while (offset < lines.length) {
            if (!lines[offset] || lines[offset].startsWith('//')) {
                offset++;
                continue;
            }

            if (lines[offset].startsWith('[')) {
                // extract text in brackets
                let name = lines[offset].substring(1, lines[offset].indexOf(']')).split(':');

                let rootLayer = -1;
                let id = -1;

                if (name.length > 1) {
                    // component
                    rootLayer = parseInt(PackOrder.get(name[0]));
                    id = parseInt(PackOrder.get(name[1]));
                } else {
                    // root layer
                    rootLayer = parseInt(PackOrder.get(name[0]));
                    id = rootLayer;
                }

                IfType.ids.push(id);
                config = new IfType();
                config.id = id;
                config.rootLayer = rootLayer;
                config.layer = rootLayer; // can be overwritten by layer= in config

                offset++;
                continue;
            }

            while (lines[offset] && !lines[offset].startsWith('[')) {
                if (!lines[offset] || lines[offset].startsWith('//')) {
                    offset++;
                    continue;
                }

                const parts = lines[offset].split('=');
                const key = parts[0].trim();
                let value = parts.slice(1).join('='); // text can have = in it

                // if value contains a constant, replace all instances of it
                // value may be permitted a comma so we need to extract the constant
                // in a loop
                if (value.indexOf(',') !== -1) {
                    const values = value.split(',');

                    for (let i = 0; i < values.length; i++) {
                        let val = values[i];

                        while (val.indexOf('^') !== -1) {
                            const index = val.indexOf('^');
                            const constant = val.substring(index);

                            let match = Constants.get(constant);
                            if (typeof match !== 'undefined') {
                                val = val.replace(constant, match);
                            } else {
                                console.error(`Could not find constant for ${constant}`);
                            }
                        }

                        values[i] = val;
                    }

                    value = values.join(',');
                } else {
                    while (value.indexOf('^') !== -1) {
                        const index = value.indexOf('^');
                        const constant = value.substring(index);

                        let match = Constants.get(constant);
                        if (typeof match !== 'undefined') {
                            value = value.replace(constant, match);
                        } else {
                            console.error(`Could not find constant for ${constant}`);
                        }
                    }
                }

                if (key === 'layer') {
                    config.layer = parseInt(PackOrder.get(value));
                } else if (key === 'type') {
                    config.type = parseInt(value);
                } else if (key === 'buttontype') {
                    config.buttontype = parseInt(value);
                } else if (key === 'contenttype') {
                    config.contenttype = parseInt(value);
                } else if (key === 'x') {
                    config.x = parseInt(value);
                } else if (key === 'y') {
                    config.y = parseInt(value);
                } else if (key === 'width') {
                    config.width = parseInt(value);
                } else if (key === 'height') {
                    config.height = parseInt(value);
                } else if (key === 'overlayer') {
                    config.overlayer = parseInt(PackOrder.get(value));
                } else if (key === 'scrollheight') {
                    config.scrollheight = parseInt(value);
                } else if (key === 'hide') {
                    config.hide = value === 'yes';
                } else if (key === 'invdummy') {
                    config.inventoryDummy = value === 'yes';
                } else if (key === 'invoptions') {
                    config.inventoryHasOptions = value === 'yes';
                } else if (key === 'invusable') {
                    config.inventoryIsUsable = value === 'yes';
                } else if (key === 'invxof') {
                    config.inventoryMarginX = parseInt(value);
                } else if (key === 'invyof') {
                    config.inventoryMarginY = parseInt(value);
                } else if (key === 'fill') {
                    config.fill = value === 'yes';
                } else if (key === 'halign') {
                    config.halign = value === 'yes';
                } else if (key === 'font') {
                    config.font = parseInt(value);
                } else if (key === 'shadow') {
                    config.shadow = value === 'yes';
                } else if (key === 'text') {
                    config.text = value;
                } else if (key === 'activetext') {
                    config.activeText = value;
                } else if (key === 'colour') {
                    config.colour = parseInt(value, 16);
                } else if (key === 'activecolour') {
                    config.activecolour = parseInt(value, 16);
                } else if (key === 'overcolour') {
                    config.overcolour = parseInt(value, 16);
                } else if (key === 'graphic') {
                    config.graphic = value;
                } else if (key === 'activegraphic') {
                    config.activeGraphic = value;
                } else if (key === 'model') {
                    config.model = parseInt(PackOrder.get(value));
                } else if (key === 'activemodel') {
                    config.activeModel = parseInt(PackOrder.get(value));
                } else if (key === 'seq') {
                    config.seq = parseInt(SequenceType.getId(value));
                } else if (key === 'activeseq') {
                    config.activeSeq = parseInt(SequenceType.getId(value));
                } else if (key === 'zoom') {
                    config.zoom = parseInt(value);
                } else if (key === 'xan') {
                    config.xan = parseInt(value);
                } else if (key === 'yan') {
                    config.yan = parseInt(value);
                } else if (key === 'optioncircumfix') {
                    config.optionCircumfix = value;
                } else if (key === 'optionsuffix') {
                    config.optionSuffix = value;
                } else if (key === 'optionflags') {
                    config.optionFlags = parseInt(value);
                } else if (key === 'option') {
                    config.option = value;
                } else if (key.startsWith('invgraphic')) {
                    config.inventoryOffsetX = config.inventoryOffsetX || [];
                    config.inventoryOffsetY = config.inventoryOffsetY || [];
                    config.inventoryGraphic = config.inventoryGraphic || [];

                    // this one is split up into 3 parts, x, y, and the graphic
                    const index = parseInt(key.substring('invgraphic'.length)) - 1;
                    const subparts = value.split(',');

                    config.inventoryOffsetX[index] = parseInt(subparts[0]);
                    config.inventoryOffsetY[index] = parseInt(subparts[1]);
                    config.inventoryGraphic[index] = subparts.slice(2).join(','); // the graphic actually has a comma in it
                } else if (key.startsWith('invoption')) {
                    const index = parseInt(key.substring('invoption'.length)) - 1;
                    config.inventoryOptions[index] = value;
                } else if (key.startsWith('scriptc')) {
                    config.scriptComparator = config.scriptComparator || [];

                    const index = parseInt(key.substring('scriptc'.length)) - 1;
                    config.scriptComparator[index] = parseInt(value);
                } else if (key.startsWith('scriptv')) {
                    config.scriptOperand = config.scriptOperand || [];

                    const index = parseInt(key.substring('scriptv'.length)) - 1;
                    config.scriptOperand[index] = parseInt(value);
                } else if (key.startsWith('script')) {
                    // format: script<id>op<opcode>=<value>

                    const index = key.substring('script'.length, key.indexOf('op')) - 1;
                    const opIndex = key.substring(key.indexOf('op') + 2) - 1;
                    const params = value.split(',');

                    config.script = config.script || [];
                    config.script[index] = config.script[index] || [];

                    config.script[index].push(parseInt(params[0]));

                    for (let i = 1; i < params.length; i++) {
                        if (PackOrder.get(params[i])) {
                            config.script[index].push(PackOrder.get(params[i]));
                        } else if (VarpType.getId(params[i]) !== -1) {
                            config.script[index].push(VarpType.getId(params[i]));
                        } else if (ObjectType.getId(params[i]) !== -1) {
                            config.script[index].push(ObjectType.getId(params[i]));
                        } else {
                            if (isNaN(params[i])) {
                                continue;
                            }

                            config.script[index].push(parseInt(params[i]));
                        }
                    }
                } else {
                    console.log(`Unrecognized if config "${key}" in ${config.namedId}`);
                }

                offset++;
            }

            IfType.config[config.id] = config;
        }
    }

    static pack() {
        let max = IfType.max();

        const dat = new Packet();
        dat.p2(max);

        for (let i = 0; i < max; i++) {
            const config = IfType.get(i);
            if (!config || config.type !== IfType.TYPE_LAYER || config.rootLayer != config.id) {
                continue;
            }

            IfType.packInner(dat, config);
        }

        dat.pos = 0;
        return dat;
    }

    static packInner(dat, config, lastLayer = -1) {
        const packed = config.pack();

        if (config.layer !== lastLayer) {
            dat.p2(-1);
            dat.p2(config.layer);
        }

        dat.p2(config.id);
        dat.pdata(packed);

        // ----

        if (config.type === IfType.TYPE_LAYER) {
            for (let i = 0; i < config.children.length; i++) {
                const child = IfType.get(config.children[i]);
                IfType.packInner(dat, child, config.id);
            }
        }
    }

    pack() {
        let dat = new Packet();

        dat.p1(this.type);
        dat.p1(this.buttontype);
        dat.p2(this.contenttype);
        dat.p2(this.width);
        dat.p2(this.height);

        if (this.overlayer != -1) {
            dat.p1((this.overlayer >> 8) + 1);
            dat.p1(this.overlayer & 0xFF);
        } else {
            dat.p1(0);
        }

        dat.p1(this.scriptComparator.length);
        for (let i = 0; i < this.scriptComparator.length; ++i) {
            dat.p1(this.scriptComparator[i]);
            dat.p2(this.scriptOperand[i]);
        }

        dat.p1(this.script.length);
        for (let i = 0; i < this.script.length; ++i) {
            dat.p2(this.script[i].length + 1);

            if (this.script[i].length) {
                for (let j = 0; j < this.script[i].length; ++j) {
                    dat.p2(this.script[i][j]);
                }

                dat.p2(0);
            }
        }

        if (this.type === IfType.TYPE_LAYER) {
            dat.p2(this.scrollheight);
            dat.pbool(this.hide);

            dat.p1(this.children.length);
            for (let i = 0; i < this.children.length; ++i) {
                dat.p2(this.children[i]);
                dat.p2(this.childX[i]);
                dat.p2(this.childY[i]);
            }
        }

        if (this.type === IfType.TYPE_INVENTORY) {
            dat.pbool(this.inventoryDummy);
            dat.pbool(this.inventoryHasOptions);
            dat.pbool(this.inventoryIsUsable);
            dat.p1(this.inventoryMarginX);
            dat.p1(this.inventoryMarginY);

            for (let i = 0; i < 20; i++) {
                dat.pbool(this.inventoryGraphic[i]);

                if (this.inventoryGraphic[i]) {
                    dat.p2(this.inventoryOffsetX[i]);
                    dat.p2(this.inventoryOffsetY[i]);
                    dat.pjstr(this.inventoryGraphic[i]);
                }
            }

            for (let i = 0; i < 5; i++) {
                dat.pjstr(this.inventoryOptions[i]);
            }
        }

        if (this.type === IfType.TYPE_RECTANGLE) {
            dat.pbool(this.fill);
        }

        if (this.type === IfType.TYPE_TEXT) {
            dat.pbool(this.halign);
            dat.p1(this.font);
            dat.pbool(this.shadow);
        }

        if (this.type === IfType.TYPE_TEXT) {
            dat.pjstr(this.text);
            dat.pjstr(this.activeText);
        }

        if (this.type === IfType.TYPE_RECTANGLE || this.type === IfType.TYPE_TEXT) {
            dat.p4(this.colour);
            dat.p4(this.activecolour);
            dat.p4(this.overcolour);
        }

        if (this.type === IfType.TYPE_GRAPHIC) {
            dat.pjstr(this.graphic);
            dat.pjstr(this.activeGraphic);
        }

        if (this.type === IfType.TYPE_MODEL) {
            if (typeof this.model !== 'undefined') {
                dat.p1((this.model >> 8) + 1);
                dat.p1(this.model & 0xFF);
            } else {
                dat.p1(0);
            }

            if (typeof this.activeModel !== 'undefined') {
                dat.p1((this.activeModel >> 8) + 1);
                dat.p1(this.activeModel & 0xFF);
            } else {
                dat.p1(0);
            }

            if (typeof this.seq !== 'undefined') {
                dat.p1((this.seq >> 8) + 1);
                dat.p1(this.seq & 0xFF);
            } else {
                dat.p1(0);
            }

            if (typeof this.activeSeq !== 'undefined') {
                dat.p1((this.activeSeq >> 8) + 1);
                dat.p1(this.activeSeq & 0xFF);
            } else {
                dat.p1(0);
            }

            dat.p2(this.zoom);
            dat.p2(this.xan);
            dat.p2(this.yan);
        }

        if (this.type === IfType.TYPE_INVENTORY_TEXT) {
            dat.pbool(this.halign);
            dat.p1(this.font);
            dat.pbool(this.shadow);
            dat.p4(this.colour);

            dat.p2(this.inventoryMarginX);
            dat.p2(this.inventoryMarginY);
            dat.pbool(this.inventoryHasOptions);

            for (let i = 0; i < 5; i++) {
                dat.pjstr(this.inventoryOptions[i]);
            }
        }

        if (this.buttontype === IfType.TARGET_BUTTON || this.type === IfType.TYPE_INVENTORY) {
            dat.pjstr(this.optionCircumfix);
            dat.pjstr(this.optionSuffix);
            dat.p2(this.optionFlags);
        }

        if (this.buttontype === IfType.BUTTON || this.buttontype === IfType.TOGGLE_BUTTON || this.buttontype === IfType.SELECT_BUTTON || this.buttontype === IfType.PAUSE_BUTTON) {
            dat.pjstr(this.option);
        }

        dat.pos = 0;
        return dat;
    }

    static unpack(dat) {
        let _count = dat.g2();

        let rootLayer = -1;
        let layer = -1;
        while (dat.available > 0) {
            let config = new IfType();

            let id = dat.g2();
            if (id === 65535) {
                layer = dat.g2();
                id = dat.g2();
            }

            if (layer === id) {
                rootLayer = layer;
            }

            IfType.ids.push(id);
            config.id = id;
            config.rootLayer = rootLayer;
            config.layer = layer;

            config.type = dat.g1();
            config.buttontype = dat.g1();
            config.contenttype = dat.g2();
            config.width = dat.g2();
            config.height = dat.g2();

            let overlayer = dat.g1();
            if (overlayer !== 0) {
                config.overlayer = ((overlayer - 1) << 8) | dat.g1();
            }

            let comparatorCount = dat.g1();
            config.scriptComparator = [];
            config.scriptOperand = [];
            for (let i = 0; i < comparatorCount; ++i) {
                config.scriptComparator[i] = dat.g1();
                config.scriptOperand[i] = dat.g2();
            }

            let scriptCount = dat.g1();
            config.script = [];
            for (let i = 0; i < scriptCount; ++i) {
                let opcodeCount = dat.g2();
                config.script[i] = [];

                for (let j = 0; j < opcodeCount - 1; ++j) {
                    config.script[i][j] = dat.g2();
                }

                dat.g2(); // should be 0
            }

            if (config.type === IfType.TYPE_LAYER) {
                config.scrollheight = dat.g2();
                config.hide = dat.gbool();

                let childrenCount = dat.g1();
                for (let i = 0; i < childrenCount; ++i) {
                    config.children[i] = dat.g2();
                    config.childX[i] = dat.g2s();
                    config.childY[i] = dat.g2s();
                }
            }

            if (config.type === IfType.TYPE_INVENTORY) {
                config.inventoryDummy = dat.gbool();
                config.inventoryHasOptions = dat.gbool();
                config.inventoryIsUsable = dat.gbool();
                config.inventoryMarginX = dat.g1();
                config.inventoryMarginY = dat.g1();

                for (let i = 0; i < 20; ++i) {
                    let hasSprite = dat.gbool();
                    if (hasSprite) {
                        config.inventoryOffsetX[i] = dat.g2s();
                        config.inventoryOffsetY[i] = dat.g2s();
                        config.inventoryGraphic[i] = dat.gjstr();
                    }
                }

                for (let i = 0; i < 5; ++i) {
                    config.inventoryOptions[i] = dat.gjstr();
                }
            }

            if (config.type === IfType.TYPE_RECTANGLE) {
                config.fill = dat.gbool();
            }

            if (config.type === IfType.TYPE_TEXT) {
                config.halign = dat.gbool();
                config.font = dat.g1();
                config.shadow = dat.gbool();
            }

            if (config.type === IfType.TYPE_TEXT) {
                config.text = dat.gjstr();
                config.activeText = dat.gjstr();
            }

            if (config.type === IfType.TYPE_RECTANGLE || config.type === IfType.TYPE_TEXT) {
                config.colour = dat.g4();
                config.activecolour = dat.g4();
                config.overcolour = dat.g4();
            }

            if (config.type === IfType.TYPE_GRAPHIC) {
                config.graphic = dat.gjstr();
                config.activeGraphic = dat.gjstr();
            }

            if (config.type === IfType.TYPE_MODEL) {
                let model = dat.g1();
                if (model != 0) {
                    config.model = ((model - 1) << 8) | dat.g1();
                }

                let activeModel = dat.g1();
                if (activeModel != 0) {
                    config.activeModel = ((activeModel - 1) << 8) | dat.g1();
                }

                let seq = dat.g1();
                if (seq != 0) {
                    config.seq = ((seq - 1) << 8) | dat.g1();
                }

                let activeSeq = dat.g1();
                if (activeSeq != 0) {
                    config.activeSeq = ((activeSeq - 1) << 8) | dat.g1();
                }

                config.zoom = dat.g2();
                config.xan = dat.g2();
                config.yan = dat.g2();
            }

            if (config.type === IfType.TYPE_INVENTORY_TEXT) {
                config.halign = dat.gbool();
                config.font = dat.g1();
                config.shadow = dat.gbool();
                config.colour = dat.g4();

                config.inventoryMarginX = dat.g2s();
                config.inventoryMarginY = dat.g2s();
                config.inventoryHasOptions = dat.gbool();

                for (let i = 0; i < 5; i++) {
                    config.inventoryOptions[i] = dat.gjstr();
                }
            }

            if (config.buttontype === IfType.TARGET_BUTTON || config.type === IfType.TYPE_INVENTORY) {
                config.optionCircumfix = dat.gjstr();
                config.optionSuffix = dat.gjstr();
                config.optionFlags = dat.g2();
            }

            if (config.buttontype === IfType.BUTTON || config.buttontype === IfType.TOGGLE_BUTTON || config.buttontype === IfType.SELECT_BUTTON || config.buttontype === IfType.PAUSE_BUTTON) {
                config.option = dat.gjstr();
            }

            IfType.config[config.id] = config;
        }
    }

    static dumpToDirectory(path) {
        fs.mkdirSync(path, { recursive: true });

        let max = IfType.max();

        for (let i = 0; i < max; i++) {
            const config = IfType.get(i);
            if (!config || config.layer !== config.id) {
                // we only want root layers
                continue;
            }

            fs.writeFileSync(`${path}/${config.id}.if`, IfType.dumpInner(config));
        }
    }

    static dumpInner(config, layer = null, x = null, y = null) {
        let def;

        if (config.id === config.layer) {
            def = `[if_${config.id}]\n`;
        } else {
            def = `[if_${config.rootLayer}:com_${config.id}]\n`;
        }

        if (layer !== null && config.rootLayer !== layer) {
            def += `layer=com_${layer}\n`;
        }

        if (config.type === IfType.TYPE_LAYER) {
            def += `type=^iftype_layer\n`;
        } else if (config.type === IfType.TYPE_INVENTORY) {
            def += `type=^iftype_inventory\n`;
        } else if (config.type === IfType.TYPE_RECTANGLE) {
            def += `type=^iftype_rectangle\n`;
        } else if (config.type === IfType.TYPE_TEXT) {
            def += `type=^iftype_text\n`;
        } else if (config.type === IfType.TYPE_GRAPHIC) {
            def += `type=^iftype_graphic\n`;
        } else if (config.type === IfType.TYPE_MODEL) {
            def += `type=^iftype_model\n`;
        } else if (config.type === IfType.TYPE_INVENTORY_TEXT) {
            def += `type=^iftype_inventory_text\n`;
        }

        if (config.buttontype === IfType.BUTTON) {
            def += `buttontype=^if_button\n`;
        } else if (config.buttontype === IfType.TARGET_BUTTON) {
            def += `buttontype=^if_targetbutton\n`;
        } else if (config.buttontype === IfType.CLOSE_BUTTON) {
            def += `buttontype=^if_closebutton\n`;
        } else if (config.buttontype === IfType.TOGGLE_BUTTON) {
            def += `buttontype=^if_togglebutton\n`;
        } else if (config.buttontype === IfType.SELECT_BUTTON) {
            def += `buttontype=^if_selectbutton\n`;
        } else if (config.buttontype === IfType.PAUSE_BUTTON) {
            def += `buttontype=^if_pausebutton\n`;
        }

        if (config.contenttype != 0) {
            def += `contenttype=${config.contenttype}\n`;
        }

        if (x !== null && x !== 0) {
            def += `x=${x}\n`;
        }

        if (y !== null && y !== 0) {
            def += `y=${y}\n`;
        }

        def += `width=${config.width}\n`;
        def += `height=${config.height}\n`;

        if (config.overlayer !== -1) {
            def += `overlayer=com_${config.overlayer}\n`;
        }

        for (let i = 0; i < config.script.length; i++) {
            let opcount = 1;

            if (typeof config.scriptComparator[i] !== 'undefined') {
                def += `scriptc${i + 1}=`;

                switch (config.scriptComparator[i]) {
                    case IfType.COMPARATOR_NEQ:
                        def += `^op_neq`;
                        break;
                    case IfType.COMPARATOR_GEQ:
                        def += `^op_geq`;
                        break;
                    case IfType.COMPARATOR_LEQ:
                        def += `^op_leq`;
                        break;
                    case IfType.COMPARATOR_EQ:
                        def += `^op_eq`;
                        break;
                    default:
                        def += `${config.scriptComparator[i]}`;
                        break;
                }

                def += '\n';
                def += `scriptv${i + 1}=${config.scriptOperand[i]}\n`;
            }

            for (let j = 0; j < config.script[i].length; j++) {
                if (config.script[i][j] === 0) {
                    continue;
                }

                def += `script${i + 1}op${opcount++}=`;

                switch (config.script[i][j]) {
                    case IfType.LOAD_STAT_LEVEL:
                        def += `^load_stat_level,^${statToName(config.script[i][++j])}`;
                        break;
                    case IfType.LOAD_STAT_BASE_LEVEL:
                        def += `^load_stat_base_level,^${statToName(config.script[i][++j])}`;
                        break;
                    case IfType.LOAD_STAT_XP:
                        def += `^load_stat_xp,^${statToName(config.script[i][++j])}`;
                        break;
                    case IfType.LOAD_INV_COUNT:
                        def += `^load_inv_count,com_${config.script[i][++j]},obj_${config.script[i][++j]}`;
                        break;
                    case IfType.LOAD_VAR:
                        def += `^load_var,varp_${config.script[i][++j]}`;
                        break;
                    case IfType.LOAD_STAT_XP_REMAINING:
                        def += `^load_stat_xp_remaining,^${statToName(config.script[i][++j])}`;
                        break;
                    case IfType.LOAD_OP7:
                        def += `^load_op7`;
                        break;
                    case IfType.LOAD_COMBAT_LEVEL:
                        def += `^load_op7`;
                        break;
                    case IfType.LOAD_TOTAL_LEVEL:
                        def += `^load_op7`;
                        break;
                    case IfType.LOAD_INV_CONTAINS:
                        def += `^load_inv_contains,com_${config.script[i][++j]},obj_${config.script[i][++j]}`;
                        break;
                    case IfType.LOAD_RUNENERGY:
                        def += `^load_runenergy`;
                        break;
                    case IfType.LOAD_RUNWEIGHT:
                        def += `^load_runweight`;
                        break;
                    case IfType.LOAD_BOOL:
                        def += `^load_bool,varp_${config.script[i][++j]},${config.script[i][++j]}`;
                        break;
                    default:
                        def += `${config.script[i][j]}`;
                        break;
                }

                def += '\n';
            }
        }

        if (config.type === IfType.TYPE_LAYER) {
            if (config.scrollheight != 0) {
                def += `scrollheight=${config.scrollheight}\n`;
            }

            if (config.hide) {
                def += `hide=yes\n`;
            }
        }

        if (config.type === IfType.TYPE_INVENTORY) {
            if (config.inventoryDummy) {
                def += `invdummy=yes\n`;
            }

            if (config.inventoryHasOptions) {
                def += `invoptions=yes\n`;
            }

            if (config.inventoryIsUsable) {
                def += `invusable=yes\n`;
            }

            if (config.inventoryMarginX != 0) {
                def += `invxof=${config.inventoryMarginX}\n`;
            }

            if (config.inventoryMarginY != 0) {
                def += `invyof=${config.inventoryMarginY}\n`;
            }

            for (let i = 0; i < 20; i++) {
                if (config.inventoryGraphic[i]) {
                    def += `invgraphic${i + 1}=${config.inventoryOffsetX[i]},${config.inventoryOffsetY[i]},${config.inventoryGraphic[i]}\n`;
                }
            }

            for (let i = 0; i < 5; i++) {
                if (config.inventoryOptions[i]) {
                    def += `invoption${i + 1}=${config.inventoryOptions[i]}\n`;
                }
            }
        }

        if (config.type === IfType.TYPE_RECTANGLE) {
            if (config.fill) {
                def += `fill=yes\n`;
            }
        }

        if (config.type === IfType.TYPE_TEXT) {
            if (config.halign) {
                def += `halign=yes\n`;
            }

            if (config.font === IfType.FONT_P11) {
                def += `font=^p11\n`;
            } else if (config.font === IfType.FONT_P12) {
                def += `font=^p12\n`;
            } else if (config.font === IfType.FONT_B12) {
                def += `font=^b12\n`;
            } else if (config.font === IfType.FONT_Q8) {
                def += `font=^q8\n`;
            }

            if (config.shadow) {
                def += `shadow=yes\n`;
            }
        }

        if (config.type === IfType.TYPE_TEXT) {
            if (config.text) {
                def += `text=${config.text}\n`;
            }

            if (config.activeText) {
                def += `activetext=${config.activeText}\n`;
            }
        }

        if (config.type === IfType.TYPE_RECTANGLE || config.type === IfType.TYPE_TEXT) {
            if (config.colour !== 0) {
                def += `colour=0x${config.colour.toString(16)}\n`;
            }

            if (config.activecolour !== 0) {
                def += `activecolour=0x${config.activecolour.toString(16)}\n`;
            }

            if (config.overcolour !== 0) {
                def += `overcolour=0x${config.overcolour.toString(16)}\n`;
            }
        }

        if (config.type === IfType.TYPE_GRAPHIC) {
            if (config.graphic) {
                def += `graphic=${config.graphic}\n`;
            }

            if (config.activeGraphic) {
                def += `activegraphic=${config.activeGraphic}\n`;
            }
        }

        if (config.type === IfType.TYPE_MODEL) {
            if (typeof config.model !== 'undefined') {
                def += `model=model_${config.model}\n`;
            }

            if (typeof config.activeModel !== 'undefined') {
                def += `activemodel=model_${config.activeModel}\n`;
            }

            if (typeof config.seq !== 'undefined') {
                def += `seq=seq_${config.seq}\n`;
            }

            if (typeof config.activeSeq !== 'undefined') {
                def += `activeseq=seq_${config.activeSeq}\n`;
            }

            if (config.zoom !== 0) {
                def += `zoom=${config.zoom}\n`;
            }

            if (config.xan !== 0) {
                def += `xan=${config.xan}\n`;
            }

            if (config.yan !== 0) {
                def += `yan=${config.yan}\n`;
            }
        }

        if (config.type === IfType.TYPE_INVENTORY_TEXT) {
            if (config.halign) {
                def += `halign=yes\n`;
            }

            if (config.font === IfType.FONT_P11) {
                def += `font=^p11\n`;
            } else if (config.font === IfType.FONT_P12) {
                def += `font=^p12\n`;
            } else if (config.font === IfType.FONT_B12) {
                def += `font=^b12\n`;
            } else if (config.font === IfType.FONT_Q8) {
                def += `font=^q8\n`;
            }

            if (config.shadow) {
                def += `shadow=yes\n`;
            }

            if (config.colour !== 0) {
                def += `colour=0x${config.colour.toString(16)}\n`;
            }

            if (config.inventoryMarginX != 0) {
                def += `invxof=${config.inventoryMarginX}\n`;
            }

            if (config.inventoryMarginY != 0) {
                def += `invyof=${config.inventoryMarginY}\n`;
            }

            for (let i = 0; i < 5; i++) {
                if (config.inventoryOptions[i]) {
                    def += `invoption${i + 1}=${config.inventoryOptions[i]}\n`;
                }
            }
        }

        if (config.buttontype === IfType.TARGET_BUTTON || config.type === IfType.TYPE_INVENTORY) {
            if (config.optionCircumfix) {
                def += `optioncircumfix=${config.optionCircumfix}\n`;
            }

            if (config.optionSuffix) {
                def += `optionsuffix=${config.optionSuffix}\n`;
            }

            if (config.optionFlags) {
                def += `optionflags=${config.optionFlags}\n`;
            }
        }

        if (config.buttontype === IfType.BUTTON || config.buttontype === IfType.TOGGLE_BUTTON || config.buttontype === IfType.SELECT_BUTTON || config.buttontype === IfType.PAUSE_BUTTON) {
            if (config.option) {
                def += `option=${config.option}\n`;
            }
        }

        // ----

        if (config.type === IfType.TYPE_LAYER) {
            for (let i = 0; i < config.children.length; i++) {
                def += '\n';
                if (!IfType.get(config.children[i])) {
                    console.log('Missing child: ' + config.children[i]);
                }
                def += IfType.dumpInner(IfType.get(config.children[i]), config.id, config.childX[i] ?? 0, config.childY[i] ?? 0);
            }
        }

        return def;
    }
}
