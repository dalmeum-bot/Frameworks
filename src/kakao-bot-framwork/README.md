## command handler
- MIT License
- API2 Only  

## example
예시코드는 [example code](example.js)를 확인하세요.

## migration
```js
// install at
msgbot
  └── global_modules
    └── command_handler.js
```

```js
// load files
var { COMMANDS, botCommand } = require('command_handler.js')
```

## how to use?

### COMMANDS

COMMANDS.register(...cmd: botCommand)  
COMMANDS.register([...cmd]: botCommand[])
