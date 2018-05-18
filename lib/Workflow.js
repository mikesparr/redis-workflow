"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mozjexl = require("mozjexl");
var DelayedAction_1 = require("./DelayedAction");
var ImmediateAction_1 = require("./ImmediateAction");
var Rule_1 = require("./Rule");
var Trigger_1 = require("./Trigger");
var Workflow = (function () {
    function Workflow(name, trigger, rules, actions, id) {
        if (name && typeof name !== "string") {
            throw new TypeError("Name must be valid string");
        }
        if (trigger && typeof trigger !== "object") {
            throw new TypeError("Trigger must be null or valid ITrigger");
        }
        if (rules && typeof rules !== "object") {
            throw new TypeError("Rules must be null or valid IRule[]");
        }
        if (actions && typeof actions !== "object") {
            throw new TypeError("Actions must be null or valid IAction[]");
        }
        if (id && typeof id !== "string") {
            throw new TypeError("Id must be valid string");
        }
        this.name = name || undefined;
        this.trigger = trigger || undefined;
        this.rules = rules || undefined;
        this.actions = actions || undefined;
        this.id = id || undefined;
        this.evaluator = new mozjexl.Jexl();
        return this;
    }
    Workflow.prototype.getId = function () {
        return this.id || null;
    };
    Workflow.prototype.setId = function (id) {
        this.id = id;
    };
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
    Workflow.prototype.getEvaluator = function () {
        return this.evaluator;
    };
    Workflow.prototype.setEvaluator = function (evaluator) {
        this.evaluator = evaluator;
    };
    Workflow.prototype.getActionsForContext = function (context) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var actionsToFire = [];
            var isValid = true;
            var rulesJobs = [];
            if (_this.rules && _this.rules.length > 0) {
                _this.rules.map(function (rule) {
                    if (rule && rule.getExpression()) {
                        rulesJobs.push(_this.evaluator.eval(rule.getExpression(), context));
                    }
                });
            }
            Promise.all(rulesJobs)
                .then(function (values) {
                values.map(function (check) {
                    if (check !== true) {
                        isValid = false;
                    }
                });
                if (isValid && _this.actions && _this.actions.length > 0) {
                    actionsToFire = _this.actions;
                }
                resolve(actionsToFire);
            });
        });
    };
    Workflow.prototype.fromDict = function (dict) {
        var _this = this;
        this.id = dict.id;
        this.name = dict.name;
        this.trigger = new Trigger_1.default(dict.trigger.name);
        this.rules = [];
        dict.rules.map(function (rule) {
            _this.rules.push(new Rule_1.default(rule.name, rule.expression));
        });
        this.actions = [];
        dict.actions.map(function (action) {
            if (action.interval) {
                _this.actions.push(new DelayedAction_1.default(action.name, action.interval, action.context, action.scheduledAt, action.recurrence));
            }
            else {
                _this.actions.push(new ImmediateAction_1.default(action.name));
            }
        });
        return this;
    };
    Workflow.prototype.toDict = function () {
        var workflowDict = {
            id: this.getId(),
            name: this.getName(),
            trigger: {
                name: this.getTrigger().getName(),
            },
        };
        var rules = [];
        this.getRules().map(function (rule) {
            var ruleDict = {
                expression: rule.getExpression(),
                name: rule.getName(),
            };
            rules.push(ruleDict);
        });
        workflowDict.rules = rules;
        var actions = [];
        this.getActions().map(function (action) {
            var actionDict = {
                context: action.getContext(),
                name: action.getName(),
                type: action.getType(),
            };
            if (action instanceof DelayedAction_1.default) {
                actionDict.scheduledAt = action.getScheduledDateAsTimestamp();
                actionDict.interval = action.getIntervalAsMilliseconds();
                actionDict.recurrence = action.getRecurrences();
            }
            actions.push(actionDict);
        });
        workflowDict.actions = actions;
        return workflowDict;
    };
    return Workflow;
}());
exports.default = Workflow;
//# sourceMappingURL=Workflow.js.map