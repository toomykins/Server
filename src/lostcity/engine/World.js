import Isaac from '#jagex2/io/Isaac.js';
import Player from '#lostcity/entity/Player.js';
import { ClientProtLengths } from '#lostcity/server/ClientProt.js';

class World {
    members = typeof process.env.MEMBERS_WORLD !== 'undefined' ? true : false;
    currentTick = 0;

    players = [];
    npcs = [];
    zones = [];

    start() {
        this.cycle();
    }

    cycle() {
        let start = Date.now();

        // world processing

        // client input
        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i]) {
                continue;
            }

            let player = this.players[i];
            player.decodeIn();
        }

        // npc scripts
        for (let i = 0; i < this.npcs.length; i++) {
            if (!this.npcs[i]) {
                continue;
            }
        }

        // player scripts
        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i]) {
                continue;
            }
        }

        // client output
        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i]) {
                continue;
            }

            let player = this.players[i];
            player.load_area();
            player.player_info();
            // player.npc_info();

            player.encodeOut();
        }

        let end = Date.now();

        this.currentTick++;
        const nextTick = 600 - (end - start);
        setTimeout(this.cycle.bind(this), nextTick);
    }

    // ----

    readIn(socket, stream) {
        while (stream.available > 0) {
            let start = stream.pos;
            let opcode = stream.g1();

            if (socket.decryptor) {
                opcode = (opcode - socket.decryptor.nextInt()) & 0xFF;
                stream.data[start] = opcode;
            }

            let length = ClientProtLengths[opcode];
            if (typeof length === 'undefined') {
                socket.state = -1;
                socket.kill();
                return;
            }

            if (length === -1) {
                length = stream.g1();
            } else if (length === -2) {
                length = stream.g2();
            }

            if (stream.available < length) {
                break;
            }

            stream.pos += length;

            socket.inCount[opcode]++;
            if (socket.inCount[opcode] > 10) {
                continue;
            }

            socket.in.set(stream.gdata(stream.pos - start, start, false), socket.inOffset);
            socket.inOffset += stream.pos - start;
        }
    }

    addPlayer(player) {
        this.players.pid = this.players.length;
        this.players.push(player);
    }

    getPlayerBySocket(socket) {
        return this.players.find((p) => p.client === socket);
    }

    removePlayer(player) {
        this.players[player.pid] = null;
    }

    removePlayerBySocket(socket) {
        let player = this.getPlayerBySocket(socket);
        if (player) {
            this.removePlayer(player);
        }
    }
}

export default new World();
