import Hashable from '#jagex2/datastruct/Hashable.js';

// A stack (FIFO) of Hashables
export default class Stack {
    head = new Hashable();

    constructor() {
        this.head.prevHashable = this.head;
        this.head.nextHashable = this.head;
    }

    push(node) {
        if (node.prevHashable != null) {
            node.uncache();
        }

        node.prevHashable = this.head.prevHashable;
        node.nextHashable = this.head;
        node.prevHashable.nextHashable = node;
        node.nextHashable.prevHashable = node;
    }

    pop() {
        let node = this.head.nextHashable;
        if (node === this.head) {
            return null;
        }

        node.uncache();
        return node;
    }
}
