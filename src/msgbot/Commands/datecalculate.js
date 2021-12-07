// ANCHOR msgbot/Commands/example.js
const { CommandHandler } = require('/sdcard/global_modules/CommandHandler');
var commandhandler = new CommandHandler();

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

module.exports = commandhandler.commands;