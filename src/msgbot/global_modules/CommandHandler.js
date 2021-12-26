function CommandHandler()
{
	this.commands = [];
	this.commandsDir = "";
}

CommandHandler.prototype =
{
	set(obj)
	{
		this.commandsDir = obj.commandsDir || "";

		if (this.commandsDir != "")
		{
			var dir = new java.io.File("/sdcard/" + this.commandsDir);
			dir.listFiles().forEach(path => this.commands.push(require(path)));
		}
	},

	register(func)
	{
		this.commands.push(func(new Command()));
	},

	/* NOTE
		addArgument(Number, ...) 해도 결국은 메시지는 String아님? Number에 전달될 수 있나
		그래서 지금 Function에 따라 정규식 넣어놓기는 함 (String, Number, Array(아직))
		Function(msg)로 하면 될듯? 근데 음 
	*/

	execute(msg)
	{
		if (!msg.isCommand()) return; // command 아니면 나가

		var command;
		var property = {
			room: [],
			staffOnly: false,
			canDM: false,
			canGroupChat: false
		};

		// 명령어 검색
		// TODO Array.find로 나중에 바꾸자
		totalCommandsLoop:
		for (let i = 0; i < this.commands.length; i++) {
			for (let j = 0; j < this.commands[i].name; j++) {
				let commandName = this.commands[i].name[j];

				if (commandName.constructor == String) {
					command = ((commandName == msg.command) ? cmd : null);
					break totalCommandsLoop;
				}
				else if (commandName.constructor == RegExp) {
					command = ((commandName.test(msg.command)) ? cmd : null);
					break totalCommandsLoop;
				}
			}
		}

		if (command == null) return; // 맞는 명령어 없으면 나가

		var argIdx = 0,
				argList = [],
				incommand = command,
				chosen;

		commandSearching:
		while (incommand.name != "execute" || incommand.name != "missing")
		{
			property.room = incommand.property.room || property.room;
			property.staffOnly = incommand.property.staffOnly || property.staffOnly;
			property.canDM = incommand.property.canDM || property.canDM;
			property.canGroupChat = incommand.property.canGroupChat || property.canGroupChat;

			if (property.room.length != 0 && !property.room.includes(msg.room.name)) return; // 해당 방 아니면 나가
			if (property.staffOnly == true && msg.author.isStaff == false) return; // staffOnly에 안 맞으면 나가
			if (property.canDM == false && msg.room.isDM == true) return; // canDM에 안 맞으면 나가
			if (property.canGroupChat == false && msg.room.isGroupChat == true) return; // canGroupChat에 안 맞으면 나가

			// name check (regex | string)
			var matched;
			chosen = incommand.arguments.find(cmd =>
			{
				for (let i = 0; i < cmd.name; i++) {
					if (cmd.name[i].constructor == String) {
						return cmd.name[i] === msg.args[argIdx];
					}
					else if (cmd.name[i].constructor == RegExp) {
						matched = msg.args[argIdx].match(cmd.name[i]);
						return matched.length !== 0;
					}
				}
			});

			if (chosen != undefined)
			{
				incommand = chosen;
				argList.push({
					content: msg.args[argIdx],
					group: (matched.length === 0) ? [] : matched.slice(1),
				});
				argIdx++;
				continue commandSearching;
			}

			// type check
			chosen = incommand.arguments.find(e => e.type(msg.args[argIdx]).constructor == e.type);
			if (chosen != undefined) {
				incommand = chosen;
				argList.push({
					content: msg.args[argIdx],
					group: [],
				});
				argIdx++;
				continue commandSearching;
			}

			// missing check
			chosen = incommand.arguments.find(e => e.name === "missing");
			if (chosen != undefined) {
				incommand = chosen;
				continue commandSearching;
			}

			// error print
			else {
				return new CommandArgsError(msg.args.slice(0, argIdx + 1).join(">") + "command is not exist.");
			}
		}

		switch (incommand.type) {
			case "Number":
			case "String":
				return incommand.func;
			case "Array":
				return incommand.func[Math.floor(Math.random() * incommand.func.length)];
			case "Function":
				return incommand.func(msg, argList);
		}
	},
};