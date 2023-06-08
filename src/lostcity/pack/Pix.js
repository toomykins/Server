export function generatePixelOrder(img) {
    let rowMajorScore = 0;
    let columnMajorScore = 0;

    // calculate row-major score
    let prev = 0;
    for (let j = 0; j < img.bitmap.width * img.bitmap.height; j += 4) {
        let pos = j * 4;
        let current = img.bitmap.data[pos + 0] << 16 | img.bitmap.data[pos + 1] << 8 | img.bitmap.data[pos + 2];
        rowMajorScore += current - prev;
        prev = current;
    }

    // calculate column-major score
    prev = 0;
    for (let x = 0; x < img.bitmap.width; x++) {
        for (let y = 0; y < img.bitmap.height; y++) {
            let pos = (x + (y * img.bitmap.width)) * 4;
            let current = img.bitmap.data[pos + 0] << 16 | img.bitmap.data[pos + 1] << 8 | img.bitmap.data[pos + 2];
            columnMajorScore += current - prev;
            prev = current;
        }
    }

    return columnMajorScore < rowMajorScore ? 0 : 1;
}

export function writeImage(img, data, index, colors) {
    // TODO: read pixels to find the first non-transparent rgb on each axis, so the image can be shifted to begin at 0,0
    let cropX = 0;
    let cropY = 0;
    index.p1(cropX);
    index.p1(cropY);

    index.p2(img.bitmap.width);
    index.p2(img.bitmap.height);

    let pixelOrder = generatePixelOrder(img);
    index.p1(pixelOrder);
    // console.log('\t', pixelOrder ? 'vertical' : 'horizontal');

    if (pixelOrder === 0) {
        for (let j = 0; j < img.bitmap.width * img.bitmap.height; j++) {
            let pos = j * 4;
            let rgb = (img.bitmap.data[pos + 0] << 24 | img.bitmap.data[pos + 1] << 16 | img.bitmap.data[pos + 2] << 8 | img.bitmap.data[pos + 3]) >>> 0;

            let index = colors.indexOf(rgb);
            if (index === -1) {
                console.error('color not found in palette');
                break;
            }

            data.p1(index);
        }
    } else if (pixelOrder === 1) {
        for (let x = 0; x < img.bitmap.width; x++) {
            for (let y = 0; y < img.bitmap.height; y++) {
                let pos = (x + (y * img.bitmap.width)) * 4;
                let rgb = (img.bitmap.data[pos + 0] << 24 | img.bitmap.data[pos + 1] << 16 | img.bitmap.data[pos + 2] << 8 | img.bitmap.data[pos + 3]) >>> 0;

                let index = colors.indexOf(rgb);
                if (index === -1) {
                    console.error('color not found in palette', rgb.toString(16));
                    break;
                }

                data.p1(index);
            }
        }
    }
}
