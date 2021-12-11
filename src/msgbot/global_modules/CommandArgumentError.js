function CommandArgumentError(message) {
	this.name = "CommandArgsError";
	this.message = message;
}
CommandArgumentError.prototype = Error.prototype;