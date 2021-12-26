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
	this.property = {
		room = new Array(),
		staffOnly = new Boolean(),
		canDM = new Boolean(),
		canGroupChat = new Boolean()
	};
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
		this.property.room = room;

		return this;
	},

	setStaffOnly(staffOnly)
	{
		this.property.staffOnly = staffOnly;

		return this;
	},

	setCanDM(canDM)
	{
		this.property.canDM = canDM;

		return this;
	},

	setCanGroupChat(canGroupChat)
	{
		this.property.canGroupChat = canGroupChat;

		return this;
	},

	// TODO name formatting
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

		// NOTE type가 RegExp면 좀 곤란하지 않나... 나중에 inthis.type(arg) 할거거든? 아닌가?
		inthis.type = (name.constructor.name == "Function") ? name : name.constructor;
		
		switch (name)
		{
			case String: inthis.name = /(\S+)/; break;
			case Number: inthis.name = /([+-]?\d+(?:\.\d+)?)/; break;

			// TODO 각 요소 그룹화, 지금은 맨 앞/뒤만 그룹됨, <> | {} | [] | () | 또는 안 감싸도 인식하게 좀 부탁
			case Array: inthis.name = /([+-]?[a-zA-Zㄱ-힣0-9]+)(?:,([+-]?[a-zA-Zㄱ-힣0-9]+))*/; break;

			default: inthis.name = (name.constructor == Function) ? name.name : name.toString();
		}

		/* NOTE
			이거 정규식이랑 arg랑 전부 매치되어야함, 일부만 매치되면 의미 없다 그거
			대강 RegExp.test(arg) 말고, arg.match(RegExp)[0] == arg 로 전부 매치되는지 확인하면 될듯
			RegExp.exec 같은 다른 함수들도 좀 찾아보셈
		*/

		this.arguments.push(inthis);

		return this;
	},

	missing(item)
	{
		this.arguments.push({
			name: "missing",
			func: item,
			type: item.constructor.name 
		});

		return this;
	},

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