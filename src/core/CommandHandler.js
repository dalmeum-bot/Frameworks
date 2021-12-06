/**
 * @Class Command: 명령어를 구성하는 가장 작은 단위 명령어입니다.
 * 
 * @name {Array<String|RegExp>} 명령어 이름 
 * @description {String} 명령어 설명
 * @room {Array<String>} 명령어를 실행시킬 방들
 * @staffOnly {Boolean} 관리자 전용 명령어 여부
 * @canDM {Boolean} 갠챗으로 실행 가능한 명령어 여부
 * @canGroupChat {Boolean} 그룹챗으로 실행 가능한 명령어 여부
 * @arguments {Array<Command>} 하위 명령어 모음
 */
function Command () {
  this.name = new Array();
  this.description = new String();
  this.room = new Array();
  this.staffOnly = new Boolean();
  this.canDM = new Boolean();
  this.canGroupChat = new Boolean();
  this.arguments = new Array();
}

/** * @param {String | RegExp} name */
Command.prototype.setName = function (name) {
  if (!(name instanceof String || name instanceof RegExp)) {
    throw new TypeError("setName(name: String | RegExp)이나, 입력하신 인자의 타입은 " + JSON.stringify(name) + "(" + name.constructor.name + ")입니다.");
  }

  this.name = name;
  if (this.name instanceof String) this.name = [this.name];

  return this;
}

/** * @param {String} description */
Command.prototype.setDescription = function (description) {
  if (!(description instanceof String)) {
    throw new TypeError("setDescription(description: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(description) + "(" + description.constructor.name + ")입니다.");
  }

  this.description = description;

  return this;
}

/** * @param {Array<String>} room */
Command.prototype.setRoom = function (room) {
  if (!(room instanceof Array)) {
    throw new TypeError("setRoom(room: Array)이나, 입력하신 인자의 타입은 " + JSON.stringify(room) + "(" + room.constructor.name + ")입니다.");
  }
  room.every((e, i) => {
    if (e instanceof String) return true;
    else throw new TypeError("setRoom(room: Array<String>)이나, input["+i+"] == "+JSON.stringify(e)+" 는 문자열이 아닙니다.");
  });

  this.room = room;

  return this;
}

/** * @param {Boolean} staffOnly */
Command.prototype.setStaffOnly = function (staffOnly) {
  if (!(staffOnly instanceof Boolean)) {
    throw new TypeError("setStaffOnly(staffOnly: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(staffOnly) + "(" + staffOnly.constructor.name + ")입니다.");
  }

  this.staffOnly = staffOnly;

  return this;
}

/** * @param {Boolean} canDM */
Command.prototype.setCanDM = function (canDM) {
  if (!(canDM instanceof Boolean)) {
    throw new TypeError("setCanDM(canDM: String)이나, 입력하신 인자의 타입은 " + JSON.stringify(canDM) + "(" + canDM.constructor.name + ")입니다.");
  }

  this.canDM = canDM;

  return this;
}

/** * @param {Boolean} canGroupChat */
Command.prototype.setCanGroupChat = function (canGroupChat) {
  if (!(canGroupChat instanceof Boolean)) {
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


Command.prototype.execute = function (item) {
  this.arguments.push({ name: 'execute', func: item, type: item.constructor.name });
  return this;
}

class CommandArgsError {
  constructor(message) {
    this.name = "CommandArgsError";
    this.message = message;
  }
}
CommandArgsError.prototype = Error.prototype;

// REVIEW API2
class Message {
  constructor() {
    this.prefix = new String('/');
    this.useMentionAsPrefix = new Boolean(false);

    this.data = new String();
    this.content = new String();
    this.args = new Array();
    this.command = new String();
    
    this.isMention = new Boolean();
    this.timestamp = Date.now();

    this.room = new Object();

    this.staffs = new Object();
    this.author = new Object();
  }

  setStaff(obj) {
    this.staffs = (typeof obj == 'string') ? JSON.parse(obj) : obj;
    return this;
  }
  setCommandPrefix(prefix, useMentionAsPrefix) {
    this.prefix = prefix;
    this.useMentionAsPrefix = Boolean(useMentionAsPrefix);
    return this;
  }
  build(msg) {
    this.isMention = msg.isMention;

    this.data = msg.content;
    this.content = (msg.content.startsWith('[나를 멘션] @')) ? msg.content.replace(/\[나를 멘션\] @\w+/, '') : msg.content.replace(this.prefix, '')
    this.args = this.content.split(/\\n| /);
    this.command = this.args[0];
    this.args = this.args.slice(1);

    this.room = {
      name: msg.room,
      isGroupChat: msg.isGroupChat,
      isDebugRoom: msg.isDebugRoom,
      isDM: !msg.isGroupChat && !msg.isDebugRoom
    };

    this.author = {
      name: msg.author.name,
      image: Security.hashCode(msg.author.getBase64()),
      isStaff: this.staffs[msg.author.name] == Security.hashCode(msg.author.getBase64())
    };

    return this;
  }
  isCommand() {
    if (this.useMentionAsPrefix && this.data.startsWith('[나를 멘션] @')) return true;
    else if (this.data.startsWith(this.prefix)) return true;
    else return false;
  }
}

// REVIEW Legacy API
class Message {
  constructor() {
    this.prefix = new String('/');
    this.useMentionAsPrefix = new Boolean(false);
    this.staffs = new Object();
    this.data = new String();
    this.content = new String();
    this.args = new Array();
    this.command = new String();
    this.room = new Object();
    this.timestamp = Date.now();
  }

  setStaff(obj) {
    this.staffs = (typeof obj == 'string') ? JSON.parse(obj) : obj;
    return this;
  }
  setCommandPrefix(prefix, useMentionAsPrefix) {
    this.prefix = prefix;
    this.useMentionAsPrefix = Boolean(useMentionAsPrefix);
    return this;
  }
  build(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    this.data = msg;
    this.content = (msg.startsWith('[나를 멘션] @')) ? msg.replace(/\[나를 멘션\] @\w+/, '') : msg.replace(this.prefix, '')
    this.args = this.content.split(/\\n| /);
    this.command = this.args[0];
    this.args = this.args.slice(1);

    this.room = {
      name: room,
      isGroupChat: isGroupChat,
      isDebugRoom: packageName == 'com.xfl.msgbot',
      isDM: !isGroupChat && !(packageName == 'com.xfl.msgbot')
    };

    this.author = {
      name: sender,
      image: java.lang.String(imageDB.getProfileBase64()).hashCode(),
      isStaff: this.staffs[sender] == java.lang.String(imageDB.getProfileBase64()).hashCode()
    };

    return this;
  }
  isCommand() {
    if (this.useMentionAsPrefix && this.data.startsWith('[나를 멘션] @')) return true;
    else if (this.data.startsWith(this.prefix)) return true;
    else return false;
  }
}

class CommandHandler {
  constructor() {
    this.commands = [];
  }

  register(func) {
    this.commands.push(func(new Command()));
  }
  execute(message) {
    if (!message.isCommand()) return; // command 아니면 나가

    let description = '',
        room = [];
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
      chosen = incommand.arguments.find(e => e.name instanceof Function && e.name(message.args[argindex]).constructor == e.name);
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
      case 'String': return incommand.func
      
      case 'Function': return incommand.func(message, argList);
    }
  }
  arrange(format) { // TODO format like: "{name} | {description}"

  }
  /*
  commandhandler.arrange(`{command} | {description}`);
  /덧셈 | add command help. // missing -> ''
  /덧셈 n* | add numbers.
  /덧셈 noo | add noo.
  /덧셈 s | add s.
  */
}