/** Keyword Command Handler
 * @author Rhseung
 */

function Keyword() {
    this.forms = [];

    Array.from(arguments).forEach(e => {
        if (e.includes("_")) {
            this.forms.push(RegExp(e.replace(/_/g, '\\S+')));
        }
        else if (e.includes("~")) {
            this.forms.push(RegExp(e.replace(/_/g, '+')));
        }
        else {
            this.forms.push(e);
        }
    });
}

function KeywordGroup() {
    this.keywords = Array.from(arguments);
}