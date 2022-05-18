const bot = BotManager.getCurrentBot();
var { COMMANDS, botCommand } = require('command_handler.js');

function onCommand(msg) {
    COMMANDS.register(Commands);
    
    var result = COMMANDS.execute(msg);
    if (result != null) 
        msg.reply(result);
};
bot.setCommandPrefix("/");
bot.addListener(Event.COMMAND, onCommand);

const Commands = [
    pluscmd => new botCommand('plus', 'add', '+')
        .setDescription('add numbers')
        .setConfigs({ activateRooms: ['dev'] })

        .addArguments(e => /^-?\d+$/.test(e), numbers => new botCommand()
            .run(msg => numbers.map(Number).reduce((acc, curr) => acc + curr))
        )
        .run('at least one argument'),
    
    ping => new botCommand('ping')
        .setDescription('ping command')
        .setConfigs({ activateRooms: ['dev'], canDM: true, canGroupChat: true })

        .run('pong')
];