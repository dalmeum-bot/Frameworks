var msg = {
  content: "shrug 으쓱",
  room: "그리즈만",

};

var theme = {
  options: ['[', ']'],
  required: ['<', '>']
};

function Command() {
  this.form;
  this.description;
};

Command.prototype = {
  register : (usage) => RegExp(usage.replace(RegExp(`${theme.required[0]}.*?${theme.required[1]}`), '(\\S+)').replace(RegExp(`${theme.options[0]}.*?${theme.options[1]}`), '(\\S+)?'), 'g'),
  when : (func) => 
}

Command.register("shrug <text> [text2]").when((text, text2) => "¯\_(ツ)_/¯ " + text + " " + text2);