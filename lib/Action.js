"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionType;
(function (ActionType) {
    ActionType[ActionType["Delayed"] = 0] = "Delayed";
    ActionType[ActionType["Immediate"] = 1] = "Immediate";
    ActionType[ActionType["Named"] = 2] = "Named";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
var Action = (function () {
    function Action(name, type) {
        this.name = name;
        this.type = type;
    }
    Action.prototype.getContext = function () {
        return this.context;
    };
    Action.prototype.setContext = function (context) {
        this.context = context;
    };
    Action.prototype.getName = function () {
        return this.name;
    };
    Action.prototype.setName = function (name) {
        this.name = name;
    };
    Action.prototype.getType = function () {
        return this.type;
    };
    Action.prototype.setType = function (type) {
        this.type = type;
    };
    return Action;
}());
exports.Action = Action;
//# sourceMappingURL=Action.js.map