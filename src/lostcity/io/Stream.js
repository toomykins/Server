import Packet from '#jagex2/io/Packet.js';

export default class Stream {
    socket = null;
    webSocket = false;

    get isWebSocket() {
        return this.webSocket;
    }

    state = 0; // application-controlled state
    remoteAddress = '';

    in = Packet.alloc(2);
    out = Packet.alloc(2);

    // metrics
    totalBytesRead = 0;
    totalBytesWritten = 0;

    constructor(socket, remoteAddress = '', isWebSocket = false) {
        this.socket = socket;
        this.remoteAddress = remoteAddress;
        this.webSocket = isWebSocket;
    }

    // ----

    send(data) {
        this.totalBytesWritten += data.length;

        if (this.webSocket) {
            this.socket.send(data);
        } else {
            this.socket.write(data);
        }
    }

    // gracefully close (ACK)
    close() {
        // timeout so there's time to flush any remaining data
        setTimeout(() => {
            if (this.webSocket) {
                this.socket.close();
            } else {
                this.socket.end();
            }
        }, 10);
    }

    // immediately close (no ACK)
    terminate() {
        if (this.webSocket) {
            this.socket.terminate();
        } else {
            this.socket.destroy();
        }
    }

    // node callback
    readRaw(data) {
        this.totalBytesRead += data.length;
        this.in.pdata(data);
    }

    // ----

    setEncryptor(encryptor) {
        this.out.encryptor = encryptor;
    }

    p1isaac(opcode) {
        this.out.p1isaac(opcode);
    }

    setDecryptor(decryptor) {
        this.in.decryptor = decryptor;
    }

    g1isaac() {
        return this.in.g1isaac();
    }

    gdata(len) {
        return this.in.gdata(len);
    }
}
