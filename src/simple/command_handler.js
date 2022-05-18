/** Simple Command Handler
 * @author Rhseung
 */

/** Message class
 * 기존의 msg객체를 전역으로 선언하기 위해 만든 툴.
 * replyf 같은 기능성 함수도 더 추가할 예정.
 */
function Message() {
    this.prefix = '';
    this.isCommand = false;
    this.content;
    this.args;
    this.command;
    this.room; 
    this.isGroupChat;
    this.isDebugRoom;
    this.author = {
        name: '',
        avatar: {
            getBase64: null,
            getBitmap: null
        }
    };
    this.reply;
    this.replyf;
    this.markAsRead;
    this.packageName;
    this.isMention;
}

const format = function (string) {
	let options = Array.from(arguments).slice(1);

	if (options.length == 1 && options[0] instanceof Object) {
		return string.replace(/{(.*?)}/g, (_, g1) => options[0][g1.trim()].toString());
	}
    else {
		let last = 0;
		return string.replace(/{(.*?)}/g, (matched, g1) => (g1 === "" ? options[++last - 1] : options[g1] || matched).toString());
	}
};

Message.prototype = {
    build: function (msg) {
        this.isCommand = msg.content.startsWith(this.prefix);
        this.content = msg.content.replace(this.prefix, '');
        this.args = this.content.split(/ |\\n+/);
        this.command = this.args[0];
        this.args = this.args.slice(1);
        this.room = msg.room;
        this.isGroupChat = msg.isGroupChat;
        this.isDebugRoom = msg.isDebugRoom;
        this.author = msg.author;
        this.reply = (s) => msg.reply(s);
        this.replyf = function () { msg.reply(format.apply(null, arguments)); }
        this.markAsRead = msg.markAsRead;
        this.packageName = msg.packageName;
        this.isMention = msg.isMention;
    },
    
    setPrefix: function (prefix) {
        this.prefix = prefix;
        return this;
    },

    toString: function () {
        
    }
};

/** Command class
 * 명령어 노드 각각을 역할하는 클래스.
 * 
 * @version 1.1 (2022.4.3)
 ** 추가됨.
 */
function Command(func, types) {
    this.aliases = null;
    this.func = func;
    this.types = types;

    this.many = false; // 가변인자 true/false
}

Command.prototype = {
    aliase: function (ali) {
        this.aliases = RegExp(ali);

        return this;
    },

    option: function (config) {
        this.many = Boolean(config.many) || false;

        return this;
    },
    
    toString: function () {
        
    }
};

/** Container class
 * 명령어 컨테이너 클래스.
 * 자체에는 컨테이너 기능만 있지만, 명령어 등록이나 실행 정도의 메소드가 있음.
 * 
 * @version 1.1 (2022.4.3)
 ** 속성 (many) 추가됨, 가변인자 사용 툴
 ** Command -> Container 로 재작명, commands 배열 안에 각각의 노드(Command)가 들어가게 함
 */
function Container() {
    this.commands = [];
}

Container.prototype = {
    execute: function (message) {
        if (!message.isCommand) return;
    
        let matched_command;
        this.commands.forEach(cmd => {
            if (cmd.func.name == message.command) {
                if ((cmd.many == true) || (cmd.func.length == message.args.length)) {
                    matched_command = cmd;
                }
            }
            else if (cmd.aliases != null) {
                if (cmd.aliases.test(message.command)) {
                    if ((cmd.many == true) || (cmd.func.length == message.args.length)) {
                        matched_command = cmd;
                    }
                }
            }
        });
    
        if (matched_command == null) return;
        
        if (matched_command.types.length != 0) {
            for (let idx = 0; idx < Math.min(matched_command.types.length, message.args.length); idx++) {
                if ((matched_command.types[idx] != null) && (matched_command.types[idx].constructor == Function)) {
                    message.args[idx] = matched_command.types[idx](message.args[idx]);
                }
            }
        }
    
        matched_command.func.apply(null, message.args);
    },
    
    register: function () {
        let args = Array.from(arguments);
        if (args.length == 0) return;
    
        this.commands.push(new Command(args[0], args.slice(1)));

        return this.commands[this.commands.length - 1];
    },

    toString: function () {

    }
};

module.exports = {
    Message: Message,
    Container: Container
};