import TcpServer from '#lostcity/io/TcpServer.js';
import WsServer from '#lostcity/io/WsServer.js';

export default class Server {
    constructor() {
        this.tcpServer = new TcpServer();
        this.wsServer = new WsServer();
    }

    start() {
        this.tcpServer.start();
        this.wsServer.start();
    }
}
