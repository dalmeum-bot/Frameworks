var { COMMANDS, botCommand } = require('../cmd_handler/super/command_handler');

class Teacher {
    constructor(name) {
        this.name = name;
    }
}

const status = {
    STUDY: '복습하기',
    SOLVE: '풀기',
    CHECK: '채점하기',
    RESOLVE: '오답 고치기'
};

const teachers = {
    정지현: new Teacher('정지현'),
    심윤희: new Teacher('심윤희'),
    김영준: new Teacher('김영준'),
    이광현: new Teacher('이광현'),
    이선미: new Teacher('이선미'),
    장송이: new Teacher('장송이'),
    박자화: new Teacher('박자화'),
    김주형: new Teacher('김주형'),
    윤오상: new Teacher('윤오상'),
    우준선: new Teacher('우준선'),
    설영찬: new Teacher('설영찬'),
    이동수: new Teacher('이동수'),
    조은아: new Teacher('조은아'),
    김명환: new Teacher('김명환'),
    유유희: new Teacher('유유희'),
    정재민: new Teacher('정재민'),
    MrTorres: new Teacher('Mr.Torres'),
    박새별: new Teacher('박새별'),
    김경미: new Teacher('김경미'),
    정수진: new Teacher('정수진'),
    조현웅: new Teacher('조현웅'),
    최용석: new Teacher('최용석'),
    심규철: new Teacher('심규철'),
};

/**
 * worksheet.content : 213,
 * worksheet.status
 */
class Worksheet {
    constructor(teacher, sheetname, amount) {
        this.teacher = teachers[teacher];
        this.sheetname = sheetname;

        this.amount = amount;
        this.stat = sheetname.includes('개념') ? status.STUDY : status.SOLVE;
        this.progress = 0;
        
        this.done = false;
    }

    renew(amount) {
        if (this.done) return;

        switch (this.stat) {
            case status.STUDY:
                this.progress += amount;
                if (this.progress() >= 100) {
                    this.stat = status.SOLVE;
                    this.progress = 0;
                }
                return this;
            case status.SOLVE:
                this.progress += amount;
                if (this.progress() >= 100) {
                    this.stat = status.CHECK;
                    this.progress = 0;
                }
                return this;
            case status.CHECK:
                this.progress += amount;
                if (this.progress() >= 100) {
                    this.stat = status.RESOLVE;
                    this.progress = 0;
                }
                return this;
            case status.RESOLVE:
                this.progress += amount;
                if (this.progress() >= 100)
                    this.done = true;
                return this;
        }
    }

    progress() {
        return (this.progress / this.amount).toFixed(2);
    }
}

class Worksheets {
    constructor() {
        this._ = [];
    }

    set(value) {
        this._.push(value);
    }

    renew(key, amount) {
        if (!this._.has(key)) return;
        this._.set(key, this._.get(key).renew(amount));
    }
}

var worksheets = new Worksheets();
a = new Worksheet(teachers.김주형, '9. 부정방정식과 부등식', 42);
worksheets.set(a);
console.log();