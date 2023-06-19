import fs from 'fs';

import Jagfile from '#jagex2/io/Jagfile.js';

let jag = Jagfile.load('data/pack/client/interface');
let dat = jag.read('data');

let order = '';
let count = dat.g2();
let interfaces = [];
for (let i = 0; i < count; i++) {
    interfaces[i] = null;
}

// decode
let parentId = -1;
while (dat.available > 0) {
    let id = dat.g2();
    if (id === 65535) {
        parentId = dat.g2();
        id = dat.g2();
    }

    order += `${id}\n`;

    let com = {};
    com.id = id;
    com.parentId = parentId;
    com.type = dat.g1();
    com.optionType = dat.g1();
    com.contentType = dat.g2();
    com.width = dat.g2();
    com.height = dat.g2();
    com.delegateHover = dat.g1();
    if (com.delegateHover == 0) {
        com.delegateHover = -1;
    } else {
        com.delegateHover = (com.delegateHover - 1 << 8) + dat.g1();
    }

    let comparatorCount = dat.g1();
    if (comparatorCount > 0) {
        com.scriptComparator = [];
        com.scriptOperand = [];

        for (let i = 0; i < comparatorCount; i++) {
            com.scriptComparator[i] = dat.g1();
            com.scriptOperand[i] = dat.g2();
        }
    }

    let scriptCount = dat.g1();
    if (scriptCount > 0) {
        com.scripts = [];

        for (let i = 0; i < scriptCount; i++) {
            let opcodeCount = dat.g2();
            com.scripts[i] = [];

            for (let j = 0; j < opcodeCount; j++) {
                com.scripts[i][j] = dat.g2();
            }
        }
    }

    if (com.type == 0) {
        com.scrollableHeight = dat.g2();
        com.hide = dat.gbool();

        let childCount = dat.g1();
        com.childId = [];
        com.childX = [];
        com.childY = [];

        for (let i = 0; i < childCount; i++) {
            com.childId[i] = dat.g2();
            com.childX[i] = dat.g2s();
            com.childY[i] = dat.g2s();
        }
    }

    if (com.type == 1) {
        com.unusedShort1 = dat.g2();
        com.unusedBoolean1 = dat.gbool();
    }

    if (com.type == 2) {
        com.inventorySlotObjId = [];
        com.inventorySlotObjCount = [];

        com.inventoryDraggable = dat.gbool();
        com.inventoryInteractable = dat.gbool();
        com.inventoryUsable = dat.gbool();
        com.inventoryMarginX = dat.g1();
        com.inventoryMarginY = dat.g1();

        com.inventorySlotOffsetX = [];
        com.inventorySlotOffsetY = [];
        com.inventorySlotImage = [];

        for (let i = 0; i < 20; i++) {
            if (dat.gbool()) {
                com.inventorySlotOffsetX[i] = dat.g2s();
                com.inventorySlotOffsetY[i] = dat.g2s();
                com.inventorySlotImage[i] = dat.gjstr();
            }
        }

        com.inventoryOptions = [];
        for (let i = 0; i < 5; i++) {
            com.inventoryOptions[i] = dat.gjstr();
        }
    }

    if (com.type == 3) {
        com.fill = dat.gbool();
    }

    if (com.type == 4 || com.type == 1) {
        com.center = dat.gbool();
        com.font = dat.g1();
        com.shadow = dat.gbool();
    }

    if (com.type == 4) {
        com.text = dat.gjstr();
        com.activeText = dat.gjstr();
    }

    if (com.type == 1 || com.type == 3 || com.type == 4) {
        com.color = dat.g4();
    }

    if (com.type == 3 || com.type == 4) {
        com.activeColor = dat.g4();
        com.hoverColor = dat.g4();
    }

    if (com.type == 5) {
        com.image = dat.gjstr();
        com.activeImage = dat.gjstr();
    }

    if (com.type == 6) {
        com.model = dat.g1();
        if (com.model != 0) {
            com.model = (com.model - 1 << 8) + dat.g1();
        }

        com.activeModel = dat.g1();
        if (com.activeModel != 0) {
            com.activeModel = (com.activeModel - 1 << 8) + dat.g1();
        }

        com.seqId = dat.g1();
        if (com.seqId == 0) {
            com.seqId = -1;
        } else {
            com.seqId = (com.seqId - 1 << 8) + dat.g1();
        }

        com.activeSeqId = dat.g1();
        if (com.activeSeqId == 0) {
            com.activeSeqId = -1;
        } else {
            com.activeSeqId = (com.activeSeqId - 1 << 8) + dat.g1();
        }

        com.modelZoom = dat.g2();
        com.modelPitch = dat.g2();
        com.modelYaw = dat.g2();
    }

    if (com.type == 7) {
        com.inventorySlotObjId = [];
        com.inventorySlotObjCount = [];

        com.center = dat.gbool();
        com.font = dat.g1();
        com.shadow = dat.gbool();
        com.color = dat.g4();
        com.inventoryMarginX = dat.g2s();
        com.inventoryMarginY = dat.g2s();
        com.inventoryInteractable = dat.gbool();

        com.inventoryOptions = [];
        for (let i = 0; i < 5; i++) {
            com.inventoryOptions[i] = dat.gjstr();
        }
    }

    if (com.optionType == 2 || com.type == 2) {
        com.spellAction = dat.gjstr();
        com.spellName = dat.gjstr();
        com.spellFlags = dat.g2();
    }

    if (com.optionType == 1 || com.optionType == 4 || com.optionType == 5 || com.optionType == 6) {
        com.option = dat.gjstr();
    }

    interfaces[id] = com;
}

