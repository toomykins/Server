export default class Constants {
    static config = {};

    static fromDef(src) {
        const lines = src.replaceAll('\r\n', '\n').split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || line.startsWith('//')) {
                continue;
            }

            let [key, value] = line.split('=');
            key = key.trim();
            value = value.trim();

            if (!isNaN(value)) {
                value = parseInt(value);
            }

            Constants.config[key] = value;
        }
    }

    static get(name) {
        if (name[0] === '^') {
            name = name.substring(1);
        }

        return Constants.config[name];
    }
}
