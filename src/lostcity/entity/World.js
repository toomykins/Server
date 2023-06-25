import Player from '#lostcity/entity/Player.js';

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
        let end = Date.now();

        this.currentTick++;
        const nextTick = 600 - (end - start);
        setTimeout(this.cycle.bind(this), nextTick);
    }
}

export default new World();
