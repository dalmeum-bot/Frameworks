function CommandArgsError (message) {
  this.name = "CommandArgsError";
  this.message = message;
}
CommandArgsError.prototype = Error.prototype;

/**
 * @Class Command: 명령어를 구성하는 가장 작은 단위 명령어입니다.
 * 
 * @name {Array<String|RegExp>} 명령어 이름 
 * @description {String} 명령어 설명
 * @usage {String} 명령어 형태
 * @room {Array<String>} 명령어를 실행시킬 방들
 * @staffOnly {Boolean} 관리자 전용 명령어 여부
 * @canDM {Boolean} 갠챗으로 실행 가능한 명령어 여부
 * @canGroupChat {Boolean} 그룹챗으로 실행 가능한 명령어 여부
 * @arguments {Array<Command>} 하위 명령어 모음
 */
function Command () {
  this.name = new Array();
  this.description = new String();
  this.usage = new String();
  this.room = new Array();
  this.staffOnly = new Boolean();
  this.canDM = new Boolean();
  this.canGroupChat = new Boolean();
  this.arguments = new Array();
}

/** * @param {String | RegExp} name */
Command.prototype.setName = function (name) {
  if (!(typeof name == 'string' || name.constructor.name == 'RegExp')) {
    throw new TypeError("setName(name: String | RegExp)이나, 입력하신 인자의 타입은 " + JSON.stringify(name) + "(" + name.constructor.name + ")입니다.");
  }

  this.name = name;
  if (typeof this.name == 'string') this.name = [this.name];

  return this;
}

