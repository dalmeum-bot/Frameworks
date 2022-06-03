const bot = BotManager.getCurrentBot();
const rooms = ["Dalmooned"];

var hworkList = new Map();

// 숙제 불러오기
if (Database.exists("HomeWorkList.txt")) {
    hworkList = new Map(Database.readObject("HomeWorkList.txt"));
}

bot.setCommandPrefix('/');
bot.addListener(Event.COMMAND, (msg) => {
    if (!rooms.includes(msg.room)) return;

    const commands = {
        // 도움말 명령어
        "?숙제": "help",
        // 과목추가 명령어
        "추가": "add_category",
        // 과목삭제 명령어
        "삭제": "del_category",
        // 과목/숙제/모두 초기화 명령어
        "초기화": "all_reset",
        // 숙제 나열 명령어
        "숙제": "print_homework"
    };
    msg.condition = commands[msg.command];

    // 숙제 추가/삭제 명령어
    hworkList.forEach((_, key) => {
        if (msg.command === key.name) {
            msg.condition = "control_homework";
            msg.category = key;
        }
    });

    if (msg.condition != null) run(msg);
    else return;
});

class Category {
    constructor(name, date, amount) {
        this.name = name;
        this.date = date.replace(/ /g, '').split(',');
        this.amount = amount;
        this.progress = 0;
        this.stat = 0;
    }

    progress() {
        return (this.progress / this.amount).toFixed(2);
    }
}

// made by hapdong [2/2]
run = (msg) => {
    switch (msg.condition) {
        case "help": {
            msg.reply(`숙제 도움말 ${"\u200b".repeat(500)}\n\n` +
                `추가 <과목명> <수업하는 요일>\n• 과목을 추가합니다.\n\n` +
                `삭제 <과목명>\n• 과목을 삭제합니다.\n\n` +
                `<과목명> <숙제내용>\n• 숙제를 추가합니다.\n\n` +
                `<과목명> 삭제\n• 숙제를 삭제합니다.\n\n` +
                `초기화\n• 모든 숙제를 삭제합니다.\n\n` +
                `초기화 모두\n• 모든 과목과 숙제를 전부 삭제합니다.\n\n` +
                `숙제\n• 모든 숙제를 나열합니다.\n\n` +
                `숙제 <요일>\n• 입력한 요일에 해당하는 숙제를 나열합니다.\n\n` +
                `숙제 <과목명>\n• 입력한 과목 숙제를 나열합니다.`);

            break;
        }

        case "add_category": {
            if (msg.args <= 1) break; // 인자 개수 검사
            if (msg.args[0].replace(/[가-힣0-9a-zA-Z]+/g, '').length > 0) break;  // 과목명 검사
            var category = new Category(msg.args[0], msg.args.connect(1).replace(/요일/g, '')); // 추가할 과목 정의

            // 과목 추가
            if (!hworkList.has(msg.args[0])) {
                hworkList.set(category, []);
                msg.reply(`과목 추가됨: ${category.name}(${category.date})`);
            } else {
                msg.reply(`${category.name} 과목은 이미 존재합니다.`);
            }

            save(hworkList);
            break;
        }

        case "del_category": {
            // 과목명인지 체크
            var has = false;
            hworkList.forEach((_, key) => {
                if (msg.args[0] === key.name) has = true;
            });

            // 과목 삭제
            if (has) {
                hworkList.forEach((_, key) => {
                    if (msg.args[0] === key.name) hworkList.delete(key);
                });
                msg.reply(`${msg.args[0]} 과목이 삭제되었습니다.`);
            }
            else {
                msg.reply(`${msg.args[0]} 과목은 존재하지 않습니다.`);
            }

            save(hworkList);
            break;
        }

        case "all_reset": {
            // 숙제 초기화
            if (msg.args[0] == null) {
                hworkList.forEach((_, key) => {
                    hworkList.set(key, []);
                });
                msg.reply(`숙제가 모두 초기화되었습니다.`);
            }
            // 모두 초기화
            else if (msg.args[0] === "모두") {
                hworkList = new Map();
                msg.reply(`과목과 숙제가 모두 초기화되었습니다.`);
            }

            save(hworkList);
            break;
        }

        case "control_homework": {
            var contents = msg.args.join(' ');

            // 숙제 삭제
            if (contents === "삭제") {
                hworkList.set(msg.category, []);
                msg.reply(`${msg.category.name} 숙제가 삭제되었습니다.`);
            }
            // 숙제 추가
            else {
                hworkList.set(msg.category, hworkList.get(msg.category).concat(contents.split(',')));
                msg.reply(`${msg.category.name} 숙제 추가됨: [${hworkList.get(msg.category)}]`);
            }

            save(hworkList);
            break;
        }

        case "print_homework": {
            var contents = msg.args.join(' ');

            // 과목명인지 체크
            var subj;
            hworkList.forEach((_, key) => {
                if (contents === key.name) subj = key;
            });

            var ret = ''; // 숙제 나열할 문자열

            // 요일별 출력
            if (['월', '화', '수', '목', '금', '토', '일'].includes(contents)) {
                ret += `${contents}요일 숙제\n───────────`;

                hworkList.forEach((value, key) => {
                    if (key.date.includes(contents)) {
                        ret += `\n× ${key.name}`;
                        value.forEach((element, idx) => {
                            ret += `\n    • ${element}`;
                        });
                    }
                });
            }
            // 과목별 출력
            else if (subj != null) {
                ret += `${subj.name} 숙제\n───────────`;
                hworkList.get(subj).forEach(element => {
                    ret += `\n• ${element}`;
                });
            }
            // 전체 출력
            else {
                ret += `모든 숙제\n───────────`;
                hworkList.forEach((value, key) => {
                    ret += `\n× ${key.name}`;
                    value.forEach(element => {
                        ret += `\n    • ${element}`;
                    });
                });
            }

            msg.reply(ret);
            save(hworkList);
            break;
        }
    }
}

save = (data) => Database.writeObject("HomeWorkList.txt", Array.from(data));
Array.prototype.connect = function (idx) {
    var str = this[idx];
    for (let i = idx + 1; i < this.length; i++) str += (" " + this[i]);
    return str;
};

/*
Map을 사용한 이유:
1. key 자료형이 new Category(객체)
2. 자료 추가와 삭제가 빈번해서 객체보다 효율 좋음
3. 순회함수가 내장되어있어 편리함
4. 별로 안 써봤음
*/