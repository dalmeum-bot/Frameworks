## command_handler.js reference

채팅 명령어 구조를 더욱 쉽게 만들어줍니다.  
알림 기반 카카오톡 봇에서 사용 가능한 모듈입니다. (API2 전용)

기본 코드는 다음과 같습니다.

```js
const bot = BotManager.getCurrentBot();
var { Container, Message } = require('CommandHandler');

// 명령어 컨테이너를 지정합니다.
var container = new Container();
// 메시지 클래스 지정, 명령어 접두사 ('/') 지정
var message = new Message().setPrefix('/');

// 문자가 오면
bot.on(Event.MESSAGE, (msg) => {
    message.build(msg); // 메시지 불러오기
    container.execute(message); // 명령어 실행하기
});

// 명령어 함수
function 명령어이름 () {
    // 명령어 코드
}
container.register(명령어이름); // 명령어 등록
```  

## Message class
```js
// 기본 코드

var { Message } = require("{PATH}")
var message = new Message();
```
Methods
- [setPrefix](#setPrefix)
- [build](#build)

---

### setPrefix
```js
var message = new Message();
message.setPrefix(prefix);
```
> 명령어 접두사로 활용될 `prefix` 를 지정합니다.

name | type
---|---
`prefix` | `String`

### build
```js
var message = new Message();
message.build(msg);
```
> `prefix` 를 이용해 `msg` 를 가공합니다.  

name | type
---|---
`msg` | `Message` (API2의 Message)

#### `msg` structure
```js
{
    prefix: String,
    isCommand : Boolean,
    content : String,
    args : Array<String>,
    command : String,
    room : String,
    isGroupChat : Boolean,
    isDebugRoom : Boolean,
    author : {
        name: String,
        avatar: {
            getBase64: Function,
            getBitmap: Function
        }
    },
    reply : Function(content),
    replyf : Function(content, formats),
    markAsRead : Function,
    packageName : String,
    isMention : Boolean
}
```
#### example
`msg.replyf(content, formats)` 사용법은 다음과 같습니다.
```js
// { } 속이 비어있는 경우, formats[0], formats[1], ... 순으로 순서가 자동 지정되어 대입됩니다.
msg.replyf("{} + {} = {}", 1, 1, 2)
// => "1 + 1 = 2"

// { } 속에 index값을 써넣은 경우 formats[index]가 직접 지정되어 대입됩니다.
msg.replyf("{0} + {0} = {1}", 1, 2)
// => "1 + 1 = 2"

// { } 속에 index값을 쓰면 누적 index가 증가하지 않고 한 차례 밀립니다.
msg.replyf("{} + {0} = {}", 1, 2)
// => "1 + 1 = 2"

// {key}에 formats[key]가 대입됩니다.
msg.replyf("{n1} + {n2} = {res}", { n1: 1, n2: 1, res: 2 })
// => "1 + 1 = 2"
``` 


## Container class
```js
// 기본 코드

var { Container } = require("{PATH}")
var container = new Container();
```
Methods
- [register](#register)
- [execute](#execute)

---

### register
```js
Container.register(command, ...types)
```
> `command` 를 container에 등록합니다. `...types` 로 각각의 인자 타입을 지정해줄 수 있습니다. 또한 return한 값의 타입은 `Command` 입니다.

name | type
---|---
`command` | `Function`
`...types` | `Class[]`

### execute
```js
Container.execute(message)
```
> `message` 을 이용해 등록되었던 명령어들을 실행합니다.  

name | type
---|---
`message` | `Message`

## Command class
Methods
- [aliase](#aliase)
- [option](#option)


### aliase
```js
Container.register(command, ...).aliase(aliase);
```
>`command` 명령어의 이름을 대신해줄 `aliase`를 지정합니다.

name | type
---|---
`aliase` | `String`

### option
```js
Container.register(command, ...).option(config);
```
> `command` 명령어의 속성을 지정합니다.

property | type | description
---|---|---
`many` | `Boolean` | `command` 명령어의 가변인자 허용 유무를 결정합니다.

name | type
---|---
`config` | `Object`

#### example
```js
function command(...) {
    ...
}
Container.register(command, ...).option({ many: true });
```