/** Super Command Handler 2022.05.07 ~ 2022.05.15
 * @author Rhseung
 * @version 1.0
 */

const isConstructor = (f) => {
    try {
        new f();
    } catch (err) {
        if (err.message.indexOf('is not a constructor') >= 0) {
        return false;
        }
    }
    return true;
};

const runAccordingType = (e, msg) => {
    switch (e.constructor) {
        case String:
        case Number:
            return e;
        case Array:
            let idx = Math.floor(Math.random() * (e.length-1));
            return runAccordingType(e[idx]);
        case Function:
            return e(msg);
        default:
            return e.toString();
    }
};

/**
 * @object COMMANDS container  
 */
var COMMANDS = {
    _: [],

    configFunctions: {
        canDM: (msg, value) => value == false ? (!msg.isGroupChat && !msg.isDebugRoom ? false : true) : true,
        canGroupChat: (msg, value) => value == false ? (msg.isGroupChat ? false : true) : true,
        activateRooms: (msg, value) => value.includes(msg.room) && value.length != 0
    },
};

COMMANDS.register = function() {
    COMMANDS._ = COMMANDS._.concat(
        (arguments[0].constructor == Array) ? arguments[0] : Array.from(arguments)
    );
};

COMMANDS.set = COMMANDS.register;

COMMANDS.makeConfig = function(configname, func) {
    COMMANDS.configFunctions[configname] = func;

    botCommand.prototype['set' + configname[0].toUpperCase() + configname.slice(1)] = function(e) {
        this.configs[configname] = e;
    
        return this;
    };
};

COMMANDS.isSatisfied = function(msg, configs) {
    for (configName in configs) {
        if (COMMANDS.configFunctions[configName](msg, configs[configName]) == false) {
            return false;
        }
    }
    return true;
};

COMMANDS.execute = function(msg) {
    var arguments = msg.args;

    // 첫 명령어 검색
    var command = COMMANDS._.find(command =>
        command(msg.command).name.string.includes(msg.command) && COMMANDS.isSatisfied(msg, command(msg.command).configs)
    );
    
    // 검색 실패 시, undefined 반환
    if (command == null) return;
    else command = command(msg.command);
    
    // 모든 인자 명령어를 다 돌리기
    while (arguments.length > 0 && command.subcommand.length > 0) {
        var isGrouped = command.isGrouped;

        // 인자 명령어 검색
        command = command.subcommand.find(subcommand => {
            var subcmd = subcommand(arguments[0]);

            // 마지막 명령어 (.run)
            if (command.name.condition == null) return true;

            // config 검사
            if (COMMANDS.isSatisfied(msg, subcmd.configs) == false) return false;
            
            // matchf가 생성자 함수면 타입 변환
            if (isConstructor(command.name.condition)) {
                isGrouped ? arguments = arguments.map(command.name.condition)   // arguments 전부 타입 변환
                            : arguments[0] = command.name.condition(arguments[0]);    // arguments[0]만 타입 변환
                
                return (subcmd.name.string.length > 0) ? subcmd.name.string.includes(arguments[0]) : true;    // 고정 이름 검사
            }
            // matchf가 생성자 함수가 아니면 조건부 이름
            else {
                return (subcmd.name.string.length > 0) ?   // 고정 이름 검사
                    subcmd.name.string.includes(arguments[0]) && command.name.condition(arguments[0], msg)
                    : command.name.condition(arguments[0], msg);
            }
        });

        // 검색 실패 시, undefined 반환
        if (command == null) return;

        // addArguments면 인자에 arguments대입, addArgument면 인자에 arguments[0] 대입
        else command = isGrouped ? command(arguments) : command(arguments[0]);

        // for (configname in command.configs) {
        //     if (COMMANDS.configFunctions[configname](msg, command.configs[configname]) == false) return;
        // }

        if (isGrouped) break;

        arguments = arguments.slice(1);
    }

    // run이 없는 비정상적인 코드의 경우 undefined 반환
    if (command.runcode == null) return;

    return runAccordingType(command.runcode, msg);
};

/**
 * @class botCommand class  
 * `name` command's name including aliases  
 * `match` match that use it for choosing commands when command doesn't have names  
 * `description` command's description. use for help command  
 * `configs` command's config. canGroupChat or canDM or something like this  
 * `run` command's run  
 * `subcommand` command's argument  
 * `endcommand` command's end command, no more arguments
 */