/** * @param {String} description */
Command.prototype.setDescription = function (description) {
  if (!(typeof description == 'string')) {
    throw new TypeError("setDescription(description: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(description) + "(" + description.constructor.name + ")입니다.");
  }

  this.description = description;

  return this;
}

/** * @param {String} usage */
Command.prototype.setUsage = function (usage) {
  if (!(typeof usage == 'string')) {
    throw new TypeError("setUsage(description: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(usage) + "(" + usage.constructor.name + ")입니다.");
  }

  this.usage = usage;

  return this;
}

/** * @param {Array<String>} room */
Command.prototype.setRoom = function (room) {
  if (!(room.constructor.name == 'Array')) {
    throw new TypeError("setRoom(room: Array)이나, 입력하신 인자의 타입은 " + JSON.stringify(room) + "(" + room.constructor.name + ")입니다.");
  }
  room.every((e, i) => {
    if (typeof e == 'string') return true;
    else throw new TypeError("setRoom(room: Array<String>)이나, input["+i+"] == "+JSON.stringify(e)+" 는 문자열이 아닙니다.");
  });

  this.room = room;

  return this;
}

/** * @param {Boolean} staffOnly */
Command.prototype.setStaffOnly = function (staffOnly) {
  if (!(typeof staffOnly == 'boolean')) {
    throw new TypeError("setStaffOnly(staffOnly: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(staffOnly) + "(" + staffOnly.constructor.name + ")입니다.");
  }

  this.staffOnly = staffOnly;

  return this;
}

/** * @param {Boolean} canDM */
Command.prototype.setCanDM = function (canDM) {
  if (!(typeof canDM == 'boolean')) {
    throw new TypeError("setCanDM(canDM: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(canDM) + "(" + canDM.constructor.name + ")입니다.");
  }

  this.canDM = canDM;

  return this;
}

/** * @param {Boolean} canGroupChat */
Command.prototype.setCanGroupChat = function (canGroupChat) {
  if (!(typeof canGroupChat == 'boolean')) {
    throw new TypeError("setCanGroupChat(canGroupChat: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(canGroupChat) + "(" + canGroupChat.constructor.name + ")입니다.");
  }

  this.canGroupChat = canGroupChat;

  return this;
}

/**
 * @addArgument 하위 명령어를 추가합니다.
 * @param {String | RegExp} name 
 * @param {Object | Command} func 
 */
Command.prototype.addArgument = function (name, func) {
  const inthis = func(new Command()
    .setDescription(this.description)
    .setUsage(this.usage)
    .setRoom(this.room)
    .setStaffOnly(this.staffOnly)
    .setCanDM(this.canDM)
    .setCanGroupChat(this.canGroupChat)
  ).setName((typeof name == 'function') ? name : name.toString());

  this.arguments.push(inthis);

  return this;
}

/**
 * @missing 인자가 없을 때 실행됨
 * @param {Any} item 
 */
Command.prototype.missing = function (item) {
  this.arguments.push({ name: 'missing', func: item, type: item.constructor.name });

  return this;
}

/**
 * @execute call할 때 실행됨
 * @param {Any} item 
 */
Command.prototype.execute = function (item) {
  this.arguments.push({ name: 'execute', func: item, type: item.constructor.name });

  return this;
}

// Message
function Message (msg) {
  this.originalMsgObject = msg;

  this.prefix = '/';
  this.useMentionAsPrefix = false;

  this.data = '';
  this.content = '';
  this.args = [];
  this.command = '';
  
  this.isMention = false;
  this.timestamp = Date.now();

  this.room = {
    name: '',
    isGroupChat: false,
    isDebugRoom: false,
    isDM: true
  };

  this.author = {
    name: '',
    pfHashCode: 0,
    isStaff: false
  };
}

Message.prototype = {
  setStaff(func) {
    this.author.isStaff = Boolean(func(msg));

    return this;
  },

  setCommandPrefix(prefix, useMentionAsPrefix) {
    this.prefix = prefix;
    this.useMentionAsPrefix = Boolean(useMentionAsPrefix);

    return this;
  },

  build() {
    this.isMention = this.originalMsgObject.isMention;

    this.data = this.originalMsgObject.content;
    this.content = (msg.content.startsWith('[나를 멘션] @')) ? this.originalMsgObject.content.replace(/\[나를 멘션\] @\w+/, '') : this.originalMsgObject.content.replace(this.prefix, '')
    this.args = this.content.split(/\\n| /);
    this.command = this.args[0];
    this.args = this.args.slice(1);

    this.room = {
      name: this.originalMsgObject.room,
      isGroupChat: this.originalMsgObject.isGroupChat,
      isDebugRoom: this.originalMsgObject.isDebugRoom,
      isDM: !this.originalMsgObject.isGroupChat && !this.originalMsgObject.isDebugRoom
    };

    this.author = {
      name: this.originalMsgObject.author.name,
      pfHashCode: Security.hashCode(this.originalMsgObject.author.getBase64()),
      isStaff: this.author.isStaff || false
    };

    return this;
  },

  isCommand() {
    if (this.useMentionAsPrefix && this.data.startsWith('[나를 멘션] @'))
      return true;
    else if (this.data.startsWith(this.prefix))
      return true;
    else
      return false;
  }
}

// CommandHandler
function CommandHandler () {
  this.commands = [];
  this.commandsDir = '';
}

CommandHandler.prototype = {
  set(obj) {
    this.commandsDir = obj.commandsDir || '';

    var dir = new java.io.File("/sdcard/" + this.commandsDir);
    dir.listFiles().forEach(command => {
      var r = require(command);
      this.commands.push(r);
    });
  },

  register(func) {
    this.commands.push(func(new Command()));
  },

  execute(message) {
    if (!message.isCommand()) return; // command 아니면 나가

    let room = [],
        staffOnly = false,
        canDM = false,
        canGroupChat = true,
        argindex = 0,
        command = null,
        incommand = command,
        chosen,
        argList = [];

    this.commands.forEach(cmd => command = (cmd.name.includes(message.command)) ? cmd : null);
    if (command == null) return;  // 해당 command 없으면 나가

    while (incommand.name != 'execute' || incommand.name != 'missing') {
      description = incommand.description;
      room = incommand.room;
      staffOnly = incommand.staffOnly;
      canDM = incommand.canDM;
      canGroupChat = incommand.canGroupChat;

      if (room.length != 0 && !room.includes(message.room.name)) return;  // 해당 방 아니면 나가
      if (staffOnly == true && message.author.isStaff == false) return; // staffOnly에 안 맞으면 나가
      if (canDM == false && message.room.isDM == true) return;  // canDM에 안 맞으면 나가
      if (canGroupChat == false && message.room.isGroupChat == true) return;  // canGroupChat에 안 맞으면 나가

      // name check (regex | string)
      var m;
      chosen = incommand.arguments.find(e => {
        if (typeof e.name == 'string') {
          return e.name === message.args[argindex];
        }
        else {
          m = message.args[argindex].match(e.name);
          return m.length != 0;
        }
      });
      if (chosen != undefined) {
        incommand = chosen;
        argList.push({
          content: message.args[argindex],
          group: (typeof e.name == 'string') ? [] : m.slice(1)
        });
        argindex++;
        continue;
      }
      
      // type check
      chosen = incommand.arguments.find(e => typeof e.name == 'Function' && e.name(message.args[argindex]).constructor == e.name);
      if (chosen != undefined) {
        incommand = chosen;
        argList.push({
          content: message.args[argindex],
          group: []
        });
        argindex++;
        continue;
      }

      // missing check
      chosen = incommand.arguments.find(e => e.name === 'missing');
      if (chosen != undefined) {
        incommand = chosen;
        continue;
      }

      // error print
      else {
        return new CommandArgsError(message.args.slice(0, argindex + 1).join('>') + 'command is not exist.');
      }
    }

    switch (incommand.type) {
      case 'Number':
      case 'string': return incommand.func
      case 'Array': return incommand.func[Math.floor(Math.random() * incommand.func.length)]
      case 'Function': return incommand.func(message, argList);
    }
  },

  // TODO format like: "{name} | {description}"
  arrange(format) {
    /*
    commandhandler.arrange(`{command} | {description}`);
    /덧셈 | add command help. // missing -> ''
    /덧셈 n* | add numbers.
    /덧셈 noo | add noo.
    /덧셈 s | add s.
     */
  }
}

module.exports = {
  CommandHandler: CommandHandler,
  Message: Message,
  CommandArgsError: CommandArgsError
}