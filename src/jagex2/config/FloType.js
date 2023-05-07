import Packet from '#jagex2/io/Packet.js';

// Floor definitions
export default class FloType {
    static count = 0;
    static instances = [];

    rgb = 0;
    texture = -1;
    code3 = false;
    occlude = true;
    editName = '';

    hue = 0;
    saturation = 0;
    lightness = 0;
    chroma = 0;
    luminance = 0;
    hsl = 0;

    static unpack(config) {
        let dat = new Packet(config.read('flo.dat'));
        FloType.count = dat.g2();

        for (let i = 0; i < FloType.count; i++) {
            FloType.instances[i] = new FloType();
            FloType.instances[i].decode(dat);
        }
    }

    decode(dat) {
        while (true) {
            let code = dat.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
                this.rgb = dat.g3();
                this.setColor(this.rgb);
            } else if (code === 2) {
                this.texture = dat.g1();
            } else if (code === 3) {
                this.code3 = true;
            } else if (code === 5) {
                this.occlude = false;
            } else if (code === 6) {
                this.editName = dat.gstr();
            } else {
                console.log(`Error unrecognized flo config code ${code}`);
            }
        }
    }

    setColor(rgb) {
        let red = ((rgb >> 16) & 0xFF) / 256;
        let green = ((rgb >> 8) & 0xFF) / 256;
        let blue = (rgb & 0xFF) / 256;

        let min = Math.min(red, green, blue);
        let max = Math.max(red, green, blue);

        let h = 0;
        let s = 0;
        let l = (min + max) / 2;

        if (min !== max) {
            if (l < 0.5) {
                s = (max - min) / (max + min);
            } else if (l >= 0.5) {
                s = (max - min) / (2 - max - min);
            }

            if (red === max) {
                h = (green - blue) / (max - min);
            } else if (green === max) {
                h = 2 + (blue - red) / (max - min);
            } else if (blue === max) {
                h = 4 + (red - green) / (max - min);
            }
        }

        h /= 6;

        this.hue = Math.floor(h * 256);
        this.saturation = Math.floor(s * 256);
        this.lightness = Math.floor(l * 256);

        if (this.saturation < 0) {
            this.saturation = 0;
        } else if (this.saturation > 255) {
            this.saturation = 255;
        }

        if (this.lightness < 0) {
            this.lightness = 0;
        } else if (this.lightness > 255) {
            this.lightness = 255;
        }

        if (l > 0.5) {
            this.luminance = Math.floor((1 - l) * s * 512);
        } else {
            this.luminance = Math.floor(l * s * 512);
        }

        if (this.luminance < 1) {
            this.luminance = 1;
        }

        this.chroma = Math.floor(h * this.luminance);

        let hue = this.hue + (Math.random() * 16) - 8;
        if (hue < 0) {
            hue = 0;
        } else if (hue > 255) {
            hue = 255;
        }

        let saturation = this.saturation + (Math.random() * 48) - 24;
        if (saturation < 0) {
            saturation = 0;
        } else if (saturation > 255) {
            saturation = 255;
        }

        let lightness = this.lightness + (Math.random() * 48) - 24;
        if (lightness < 0) {
            lightness = 0;
        } else if (lightness > 255) {
            lightness = 255;
        }

        this.hsl = this.hsl24to16(hue, saturation, lightness);
    }

    hsl24to16(hue, saturation, lightness) {
        if (lightness > 179) {
            saturation /= 2;
        }

        if (lightness > 192) {
            saturation /= 2;
        }

        if (lightness > 217) {
            saturation /= 2;
        }

        if (lightness > 243) {
            saturation /= 2;
        }

        return Math.floor(((hue / 4) << 10) + ((saturation / 32) << 7) + (lightness / 2));
    }
}
