"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Workflow = (function () {
    function Workflow(name, trigger, rules, actions) {
        this.name = name;
        this.trigger = trigger;
        this.rules = rules;
        this.actions = actions;
    }
    Workflow.prototype.getName = function () {
        return this.name;
    };
    Workflow.prototype.setName = function (name) {
        this.name = name;
    };
    Workflow.prototype.getTrigger = function () {
        return this.trigger;
    };
    Workflow.prototype.setTrigger = function (trigger) {
        this.trigger = trigger;
    };
    Workflow.prototype.getRules = function () {
        return this.rules || [];
    };
    Workflow.prototype.setRules = function (rules) {
        this.rules = rules;
    };
    Workflow.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };
    Workflow.prototype.removeRule = function (name) {
        this.rules = this.rules.filter(function (rule) { return rule.getName() !== name; });
    };
    Workflow.prototype.getActions = function () {
        return this.actions || [];
    };
    Workflow.prototype.setActions = function (actions) {
        this.actions = actions;
    };
    Workflow.prototype.addAction = function (action) {
        this.actions.push(action);
    };
    Workflow.prototype.removeAction = function (name) {
        this.actions = this.actions.filter(function (action) { return action.getName() !== name; });
    };
    return Workflow;
}());
exports.default = Workflow;
//# sourceMappingURL=Workflow.js.map