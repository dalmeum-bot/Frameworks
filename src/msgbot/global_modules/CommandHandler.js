function CommandHandler() {
	this.commands = [];
	this.commandsDir = "";
}

CommandHandler.prototype = {
	set(obj) {
		this.commandsDir = obj.commandsDir || "";

		var dir = new java.io.File("/sdcard/" + this.commandsDir);
		dir.listFiles().forEach((command) => {
			var r = require(command);
			this.commands.push(r);
		});
	},

	register(func) {
		this.commands.push(func(new Command()));
	},

	// addArgument(Number, ...) 해도 결국은 메시지는 String아님? Number에 전달될 수 있나
	// Function(msg)로 하면 될듯? 근데 음

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

		this.commands.forEach((cmd) => {
			cmd.name.forEach((e) => {
				if (e.constructor.name == "String") {
					command = e == message.command ? cmd : null;
					return false;
				} else if (e.constructor.name == "RegExp") {
					command = e.test(message.command) ? cmd : null;
					return false;
				}
			});
		});
		if (command == null) return; // 해당 command 없으면 나가

		while (incommand.name != "execute" || incommand.name != "missing") {
			description = incommand.description;
			room = incommand.room;
			staffOnly = incommand.staffOnly;
			canDM = incommand.canDM;
			canGroupChat = incommand.canGroupChat;

			if (room.length != 0 && !room.includes(message.room.name)) return; // 해당 방 아니면 나가
			if (staffOnly == true && message.author.isStaff == false) return; // staffOnly에 안 맞으면 나가
			if (canDM == false && message.room.isDM == true) return; // canDM에 안 맞으면 나가
			if (canGroupChat == false && message.room.isGroupChat == true) return; // canGroupChat에 안 맞으면 나가

			// name check (regex | string)
			var m;
			chosen = incommand.arguments.find((e) => {
				if (typeof e.name == "string") {
					return e.name === message.args[argindex];
				} else {
					m = message.args[argindex].match(e.name);
					return m.length != 0;
				}
			});
			if (chosen != undefined) {
				incommand = chosen;
				argList.push({
					content: message.args[argindex],
					group: typeof e.name == "string" ? [] : m.slice(1),
				});
				argindex++;
				continue;
			}

			// type check
			chosen = incommand.arguments.find((e) => typeof e.name == "Function" && e.name(message.args[argindex]).constructor == e.name);
			if (chosen != undefined) {
				incommand = chosen;
				argList.push({
					content: message.args[argindex],
					group: [],
				});
				argindex++;
				continue;
			}

			// missing check
			chosen = incommand.arguments.find((e) => e.name === "missing");
			if (chosen != undefined) {
				incommand = chosen;
				continue;
			}

			// error print
			else {
				return new CommandArgsError(message.args.slice(0, argindex + 1).join(">") + "command is not exist.");
			}
		}

		switch (incommand.type) {
			case "Number":
			case "string":
				return incommand.func;
			case "Array":
				return incommand.func[Math.floor(Math.random() * incommand.func.length)];
			case "Function":
				return incommand.func(message, argList);
		}
	},
};