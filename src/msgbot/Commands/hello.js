// ANCHOR msgbot/Commands/example.js
const { CommandHandler } = require('API2_MessageProcessor');
var commandhandler = new CommandHandler();

commandhandler.register(command => command
  .setName('안녕')
  .setDescription("인사합니다.")
  .setUsage('/인사 <따라할 말>')
  .setStaffOnly(false)
  .setCanDM(true)
  .setCanGroupChat(true)

  .addArgument(String, arg => arg
    .execute((_, args) => "안녕 " + args[0].content)
  )
  .missing("안녕 ㅋ")
);

module.exports = commandhandler.commands;