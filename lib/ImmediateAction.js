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
var ImmediateAction = (function (_super) {
    __extends(ImmediateAction, _super);
    function ImmediateAction(name) {
        return _super.call(this, name, Action_1.ActionType.Immediate) || this;
    }
    return ImmediateAction;
}(Action_1.Action));
exports.default = ImmediateAction;
//# sourceMappingURL=ImmediateAction.js.map