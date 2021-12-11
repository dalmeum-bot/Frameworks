/*
 * Command: 명령어를 구성하는 가장 작은 단위 명령어입니다.
 *
 * Command.name: (String | RegExp)[] 명령어 이름
 * Command.description: String 명령어 설명
 * Command.usage: String 명령어 형태
 * Command.room: String[] 명령어를 실행시킬 방들
 * Command.staffOnly: Boolean 관리자 전용 명령어 여부
 * Command.canDM: Boolean 갠챗으로 실행 가능한 명령어 여부
 * Command.canGroupChat: Boolean 그룹챗으로 실행 가능한 명령어 여부
 * Command.arguments: Command[] 하위 명령어 모음
 */

function Command()
{
	this.name = new Array();
	this.description = new String();
	this.usage = new String();
	this.type = null;
	this.room = new Array();
	this.staffOnly = new Boolean();
	this.canDM = new Boolean();
	this.canGroupChat = new Boolean();
	this.arguments = new Array();
}

Command.prototype =
{
	setName()
	{
		var names = Array.from(arguments);

		this.name = names;

		return this;
	},

	setDescription(description)
	{
		this.description = description;

		return this;
	},

	setUsage(usage)
	{
		this.usage = usage;

		return this;
	},

	setRoom(room)
	{
		this.room = room;

		return this;
	},

	setStaffOnly(staffOnly)
	{
		this.staffOnly = staffOnly;

		return this;
	},

	setCanDM(canDM)
	{
		this.canDM = canDM;

		return this;
	},

	setCanGroupChat(canGroupChat)
	{
		this.canGroupChat = canGroupChat;

		return this;
	},

	/**
	 * @addArgument 하위 명령어를 추가합니다.
	 * @param {String | RegExp} name
	 * @param {Object | Command} func
	 */
	addArgument(name, func)
	{
		const inthis = func(new Command()
			.setDescription(this.description)
			.setUsage(this.usage)
			.setRoom(this.room)
			.setStaffOnly(this.staffOnly)
			.setCanDM(this.canDM)
			.setCanGroupChat(this.canGroupChat)
		);

		inthis.type = (name.constructor.name == "Function") ? name : name.constructor;
		
		inthis.name = (name.constructor.name == "Function") ?
									(name.name == "String") ? /\S+/ : (name.name == "Number") ? /[+-]?\d+(?:\.\d+)?/ : name.name : name;

		this.arguments.push(inthis);

		return this;
	},

	/**
	 * @missing 인자가 없을 때 실행됨
	 * @param {Any} item
	 */
	missing(item)
	{
		this.arguments.push({
			name: "missing",
			func: item,
			type: item.constructor.name 
		});

		return this;
	},

	/**
	 * @execute call할 때 실행됨
	 * @param {Any} item
	 */
	execute(item)
	{
		this.arguments.push({
			name: "execute",
			func: item,
			type: item.constructor.name
		});

		return this;
	},
};