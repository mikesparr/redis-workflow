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
var events_1 = require("events");
var redis = require("redis");
var Action_1 = require("./lib/Action");
exports.ActionType = Action_1.ActionType;
var DelayedAction_1 = require("./lib/DelayedAction");
exports.DelayedAction = DelayedAction_1.default;
var ImmediateAction_1 = require("./lib/ImmediateAction");
exports.ImmediateAction = ImmediateAction_1.default;
var RedisConfig_1 = require("./lib/RedisConfig");
exports.RedisConfig = RedisConfig_1.default;
var Rule_1 = require("./lib/Rule");
exports.Rule = Rule_1.default;
var Trigger_1 = require("./lib/Trigger");
exports.Trigger = Trigger_1.default;
var Workflow_1 = require("./lib/Workflow");
exports.Workflow = Workflow_1.default;
var WorkflowEvents;
(function (WorkflowEvents) {
    WorkflowEvents["Error"] = "error";
    WorkflowEvents["Add"] = "add";
    WorkflowEvents["Remove"] = "remove";
    WorkflowEvents["Load"] = "load";
    WorkflowEvents["Start"] = "start";
    WorkflowEvents["Stop"] = "stop";
    WorkflowEvents["Schedule"] = "schedule";
    WorkflowEvents["Kill"] = "kill";
})(WorkflowEvents = exports.WorkflowEvents || (exports.WorkflowEvents = {}));
var RedisWorkflowManager = (function (_super) {
    __extends(RedisWorkflowManager, _super);
    function RedisWorkflowManager(config, client) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_REDIS_HOST = "localhost";
        _this.DEFAULT_REDIS_PORT = 6379;
        _this.PUBSUB_KILL_MESSAGE = "WFKILL";
        if (client && client instanceof redis.RedisClient) {
            _this.client = client;
            _this.subscriber = client;
        }
        else {
            var options = {
                host: config.host || _this.DEFAULT_REDIS_HOST,
                port: config.port || _this.DEFAULT_REDIS_PORT,
                retry_strategy: function (status) {
                    if (status.error && status.error.code === "ECONNREFUSED") {
                        return new Error("The server refused the connection");
                    }
                    if (status.total_retry_time > 1000 * 60 * 60) {
                        return new Error("Retry time exhausted");
                    }
                    if (status.attempt > 10) {
                        return undefined;
                    }
                    return Math.min(status.attempt * 100, 3000);
                },
            };
            if (config.db) {
                options.db = config.db;
            }
            if (config.password) {
                options.password = config.password;
            }
            _this.client = redis.createClient(options);
            _this.subscriber = redis.createClient(options);
        }
        return _this;
    }
    RedisWorkflowManager.prototype.setWorkflows = function (workflows) {
        if (typeof workflows !== "object") {
            throw new TypeError("Workflows are required");
        }
        this.workflows = workflows;
    };
    RedisWorkflowManager.prototype.getWorkflows = function () {
        return this.workflows || [];
    };
    RedisWorkflowManager.prototype.addWorkflow = function (channel, workflow) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            if (typeof workflow !== "object") {
                throw new TypeError("Workflow is required");
            }
            _this.workflows ? _this.workflows.push(workflow) : _this.workflows = [workflow];
            _this.emit(WorkflowEvents.Add);
            resolve();
        });
    };
    RedisWorkflowManager.prototype.start = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            var triggerMap = {};
            _this.workflows.map(function (flow) {
                if (flow &&
                    flow !== null &&
                    flow.getTrigger() !== null &&
                    flow.getTrigger().getName() !== null &&
                    flow.getTrigger().getName() !== undefined) {
                    triggerMap[flow.getTrigger().getName()] = flow;
                }
            });
            _this.subscriber.on("message", function (ch, message) {
                if (message === _this.PUBSUB_KILL_MESSAGE) {
                    _this.subscriber.unsubscribe(channel);
                    _this.emit(WorkflowEvents.Kill);
                }
                else if (message && typeof message === "string") {
                    try {
                        var jsonMessage = JSON.parse(message);
                        var event_1 = jsonMessage.event, context_1 = jsonMessage.context;
                        var activeFlow = (event_1 && context_1) ? triggerMap[event_1] : null;
                        if (activeFlow) {
                            activeFlow.getActionsForContext(context_1)
                                .then(function (actions) {
                                actions.map(function (action) {
                                    if (action && action instanceof DelayedAction_1.default) {
                                        action.setContext(context_1);
                                        _this.emit(WorkflowEvents.Schedule, action);
                                    }
                                    else if (action && action instanceof ImmediateAction_1.default) {
                                        _this.emit(action.getName() || "unknown", context_1);
                                    }
                                    else {
                                        _this.emit(WorkflowEvents.Error, new TypeError("Action object was null"));
                                    }
                                });
                            })
                                .catch(function (error) {
                                _this.emit(WorkflowEvents.Error, error);
                            });
                        }
                        else {
                            _this.emit(WorkflowEvents.Error, new TypeError("No trigger defined for event '" + event_1 + "'"));
                        }
                    }
                    catch (error) {
                        _this.emit(WorkflowEvents.Error, error);
                    }
                }
                else {
                    _this.emit(WorkflowEvents.Error, new TypeError("Message " + message + " is not valid JSON '{event, context}'"));
                }
            });
            _this.subscriber.subscribe(channel, function (err, reply) {
                if (err !== null) {
                    throw err;
                }
                _this.emit(WorkflowEvents.Start);
                resolve();
            });
        });
    };
    RedisWorkflowManager.prototype.stop = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.client.publish(channel, _this.PUBSUB_KILL_MESSAGE, function (err, reply) {
                _this.emit(WorkflowEvents.Stop);
                resolve();
            });
        });
    };
    RedisWorkflowManager.prototype.loadWorkflowsFromDatabase = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.emit(WorkflowEvents.Load);
            resolve();
        });
    };
    return RedisWorkflowManager;
}(events_1.EventEmitter));
exports.RedisWorkflowManager = RedisWorkflowManager;
//# sourceMappingURL=index.js.map