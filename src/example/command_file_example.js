// ANCHOR msgbot/Commands/example.js

var command = cmd => cmd
  .setName(["도움말", "명령어", "?"])
  .setDescription("명령어를 보여줍니다.")
  .setRoom(["그리즈만미술교육"])


module.exports = command;