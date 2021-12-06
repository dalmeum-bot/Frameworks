const bot = BotManager.getCurrentBot();
const { CommandHandler, Message } = require('interaction');

const commandhandler = new CommandHandler();

commandhandler.register(command => command
  .setName('날짜계산')
  .setDescription("입력한 두 날짜의 사잇날을 구합니다.")
  .setRoom(["그리즈만미술교육"])
  .setStaffOnly(false)
  .setCanDM(false)
  .setCanGroupChat(true)

  .addArgument(/(\d{2,4})\/(\d{1,2})\/(\d{1,2})/, arg => arg
    .addArgument('n.4/n.2/n.2', arg2 => arg2
      // args: [{content: '2019.1.3', group: ['2019', '1', '3']}]
      .execute((message, args) => ((new Date(args[1].content)).getTime() - (new Date(args[0].content)).getTime()) / 1000 * 3600 * 24)
    )
    .missing('도착 날짜를 입력해주세요.')
  )
  .missing("출발 날짜를 입력해주세요.")
);

commandhandler.register(command => command
  .setName(['도움말', '?'])

  // ?인자(있어도 되고 없어도 되는 인자)는 아래와 같은 방법으로 작성 가능
  .addArgument(String, arg => arg
    .execute((message, args) => commandhandler.arrange(args[0].content))
  )
  .missing(commandhandler.arrange())
);

commandhandler.set({
  commandsDir: 'msgbot/commands'
});

function onMessage(msg) {
  const message = new Message()
    .isStaff(msg => msg.name.startsWith("[운영진]")
                    && JSON.parse(Filestream.read("msgbot/Datas/admins.json"))[msg.name] == msg.author.getBase64())
    .setCommandPrefix('/', true)
    .build(msg);

  if (message.isCommand()) {
    for (let i in java.io.file("msgbot/Datas/admins.json").listFile()) {
      if (i.name() == message.command) {
        commandhandler.execute();
        break;
      }
    }
  }
}

function onCommand(msg, message) {
  var result = commandhandler.execute(message);

  if (result instanceof CommandArgsError) {
    Log.info(result.name + '\n' + result.message);
  }
  else if (result instanceof Error) {
    Log.error(result.name + '\n' + result.message);
  }
  else {
    msg.reply(result);
  }
}

bot.addListener(Event.MESSAGE, onMessage);