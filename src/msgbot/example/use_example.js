const bot = BotManager.getCurrentBot();
const MessageProcessor = require('API2_MessageProcessor');

var commandhandler = new MessageProcessor.CommandHandler();
commandhandler.set({
  commandsDir: 'msgbot/Commands'
});

function onCommand(msg) {
  var message = new MessageProcessor.Message(msg)
    .setStaff(msg => msg.author.name == '합동')
    .setCommandPrefix('/', true)
    .build();

  if (message.isCommand()) {
    var result = commandhandler.execute(message);

    if (typeof result == 'CommandArgsError') {
      Log.info(result.name + '\n' + result.message);
    }
    else if (typeof result == 'Error') {
      Log.error(result.name + '\n' + result.message);
    }
    else {
      msg.reply(result);
    }
  }
}
bot.addListener(Event.COMMAND, onCommand);