fs.writeFileSync('data/pack/inter.order', order);

let pack = [];
let packChildren = {};

// generate new names first
function generateNames(com, rootIfName) {
    if (com.id !== com.parentId) {
        pack[com.id] = `${rootIfName}:com_${packChildren[com.parentId]++}`;
    }

    if (com.childId) {
        for (let i = 0; i < com.childId.length; i++) {
            let childId = com.childId[i];
            let child = interfaces[childId];
            if (!child) {
                continue;
            }

            generateNames(child, rootIfName);
        }
    }
}

let ifId = 0;
for (let i = 0; i < interfaces.length; i++) {
    let com = interfaces[i];
    if (!com || com.id !== com.parentId) {
        // only want to iterate over root layers
        continue;
    }

    let name = `inter_${ifId++}`;
    pack[com.id] = name;
    packChildren[com.id] = 0;
    generateNames(com, name);
}

let packStr = '';
for (let i = 0; i < pack.length; i++) {
    if (!pack[i]) {
        continue;
    }

    packStr += `${i}=${pack[i]}\n`;
}
fs.writeFileSync('data/pack/inter.pack', packStr);

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

// convert to com format
function convert(com, x = 0, y = 0, lastCom = -1) {
    let str = '';

    if (com.id === com.parentId) {
        for (let i = 0; i < com.childId.length; i++) {
            if (i > 0) {
                str += '\n';
            }

            str += convert(interfaces[com.childId[i]], com.childX[i], com.childY[i]);
        }

        return str;
    }

    str += `[${pack[com.id].split(':')[1]}]\n`;

    if (lastCom !== -1) {
        str += `layer=${pack[lastCom].split(':')[1]}\n`;
    }

    switch (com.type) {
        case 0:
            str += 'type=layer\n';
            break;
        case 1:
            str += 'type=unused\n';
            break;
        case 2:
            str += 'type=inv\n';
            break;
        case 3:
            str += 'type=rect\n';
            break;
        case 4:
            str += 'type=text\n';
            break;
        case 5:
            str += 'type=graphic\n';
            break;
        case 6:
            str += 'type=model\n';
            break;
        case 7:
            str += 'type=invtext\n';
            break;
    }

    str += `x=${x}\n`;
    str += `y=${y}\n`;

    switch (com.optionType) {
        case 1:
            str += `buttontype=normal\n`;
            break;
        case 2:
            str += `buttontype=target\n`;
            break;
        case 3:
            str += `buttontype=close\n`;
            break;
        case 4:
            str += `buttontype=toggle\n`;
            break;
        case 5:
            str += `buttontype=select\n`;
            break;
        case 6:
            str += `buttontype=pause\n`;
            break;
    }

    if (com.contentType) {
        str += `clientcode=${com.contentType}\n`;
    }

    if (com.width) {
        str += `width=${com.width}\n`;
    }

    if (com.height) {
        str += `height=${com.height}\n`;
    }

    if (com.delegateHover !== -1) {
        str += `overlayer=${pack[com.delegateHover].split(':')[1]}\n`;
    }

    if (com.scripts) {
        for (let i = 0; i < com.scripts.length; i++) {
            let opcount = 1;

            for (let j = 0; j < com.scripts[i].length; j++) {
                if (com.scripts[i][j] === 0) {
                    continue;
                }

                str += `script${i + 1}op${opcount++}=`;

                switch (com.scripts[i][j]) {
                    case 1:
                        str += `stat_level,${statToName(com.scripts[i][++j])}`;
                        break;
                    case 2:
                        str += `stat_base_level,${statToName(com.scripts[i][++j])}`;
                        break;
                    case 3:
                        str += `stat_xp,${statToName(com.scripts[i][++j])}`;
                        break;
                    case 4:
                        str += `inv_count,${pack[com.scripts[i][++j]]},obj_${com.scripts[i][++j]}`;
                        break;
                    case 5:
                        str += `varp_${com.scripts[i][++j]}`;
                        break;
                    case 6:
                        str += `stat_xp_remaining,${statToName(com.scripts[i][++j])}`;
                        break;
                    case 7:
                        str += `op7`;
                        break;
                    case 8:
                        str += `op8`;
                        break;
                    case 9:
                        str += `op9`;
                        break;
                    case 10:
                        str += `inv_contains,${pack[com.scripts[i][++j]]},obj_${com.scripts[i][++j]}`;
                        break;
                    case 11:
                        str += `runenergy`;
                        break;
                    case 12:
                        str += `runweight`;
                        break;
                    case 13:
                        str += `bool,varp_${com.scripts[i][++j]},${com.scripts[i][++j]}`;
                        break;
                    default:
                        str += `${com.scripts[i][j]}`;
                        break;
                }

                str += '\n';
            }

            if (com.scriptComparator) {
                str += `script${i + 1}=`;
                switch (com.scriptComparator[i]) {
                    case 1:
                        str += 'eq';
                        break;
                    case 2:
                        str += 'leq';
                        break;
                    case 3:
                        str += 'geq';
                        break;
                    case 4:
                        str += 'neq';
                        break;
                }

                str += `,${com.scriptOperand[i]}\n`;
            }
        }
    }

    if (com.type === 0) {
        if (com.scrollableHeight) {
            str += `scroll=${com.scrollableHeight}\n`;
        }

        if (com.hide) {
            str += `hide=yes\n`;
        }
    }

    if (com.type === 2) {
        if (com.inventoryDraggable) {
            str += 'draggable=yes\n';
        }

        if (com.inventoryInteractable) {
            str += 'interactable=yes\n';
        }

        if (com.inventoryUsable) {
            str += 'usable=yes\n';
        }

        if (com.inventoryMarginX || com.inventoryMarginY) {
            str += `margin=${com.inventoryMarginX},${com.inventoryMarginY}\n`;
        }

        if (com.inventoryOptions) {
            for (let i = 0; i < com.inventoryOptions.length; i++) {
                str += `option${i + 1}=${com.inventoryOptions[i]}\n`;
            }
        }
    }

    if (com.type === 3) {
        if (com.fill) {
            str += `fill=yes\n`;
        }
    }

    if (com.type == 4 || com.type == 1) {
        if (com.center) {
            str += 'center=yes\n';
        }

        switch (str.font) {
            case 0:
                str += 'font=p11\n';
                break;
            case 1:
                str += 'font=p12\n';
                break;
            case 2:
                str += 'font=b12\n';
                break;
            case 3:
                str += 'font=q8\n';
                break;
        }

        if (com.shadow) {
            str += 'shadowed=yes\n';
        }
    }

    if (com.type == 4) {
        if (com.text) {
            str += `text=${com.text}\n`;
        }

        if (com.activeText) {
            str += `activetext=${com.activeText}\n`;
        }
    }

    if (com.type == 1 || com.type == 3 || com.type == 4) {
        if (com.color) {
            str += `colour=0x${com.color.toString(16).toUpperCase().padStart(6, '0')}\n`;
        }
    }

    if (com.type == 3 || com.type == 4) {
        if (com.activeColor) {
            str += `activecolour=0x${com.activeColor.toString(16).toUpperCase().padStart(6, '0')}\n`;
        }

        if (com.hoverColor) {
            str += `overcolour=0x${com.hoverColor.toString(16).toUpperCase().padStart(6, '0')}\n`;
        }
    }

    if (com.type === 5) {
        if (com.image) {
            str += `graphic=${com.image}\n`;
        }

        if (com.activeImage) {
            str += `activegraphic=${com.activeImage}\n`;
        }
    }

    if (com.type === 6) {
        if (com.model) {
            str += `model=model_${com.model}\n`;
        }

        if (com.activeModel) {
            str += `activemodel=model_${com.activeModel}\n`;
        }

        if (com.seqId !== -1) {
            str += `anim=seq_${com.seqId}\n`;
        }

        if (com.activeSeqId !== -1) {
            str += `activeanim=seq_${com.activeSeqId}\n`;
        }

        if (com.modelZoom) {
            str += `zoom=${com.modelZoom}\n`;
        }

        if (com.modelPitch) {
            str += `xan=${com.modelPitch}\n`;
        }

        if (com.modelYaw) {
            str += `yan=${com.modelYaw}\n`;
        }
    }

    if (com.type === 7) {
        if (com.center) {
            str += 'center=yes\n';
        }

        switch (str.font) {
            case 0:
                str += 'font=p11\n';
                break;
            case 1:
                str += 'font=p12\n';
                break;
            case 2:
                str += 'font=b12\n';
                break;
            case 3:
                str += 'font=q8\n';
                break;
        }

        if (com.shadow) {
            str += 'shadowed=yes\n';
        }

        str += `colour=0x${com.color.toString(16).toUpperCase().padStart(6, '0')}\n`;
    }

    if (com.optionType == 2 || com.type == 2) {
        if (com.spellAction) {
            str += `actionverb=${com.spellAction}\n`;
        }

        if (com.spellFlags) {
            let target = [];
            if (com.spellFlags & 0x1) {
                target.push('obj');
            }
            if (com.spellFlags & 0x2) {
                target.push('npc');
            }
            if (com.spellFlags & 0x4) {
                target.push('loc');
            }
            if (com.spellFlags & 0x8) {
                target.push('player');
            }
            if (com.spellFlags & 0x10) {
                target.push('heldobj');
            }

            str += `actiontarget=${target.join(',')}\n`;
        }

        if (com.spellName) {
            str += `action=${com.spellName}\n`;
        }
    }

    if (com.optionType == 1 || com.optionType == 4 || com.optionType == 5 || com.optionType == 6) {
        if (com.option) {
            str += `option=${com.option}\n`;
        }
    }

    if (com.type === 0 && com.childId.length) {
        for (let i = 0; i < com.childId.length; i++) {
            str += '\n';
            str += convert(interfaces[com.childId[i]], com.childX[i], com.childY[i], com.id);
        }
    }

    return str;
}

for (let i = 0; i < interfaces.length; i++) {
    let com = interfaces[i];
    if (!com || com.id !== com.parentId) {
        // only want to iterate over root layers
        continue;
    }

    let name = pack[com.id];
    fs.writeFileSync(`data/src/scripts/_unpack/if/${name}.if`, convert(com));
}