function botCommand() {
    this.name = {
        string : Array.from(arguments),
        condition : null
    };

    this.description = '';
    this.configs = {};
    this.isGrouped = false;
    
    this.runcode;
    this.subcommand = [];
}

/**
 * @param {String[]} aliases
 * @example new botCommand().setName('name1', 'name2', 'name3', ... etc);
 */
botCommand.prototype.setName = function() {
    this.name.string = Array.from(arguments);

    return this;
},

/**
 * @param {String} description 
 * @example new botCommand().setDescription('description')
 */
botCommand.prototype.setDescription = function(description) {
    this.description = description;

    return this;
},

/**
 * @param {Object} configs 
 * @example new botCommand().setConfigs({ config1: true, config2: false, ... etc })
 */
botCommand.prototype.setConfigs = function(configs) {
    for (let i in configs) {
        this.configs[i] = configs[i];
    }

    return this;
},

botCommand.prototype.setOptions = botCommand.prototype.setConfigs;

/**
 * @param {Function} match 
 * @param {botCommand} subcommand 
 * @example new botCommand().addArgument(String, argname => new botCommand().addArgument(... etc) ... etc)
 * @example new botCommand().addArgument(msg => msg.author.name.startsWith("@"), username => new botCommand().addArgument(... etc) ... etc)
 */
botCommand.prototype.addArgument = function(match, subcommand) {
    this.name.condition = match;

    // subcommand().description = subcommand().description || this.description;
    // subcommand().configs = Object.keys(subcommand().configs).length == 0 ? this.configs : subcommand().configs;
    this.subcommand.push(subcommand);

    return this;
},

botCommand.prototype.arg = botCommand.prototype.addArgument;

/**
 * @param {Function} match 
 * @param {botCommand} endcommand 
 * @example new botCommand().addArguments(Number, numbers => new botCommand().run(... etc) ... etc)
 */
botCommand.prototype.addArguments = function(match, endcommand) {
    this.name.condition = match;
    this.isGrouped = true;

    // endcommand().description = endcommand().description || this.description;
    // endcommand().configs = Object.keys(endcommand().configs).length == 0 ? this.configs : endcommand().configs;
    this.subcommand.push(endcommand);

    return this;
},

botCommand.prototype.args = botCommand.prototype.addArguments;

/**
 * @param {String | Number | any[] | Function} e 
 * @returns result of run according e's type  
 * `String` return String  
 *   
 * `Number` return Number  
 *   
 * `Array` return random item of Array  
 *      if item type is Array: return random element of item  
 *          if element type is Array: return random value of element  
 *             ... repeat  
 *   
 * `Function` return Function(msg)
 * 
 * @example new botCommand().run(3)
 * @example new botCommand().run("hello world")
 * @example new botCommand().run([1, 2, 3])
 * @example new botCommand().run([1, [2, [msg => msg.reply(3), "4"]], 5])
 * @example new botCommand().run(msg => msg.reply("hello world"))
 */
botCommand.prototype.run = function(e) {
    this.runcode = e;
    // todo run(a, b, c, d, e, f, ...)

    return this;
}

botCommand.prototype.do = botCommand.prototype.run;

for (let config in COMMANDS.configFunctions) {
    botCommand.prototype['set' + config[0].toUpperCase() + config.slice(1)] = function(e) {
        this.configs[config] = e;
    
        return this;
    }
}

module.exports = {
    botCommand: botCommand,
    COMMANDS: COMMANDS
};

////////////////////////////////////////////////////////////////

COMMANDS.makeConfig('allowLevel', (msg, value) => (msg.level || 0) >= value);
COMMANDS.register(
    add => new botCommand('add', 'plus')
        .setActivateRooms(['dev'])
        .setCanDM(false)
        .setAllowLevel(4)

        .args(Number, numbers => new botCommand()
            .do(msg =>
                numbers.reduce((acc, curr) => acc + curr)
            )
        )
);

console.log(COMMANDS.execute({
    args: ['1', '2', '3'],
    command: 'add',
    room: 'dev',
    isGroupChat: false,
    isDebugRoom: true,
    level: 4
}));