## command handler
- MIT License
- API2 Only  

## example
예시코드는 [example code](example.js)를 확인하세요.

## migration
```js
// 모듈 설치 위치
msgbot
  └── global_modules
    └── command_handler.js
```

```js
// 모듈 불러오기
var { COMMANDS, botCommand } = require('command_handler.js')
```

## how to use?

### COMMANDS

COMMANDS.register(...cmd: botCommand)  
COMMANDS.register([...cmd]: botCommand[])
