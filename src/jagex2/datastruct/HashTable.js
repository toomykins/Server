export default class HashTable {
    size = 0;
    nodes = [];

    constructor(size) {
        this.size = size;

        for (let i = 0; i < size; i++) {
            let node = new Linkable();
            node.next = node;
            node.prev = node;
            this.nodes.push(node);
        }
    }

    get(key) {
        let node = this.nodes[key & (this.size - 1)];
        for (let next = node.prev; next != node; next = next.prev) {
            if (next.key === key) {
                return next;
            }
        }
        return null;
    }

    put(key, node) {
        if (node.next != null) {
            node.unlink();
        }

        let ref = this.nodes[key & (this.size - 1)];
        node.next = ref.next;
        node.prev = ref;
        node.next.prev = node;
        node.prev.next = node;
        node.key = key;
    }
}
