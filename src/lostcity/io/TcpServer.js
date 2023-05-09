import net from 'net';

// raw TCP server
export default class TcpServer {
    port = 43594;
    server = null;
    onStart = null;
    onConnect = null;

    constructor(port = 43594, onStart = null, onConnect = null) {
        this.port = port;
        this.onStart = onStart;
        this.onConnect = onConnect;
    }

    start() {
        this.server = net.createServer(onConnect);
        this.server.listen({ port: this.port }, this.onStart);
    }
}
