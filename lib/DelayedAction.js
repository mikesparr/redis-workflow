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
    function DelayedAction(name, intervalAsMillis, context, delayAsTimestamp, recurrences) {
        var _this = this;
        if (intervalAsMillis && typeof intervalAsMillis !== "number") {
            throw new TypeError("Interval must be a valid number");
        }
        if (context && typeof context !== "object") {
            throw new TypeError("Context must be a valid object");
        }
        if (delayAsTimestamp && typeof delayAsTimestamp !== "number") {
            throw new TypeError("Delay must be a valid number");
        }
        if (recurrences && typeof recurrences !== "number") {
            throw new TypeError("Recurrences must be valid number");
        }
        _this = _super.call(this, name, Action_1.ActionType.Delayed) || this;
        _this.recurrences = recurrences ? recurrences : 1;
        _this.interval = intervalAsMillis ? intervalAsMillis : 0;
        _this.context = context ? context : undefined;
        _this.scheduledAt = delayAsTimestamp ? delayAsTimestamp : undefined;
        return _this;
    }
    DelayedAction.prototype.getScheduledDateAsTimestamp = function () {
        return this.scheduledAt || this.calcDelayAsTimestamp();
    };
    DelayedAction.prototype.setScheduledDate = function (timestamp) {
        if (!timestamp || typeof timestamp !== "number") {
            throw new TypeError("Timestamp must be a valid number");
        }
        this.scheduledAt = timestamp;
        return this;
    };
    DelayedAction.prototype.setInterval = function (milliseconds) {
        if (!milliseconds || typeof milliseconds !== "number") {
            throw new TypeError("Milliseconds must be a valid number");
        }
        this.interval = milliseconds;
        return this;
    };
    DelayedAction.prototype.getIntervalAsMilliseconds = function () {
        return this.interval;
    };
    DelayedAction.prototype.getRecurrences = function () {
        return this.recurrences;
    };
    DelayedAction.prototype.isRepeat = function () {
        return this.recurrences !== 1;
    };
    DelayedAction.prototype.delay = function (amount, interval) {
        if (!amount || typeof amount !== "number") {
            throw new TypeError("Amount must be a valid number");
        }
        if (!interval || typeof interval !== "string") {
            throw new TypeError("Interval must be a valid string");
        }
        switch (interval) {
            case "s":
            case "sec":
            case "second":
            case "seconds":
                this.interval = this.secondAsMillis() * amount;
                break;
            case "m":
            case "min":
            case "minute":
            case "minutes":
                this.interval = this.minuteAsMillis() * amount;
                break;
            case "h":
            case "hr":
            case "hour":
            case "hours":
                this.interval = this.hourAsMillis() * amount;
                break;
            case "d":
            case "day":
            case "days":
                this.interval = this.dayAsMillis() * amount;
                break;
            case "w":
            case "week":
            case "weeks":
                this.interval = this.weekAsMillis() * amount;
                break;
            case "mo":
            case "mon":
            case "month":
            case "months":
                this.interval = this.monthAsMillis() * amount;
                break;
            case "y":
            case "yr":
            case "yrs":
            case "year":
            case "years":
                this.interval = this.yearAsMillis() * amount;
                break;
            default:
                this.interval = this.dayAsMillis();
                break;
        }
        return this;
    };
    DelayedAction.prototype.repeat = function (times) {
        this.recurrences = times ? times : 0;
        return this;
    };
    DelayedAction.prototype.setScheduledDateFrom = function (timestamp) {
        this.scheduledAt = this.calcDelayAsTimestamp(timestamp);
        return this;
    };
    DelayedAction.prototype.calcDelayAsTimestamp = function (from) {
        var start = (from) ? from : Date.now();
        var later = start + (this.interval || 0);
        return Math.floor(later / 1000);
    };
    DelayedAction.prototype.secondAsMillis = function () {
        return 1000;
    };
    DelayedAction.prototype.minuteAsMillis = function () {
        return this.secondAsMillis() * 60;
    };
    DelayedAction.prototype.hourAsMillis = function () {
        return this.minuteAsMillis() * 60;
    };
    DelayedAction.prototype.dayAsMillis = function () {
        return this.hourAsMillis() * 24;
    };
    DelayedAction.prototype.weekAsMillis = function () {
        return this.dayAsMillis() * 7;
    };
    DelayedAction.prototype.monthAsMillis = function (days) {
        return this.dayAsMillis() * (days ? days : 30);
    };
    DelayedAction.prototype.yearAsMillis = function () {
        return this.dayAsMillis() * 365;
    };
    return DelayedAction;
}(Action_1.Action));
exports.default = DelayedAction;
//# sourceMappingURL=DelayedAction.js.map