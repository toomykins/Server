// Jagex String helper functions
export default class JString {
    static builder = new Int8Array(12);
    static BASE37_TABLE = [ '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];

    static toBase37(str) {
        let enc = 0n;

        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            enc *= 37n;

            if (char >= 'A'.charCodeAt(0) && char <= 'Z'.charCodeAt(0)) {
                enc += BigInt(char) + 1n - 65n; // 'A'
            } else if (char >= 'a'.charCodeAt(0) && char <= 'z'.charCodeAt(0)) {
                enc += BigInt(char) + 1n - 97n; // 'a'
            } else if (char >= '0'.charCodeAt(0) && char <= '9'.charCodeAt(0)) {
                enc += BigInt(char) + 27n - 48n; // '0'
            }
        }

        while (enc % 37n === 0n && enc !== 0n) {
            enc /= 37n;
        }

        return enc;
    }

    static fromBase37(enc) {
        if (enc <= 0 || enc >= 6582952005840035281n) {
            return 'invalid_name';
        }

        if (enc % 37n === 0) {
            return 'invalid_name';
        }

        let length = 0;
        while (enc !== 0n) {
            let temp = enc;
            enc /= 37n;
            JString.builder[11 - length++] = JString.BASE37_TABLE[Number(temp - enc * 37n)].charCodeAt(0);
        }
        return Buffer.from(JString.builder.subarray(12 - length)).toString();
    }

    static hashCode(str) {
        str = str.toUpperCase();
        let hash = 0n;
        for (let i = 0; i < str.length; i++) {
            hash = hash * 61n + BigInt(str.charCodeAt(i)) - 32n;
            hash = hash + (hash >> 56n) & 0xFFFFFFFFFFFFFFn;
        }
        return hash;
    }

    static formatIPv4(ip) {
        return `${ip >> 24 & 0xff}.${ip >> 16 & 0xff}.${ip >> 8 & 0xff}.${ip & 0xff}`;
    }

    static formatName(str) {

    }

    static toSentenceCase(str) {

    }

    static toAsterisks(str) {
        let temp = '';
        for (let i = 0; i < str.length; i++) {
            temp += '*';
        }
        return temp;
    }
};
