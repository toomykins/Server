import Linkable from '#jagex2/datastruct/Linkable.js';

// A doubly-linked list of Linkable objects
export default class LinkList {
    head = new Linkable();
    peeked = null;

    constructor() {
        this.head.prev = this.head;
        this.head.next = this.head;
    }

    pushBack(node) {
        if (node.next != null) {
            node.unlink();
        }

        node.next = this.head.next;
        node.prev = this.head;
        node.next.prev = node;
        node.prev.next = node;
    }

    pushFront(node) {
        if (node.next != null) {
            node.unlink();
        }

        node.next = this.head;
        node.prev = this.head.prev;
        node.next.prev = node;
        node.prev.next = node;
    }

    pollFront() {
        let node = this.head.prev;
        if (node === this.head) {
            return null;
        }

        node.unlink();
        return node;
    }

    peekFront() {
        let node = this.head.prev;
        if (node === this.head) {
            this.peeked = null;
            return null;
        }

        this.peeked = node.prev;
        return node;
    }

    peekBack() {
        let node = this.head.next;
        if (node === this.head) {
            this.peeked = null;
            return null;
        }

        this.peeked = node.next;
        return node;
    }

    prev() {
        let node = this.peeked;
        if (node === this.head) {
            this.peeked = null;
            return null;
        }

        this.peeked = node.prev;
        return node;
    }

    next() {
        let node = this.peeked;
        if (node === this.head) {
            this.peeked = null;
            return null;
        }

        this.peeked = node.next;
        return node;
    }

    clear() {
        while (true) {
            let node = this.head.prev;
            if (node === this.head) {
                return;
            }

            node.unlink();
        }
    }
}
