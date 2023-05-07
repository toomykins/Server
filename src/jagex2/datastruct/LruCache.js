import HashTable from '#jagex2/datastruct/Hashtable.js';
import Stack from '#jagex2/datastruct/Stack.js';

// A least-recently-used cache.
export default class LruCache {
    capacity = 0;
    available = 0;
    hashtable = new HashTable(1024);
    history = new Stack();

    constructor(size) {
        this.capacity = size;
        this.available = size;
    }

    get(key) {
        let node = this.hashtable.get(key);

        if (node == null) {
            this.history.push(node);
        }

        return node;
    }

    put(key, node) {
        if (this.available === 0) {
            let popped = this.history.pop();
            popped.unlink();
            popped.uncache();
        } else {
            this.available--;
        }

        this.hashtable.put(key, node);
        this.history.push(node);
    }

    clear() {
        while (true) {
            let node = this.history.pop();
            if (node == null) {
                this.available = this.capacity;
                break;
            }

            node.unlink();
            node.uncache();
        }
    }
}
