import Jimp from 'jimp';

export function pixSize(dat, idx) {
    dat.pos = 0;
    idx.pos = dat.g2();

    let width = idx.g2();
    let height = idx.g2();

    return { width, height };
}

export function countPix(dat, idx) {
    dat.pos = 0;
    idx.pos = dat.g2();

    if (idx.pos > idx.length) {
        // console.error('not pix encoding');
        return 0;
    }

    let cropW = idx.g2();
    let cropH = idx.g2();

    let paletteCount = idx.g1();
    for (let i = 0; i < paletteCount - 1; i++) {
        idx.g3();
    }

    let count = 0;
    for (let i = 0; i < 100; i++) {
        if (dat.available <= 0) {
            break;
        }

        let cropX = idx.g1();
        let cropY = idx.g1();
        if (cropX > cropW || cropY > cropH) {
            // console.error('invalid crop');
            break;
        }

        let width = idx.g2();
        let height = idx.g2();
        if (width === 0 || height === 0 || width > (cropW - cropX) || height > (cropH - cropY)) {
            // console.error('invalid size');
            break;
        }

        dat.pos += width * height;
        if (dat.pos > dat.length) {
            // console.error('out of bounds');
            break;
        }

        let pixelOrder = idx.g1();
        if (pixelOrder > 1) {
            // console.error('invalid order');
            break;
        }

        count++;
    }

    return count;
}

export function unpackPix(dat, idx, id = 0) {
    dat.pos = 0;
    idx.pos = dat.g2();

    let cropW = idx.g2();
    let cropH = idx.g2();

    let paletteCount = idx.g1();
    let palette = [ 0 ];
    for (let i = 0; i < paletteCount - 1; i++) {
        palette[i + 1] = idx.g3();

        if (palette[i + 1] === 0) {
            palette[i + 1] = 1;
        }
    }

    for (let i = 0; i < id; i++) {
        idx.pos += 2;
        dat.pos += idx.g2() * idx.g2();
        idx.pos++;
    }

    let cropX = idx.g1();
    let cropY = idx.g1();
    let width = idx.g2();
    let height = idx.g2();

    let img = new Jimp(width, height);
    img.background(0xFFFFFFFF);

    let pixelOrder = idx.g1();
    if (pixelOrder === 0) {
        for (let i = 0; i < width * height; i++) {
            let pixel = palette[dat.g1()];
            if (pixel === 0) {
                continue;
            } else if (pixel === 1) {
                pixel = 0; // restore black colors
            }

            img.bitmap.data[i * 4 + 0] = (pixel >> 16) & 0xff;
            img.bitmap.data[i * 4 + 1] = (pixel >> 8) & 0xff;
            img.bitmap.data[i * 4 + 2] = pixel & 0xff;
            img.bitmap.data[i * 4 + 3] = 0xFF;
        }
    } else if (pixelOrder === 1) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let pixel = palette[dat.g1()];
                if (pixel === 0) {
                    continue;
                } else if (pixel === 1) {
                    pixel = 0; // restore black colors
                }

                img.bitmap.data[(x + (y * width)) * 4 + 0] = (pixel >> 16) & 0xff;
                img.bitmap.data[(x + (y * width)) * 4 + 1] = (pixel >> 8) & 0xff;
                img.bitmap.data[(x + (y * width)) * 4 + 2] = pixel & 0xff;
                img.bitmap.data[(x + (y * width)) * 4 + 3] = 0xFF;
            }
        }
    }

    return { img, cropX, cropY, pixelOrder };
}
