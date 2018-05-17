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
        if (!name || typeof name !== "string") {
            throw new TypeError("Name must be a valid string");
        }
        this.name = name;
        this.type = type;
        return this;
    }
    Action.prototype.getContext = function () {
        return this.context;
    };
    Action.prototype.setContext = function (obj) {
        if (!obj || typeof obj !== "object") {
            throw new TypeError("Context must be a valid object");
        }
        this.context = obj;
        return this;
    };
    Action.prototype.getName = function () {
        return this.name;
    };
    Action.prototype.setName = function (name) {
        if (!name || typeof name !== "string") {
            throw new TypeError("Name must be a valid string");
        }
        this.name = name;
        return this;
    };
    Action.prototype.getType = function () {
        return this.type;
    };
    Action.prototype.setType = function (type) {
        if (!type || typeof type !== "number") {
            throw new TypeError("Type must be a valid ActionType");
        }
        this.type = type;
        return this;
    };
    return Action;
}());
exports.Action = Action;
//# sourceMappingURL=Action.js.map