import {} from 'dotenv/config';

import { startWeb } from '#lostcity/web/app.js';

startWeb();

import TcpServer from '#lostcity/server/TcpServer.js';
import WSServer from '#lostcity/server/WSServer.js';

let tcpServer = new TcpServer();
tcpServer.start();

let wsServer = new WSServer();
wsServer.start();
