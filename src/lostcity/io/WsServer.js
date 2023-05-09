import { WebSocketServer } from 'ws';

// websocket server
export default class WsServer {
    port = 43595;
    server = null;
    onStart = null;
    onConnect = null;

    constructor(port = 43595, onStart = null, onConnect = null) {
        this.port = port;
        this.onStart = onStart;
        this.onConnect = onConnect;
    }

    start() {
        this.server = new WebSocketServer({ port: this.port }, this.onStart);
        this.server.on('connection', this.onConnect);
    }
}
