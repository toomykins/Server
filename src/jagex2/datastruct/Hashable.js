import Linkable from '#jagex2/datastruct/Linkable.js';

// A linkable node that can be associated with a key inside Hashtable, LruCache, and Stack
export default class Hashable extends Linkable {
    nextHashable = null;
    prevHashable = null;

    uncache() {
        if (this.prevHashable != null) {
            this.prevHashable.nextHashable = this.nextHashable;
            this.nextHashable.prevHashable = this.prevHashable;
            this.nextHashable = null;
            this.prevHashable = null;
        }
    }
}
