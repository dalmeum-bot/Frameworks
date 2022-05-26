const bot = BotManager.getCurrentBot();
var { Container, Message } = require('Mp2');

var container = new Container();
var message = new Message().setPrefix('/');

bot.on(Event.MESSAGE, (msg) => {
    if (msg.room != "Dev") return;

    message.build(msg);

    container.execute(message);
});

function ping () {
    message.reply("pong");
}
container.register(ping);