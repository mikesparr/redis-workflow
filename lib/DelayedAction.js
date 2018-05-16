"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Action_1 = require("./Action");
var DelayedAction = (function (_super) {
    __extends(DelayedAction, _super);
    function DelayedAction(name, context, delayAsTimestamp, intervalAsMillis, repeat) {
        var _this = _super.call(this, name, Action_1.ActionType.Delayed) || this;
        _this.context = context;
        return _this;
    }
    DelayedAction.prototype.getContext = function () {
        return this.context;
    };
    DelayedAction.prototype.setContext = function (context) {
        this.context = context;
    };
    DelayedAction.prototype.getDelayAsTimestamp = function () {
        return this.delay;
    };
    DelayedAction.prototype.setDelay = function (timestamp) {
        this.delay = timestamp;
    };
    DelayedAction.prototype.setInterval = function (milliseconds) {
        this.interval = milliseconds;
    };
    DelayedAction.prototype.getIntervalAsMilliseconds = function () {
        return this.interval || 0;
    };
    DelayedAction.prototype.isRepeat = function () {
        return this.repeat || false;
    };
    return DelayedAction;
}(Action_1.Action));
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map