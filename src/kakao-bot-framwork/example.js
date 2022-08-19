const bot = BotManager.getCurrentBot();
var { COMMANDS, botCommand } = require('command_handler.js');

function onCommand(msg) {
    COMMANDS.register(
        pingCmd
    );
    
    var result = COMMANDS.execute(msg);
    if (result != null) {
        msg.reply(result);
    }
};
bot.setCommandPrefix("/");
bot.addListener(Event.COMMAND, onCommand);

var pingCmd = ping => new botCommand('ping')
    .setDescription('ping command')
    .setActivateRooms(['dev'])
    .setConfigs({ canDM: true, canGroupChat: true })

    .run('pong');