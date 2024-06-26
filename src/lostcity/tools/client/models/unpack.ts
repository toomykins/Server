import fs from 'fs';

import Jagfile from '#jagex2/io/Jagfile.js';
import Packet from '#jagex2/io/Packet.js';
import Model from '#lostcity/tools/client/models/Model.js';

const models = Jagfile.load('dump/client/models');

// ----

{
    Model.unpack(models);

    let pack = '';
    for (let i = 0; i < Model.metadata.length; i++) {
        if (!Model.metadata[i]) {
            continue;
        }

        pack += `${i}=model_${i}\n`;

        const model = Model.get(i);

        if (!model) {
            console.log('missing model', i);
            continue;
        }

        const raw = model.convert();
        raw.save(`dump/src/models/model_${i}.ob2`);
    }

    let order = '';
    for (let i = 0; i < Model.order.length; i++) {
        order += `${Model.order[i]}\n`;
    }

    fs.writeFileSync('dump/pack/model.pack', pack);
    fs.writeFileSync('dump/pack/model.order', order);
}

// ----

{
    if (!fs.existsSync('dump/src/models/base')) {
        fs.mkdirSync('dump/src/models/base', { recursive: true });
    }

    let pack = '';
    let order = '';

    const head = models.read('base_head.dat');
    const type = models.read('base_type.dat');
    const label = models.read('base_label.dat');

    if (!head) {
        throw new Error('missing base_head.dat');
    }

    if (!type) {
        throw new Error('missing base_type.dat');
    }

    if (!label) {
        throw new Error('missing base_label.dat');
    }

    const total = head.g2(); // # to read
    const instances = head.g2(); // highest ID

    for (let i = 0; i < total; i++) {
        // let hstart = head.pos;
        const tstart = type.pos;
        const labelstart = label.pos;

        const id = head.g2();
        order += `${id}\n`;
        pack += `${id}=base_${id}\n`;

        const length = head.g1();
        for (let j = 0; j < length; j++) {
            type.g1();

            const labelCount = label.g1();
            for (let k = 0; k < labelCount; k++) {
                label.g1();
            }
        }

        // let hend = head.pos;
        const tend = type.pos;
        const labelend = label.pos;

        const base = new Packet();
        // base.pdata(head.gdata(hend - hstart, hstart, false));
        base.pdata(type.gdata(tend - tstart, tstart, false));
        base.pdata(label.gdata(labelend - labelstart, labelstart, false));
        // base.p2(hend - hstart);
        base.p2(tend - tstart);
        base.p2(labelend - labelstart);
        base.save(`dump/src/models/base/base_${id}.base`);
    }

    fs.writeFileSync('dump/pack/base.pack', pack);
    fs.writeFileSync('dump/pack/base.order', order);
}

// ----

{
    if (!fs.existsSync('dump/src/models/frame')) {
        fs.mkdirSync('dump/src/models/frame', { recursive: true });
    }

    let pack = '';
    let order = '';

    const head = models.read('frame_head.dat');
    const tran1 = models.read('frame_tran1.dat');
    const tran2 = models.read('frame_tran2.dat');
    const del = models.read('frame_del.dat');

    if (!head) {
        throw new Error('missing frame_head.dat');
    }

    if (!tran1) {
        throw new Error('missing frame_tran1.dat');
    }

    if (!tran2) {
        throw new Error('missing frame_tran2.dat');
    }

    if (!del) {
        throw new Error('missing frame_del.dat');
    }

    const total = head.g2();
    const instances = head.g2();

    for (let i = 0; i < total; i++) {
        const hstart = head.pos;
        const t1start = tran1.pos;
        const t2start = tran2.pos;
        const dstart = del.pos;

        const id = head.g2();
        del.g1();
        head.g2();

        order += `${id}\n`;
        pack += `${id}=anim_${id}\n`;

        const labelCount = head.g1();
        for (let j = 0; j < labelCount; j++) {
            const flags = tran1.g1();
            if (flags === 0) {
                continue;
            }

            if ((flags & 0x1) != 0) {
                tran2.gsmarts();
            }

            if ((flags & 0x2) != 0) {
                tran2.gsmarts();
            }

            if ((flags & 0x4) != 0) {
                tran2.gsmarts();
            }
        }

        const hend = head.pos;
        const t1end = tran1.pos;
        const t2end = tran2.pos;
        const dend = del.pos;

        const frame = new Packet();
        frame.pdata(head.gdata(hend - hstart, hstart, false));
        frame.pdata(tran1.gdata(t1end - t1start, t1start, false));
        frame.pdata(tran2.gdata(t2end - t2start, t2start, false));
        frame.pdata(del.gdata(dend - dstart, dstart, false));
        frame.p2(hend - hstart);
        frame.p2(t1end - t1start);
        frame.p2(t2end - t2start);
        frame.p2(dend - dstart);
        frame.save(`dump/src/models/frame/anim_${id}.frame`);
    }

    fs.writeFileSync('dump/pack/anim.pack', pack);
    fs.writeFileSync('dump/pack/anim.order', order);
}
