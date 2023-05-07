// A node in a linked list
export default class Linkable {
    key = 0n;
    prev = null;
    next = null;

    unlink() {
        if (this.next != null) {
            this.next.prev = this.prev;
            this.prev.next = this.next;
            this.prev = null;
            this.next = null;
        }
    }
}
