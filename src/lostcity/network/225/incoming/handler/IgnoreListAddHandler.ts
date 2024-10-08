import MessageHandler from '#lostcity/network/incoming/handler/MessageHandler.js';
import Player from '#lostcity/entity/Player.js';
import IgnoreListAdd from '#lostcity/network/incoming/model/IgnoreListAdd.js';
import World from '#lostcity/engine/World.js';

export default class IgnoreListAddHandler extends MessageHandler<IgnoreListAdd> {
    handle(message: IgnoreListAdd, player: Player): boolean {
        World.addIgnore(player, message.username);
        return true;
    }
}
