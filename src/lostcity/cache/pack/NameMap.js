import fs from 'fs';

export function loadOrder(path) {
    return fs.readFileSync(path, 'ascii').replace(/\r/g, '').split('\n').filter(x => x.length);
}

export function loadPack(path) {
    return fs.readFileSync(path, 'ascii').replace(/\r/g, '').split('\n').filter(x => x.length).reduce((acc, x) => {
        let [id, name] = x.split('=');
        acc[id] = name;
        return acc;
    }, []);
}
