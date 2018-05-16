"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rule = (function () {
    function Rule(name, expression) {
        this.name = name;
        this.expression = expression;
    }
    Rule.prototype.getName = function () {
        return this.name;
    };
    Rule.prototype.setName = function (name) {
        this.name = name;
    };
    Rule.prototype.getExpression = function () {
        return this.expression;
    };
    Rule.prototype.setExpression = function (expression) {
        this.expression = expression;
    };
    return Rule;
}());
exports.default = Rule;
//# sourceMappingURL=Rule.js.map