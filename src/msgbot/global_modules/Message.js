function Message(msg) {
	this.originalMsgObject = msg;

	this.prefix = "/";
	this.useMentionAsPrefix = false;

	this.data = "";
	this.content = "";
	this.args = [];
	this.command = "";

	this.isMention = false;
	this.timestamp = Date.now();

	this.room = {
		name: "",
		isGroupChat: false,
		isDebugRoom: false,
		isDM: true,
	};

	this.author = {
		name: "",
		pfHashCode: 0,
		isStaff: false,
	};
}

Message.prototype = {
	setStaff(func) {
		this.author.isStaff = Boolean(func(this.originalMsgObject));

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
		this.content = this.originalMsgObject.content.startsWith("[나를 멘션] @")
			? this.originalMsgObject.content.replace(/\[나를 멘션\] @\w+/, "")
			: this.originalMsgObject.content.replace(this.prefix, "");
		this.args = this.content.split(/\\n| /);
		this.command = this.args[0];
		this.args = this.args.slice(1);

		this.room = {
			name: this.originalMsgObject.room,
			isGroupChat: this.originalMsgObject.isGroupChat,
			isDebugRoom: this.originalMsgObject.isDebugRoom,
			isDM: !this.originalMsgObject.isGroupChat && !this.originalMsgObject.isDebugRoom,
		};

		this.author = {
			name: this.originalMsgObject.author.name,
			pfHashCode: Security.hashCode(this.originalMsgObject.author.avatar.getBase64()),
			isStaff: this.author.isStaff || false,
		};

		return this;
	},

	isCommand() {
		if (this.useMentionAsPrefix && this.data.startsWith("[나를 멘션] @")) return true;
		else if (this.data.startsWith(this.prefix)) return true;
		else return false;
	},
};