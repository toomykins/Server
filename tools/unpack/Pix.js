import Jimp from 'jimp';

export default class Pix {
    // shared
    palette = [ 0 ];

    // per image
    pixels = [];
    width = 0;
    height = 0;
    cropX = 0;
    cropY = 0;
    cropW = 0;
    cropH = 0;

    static count(jag, name) {
        let data = jag.read(`${name}.dat`);
        let index = jag.read('index.dat');

        index.pos = data.g2();

        index.g2();
        index.g2();

        let paletteCount = index.g1();
        for (let i = 0; i < paletteCount - 1; i++) {
            index.g3();
        }

        let count = 0;
        while (index.pos < index.length && data.available > 0) {
            index.pos += 2; // cropX, cropY
            data.pos += index.g2() * index.g2(); // width * height
            index.pos += 1; // pixelOrder
            count++;
        }

        return count;
    }

    constructor(jag, name, id = 0) {
        let data = jag.read(`${name}.dat`);
        let index = jag.read('index.dat');

        index.pos = data.g2();

        this.cropW = index.g2();
        this.cropH = index.g2();

        let paletteCount = index.g1();
        for (let i = 0; i < paletteCount - 1; i++) {
            this.palette[i + 1] = index.g3();

            if (this.palette[i + 1] === 0) {
                this.palette[i + 1] = 1;
            }
        }

        for (let i = 0; i < id; i++) {
            index.pos += 2; // cropX, cropY
            data.pos += index.g2() * index.g2(); // width * height
            index.pos += 1; // pixelOrder
        }

        this.cropX = index.g1();
        this.cropY = index.g1();
        this.width = index.g2();
        this.height = index.g2();
        let pixelOrder = index.g1();

        if (pixelOrder === 0) {
            for (let i = 0; i < this.width * this.height; i++) {
                this.pixels[i] = data.g1();
            }
        } else {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    this.pixels[x + y * this.width] = data.g1();
                }
            }
        }
    }

    async toPng() {
        let image = new Jimp(this.width, this.height, 0x00000000);

        for (let i = 0; i < this.width * this.height; i++) {
            let color = this.palette[this.pixels[i]];

            if (color !== 0) {
                // make opaque
                color <<= 8;
                color |= 0xFF;
            }

            color >>>= 0;
            image.setPixelColor(color, i % this.width, Math.floor(i / this.width));
        }

        return image.getBufferAsync(Jimp.MIME_PNG);
    }
}
