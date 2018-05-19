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
var Util_1 = require("./lib/Util");
exports.Util = Util_1.default;
var Workflow_1 = require("./lib/Workflow");
exports.Workflow = Workflow_1.default;
var WorkflowEvents;
(function (WorkflowEvents) {
    WorkflowEvents["Error"] = "error";
    WorkflowEvents["Add"] = "add";
    WorkflowEvents["Remove"] = "remove";
    WorkflowEvents["Load"] = "load";
    WorkflowEvents["Save"] = "save";
    WorkflowEvents["Delete"] = "delete";
    WorkflowEvents["Ready"] = "ready";
    WorkflowEvents["Start"] = "start";
    WorkflowEvents["Stop"] = "stop";
    WorkflowEvents["Reset"] = "reset";
    WorkflowEvents["Schedule"] = "schedule";
    WorkflowEvents["Immediate"] = "immediate";
    WorkflowEvents["Audit"] = "audit";
    WorkflowEvents["Kill"] = "kill";
})(WorkflowEvents = exports.WorkflowEvents || (exports.WorkflowEvents = {}));
var RedisWorkflowManager = (function (_super) {
    __extends(RedisWorkflowManager, _super);
    function RedisWorkflowManager(config, client, channels) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_REDIS_HOST = "localhost";
        _this.DEFAULT_REDIS_PORT = 6379;
        _this.PUBSUB_KILL_MESSAGE = "WFKILL";
        _this.REDIS_WORKFLOW_KEY_SUFFIX = "workflows";
        if (config && typeof config !== "object") {
            throw new TypeError("Config must be null or a valid RedisConfig");
        }
        if (client && typeof client !== "object") {
            throw new TypeError("Client must be null or a valid RedisClient");
        }
        if (channels && channels.length === 0) {
            throw new TypeError("Channels must be valid array of at least one string");
        }
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
        _this.workflows = {};
        if (channels) {
            _this.reload(channels)
                .then(function () {
                return _this;
            })
                .catch(function (error) {
                _this.emit(WorkflowEvents.Error, error);
                return _this;
            });
        }
        return _this;
    }
    RedisWorkflowManager.prototype.setWorkflows = function (workflows) {
        if (typeof workflows !== "object") {
            throw new TypeError("Workflows must be a valid object");
        }
        this.workflows = workflows;
    };
    RedisWorkflowManager.prototype.setWorkflowsForChannel = function (channel, workflows) {
        if (typeof workflows !== "object") {
            throw new TypeError("Workflows must be a valid object");
        }
        this.workflows[channel] = workflows;
    };
    RedisWorkflowManager.prototype.getWorkflows = function () {
        return this.workflows || {};
    };
    RedisWorkflowManager.prototype.getWorkflowsForChannel = function (channel) {
        if (typeof channel !== "string") {
            throw new TypeError("Channel must be a valid string");
        }
        if (!this.workflows) {
            throw new Error("You haven't defined any workflows yet");
        }
        if (this.workflows && !this.workflows[channel]) {
            throw new Error("No workflows exist for that channel");
        }
        return this.workflows[channel];
    };
    RedisWorkflowManager.prototype.addWorkflow = function (channel, workflow) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!channel || typeof channel !== "string") {
                throw new TypeError("Channel must be a valid string");
            }
            if (!workflow || typeof workflow !== "object") {
                throw new TypeError("Workflow is required");
            }
            if (!_this.workflows) {
                _this.workflows = (_a = {}, _a[channel] = [workflow], _a);
            }
            else if (_this.workflows && !_this.workflows[channel]) {
                _this.workflows[channel] = [workflow];
            }
            else {
                _this.workflows[channel].push(workflow);
            }
            _this.saveWorkflowsToDatabaseForChannel(channel)
                .then(function () {
                _this.emit(WorkflowEvents.Add);
                resolve();
            })
                .catch(function (error) {
                reject(error);
            });
            var _a;
        });
    };
    RedisWorkflowManager.prototype.removeWorkflow = function (channel, name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!channel || typeof channel !== "string") {
                throw new TypeError("Channel must be a valid string");
            }
            if (!name || typeof name !== "string") {
                throw new TypeError("Name must be a valid string");
            }
            if (_this.workflows && _this.workflows[channel]) {
                var channelFlow = _this.workflows[channel];
                channelFlow = channelFlow.filter(function (flow) { return flow.getName() !== name; });
                _this.workflows[channel] = channelFlow;
            }
            _this.saveWorkflowsToDatabaseForChannel(channel)
                .then(function () {
                _this.emit(WorkflowEvents.Remove);
                resolve();
            })
                .catch(function (error) {
                reject(error);
            });
        });
    };
    RedisWorkflowManager.prototype.start = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel must be a valid string");
            }
            if (!_this.workflows) {
                throw new Error("You haven't defined any workflows yet");
            }
            if (_this.workflows && !_this.workflows[channel]) {
                throw new Error("No workflows exist for that channel");
            }
            var triggerMap = _this.getTriggersAsDictForChannel(channel);
            _this.subscriber.on("message", function (ch, message) {
                if (ch === channel) {
                    if (message === _this.PUBSUB_KILL_MESSAGE) {
                        _this.subscriber.unsubscribe(channel);
                        _this.emit(WorkflowEvents.Kill, channel);
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
                                        action.setContext(context_1);
                                        if (action) {
                                            _this.emit(action.getName(), action);
                                            _this.emit(WorkflowEvents.Audit, action);
                                            if (action instanceof DelayedAction_1.default) {
                                                _this.emit(WorkflowEvents.Schedule, action);
                                            }
                                            else if (action instanceof ImmediateAction_1.default) {
                                                _this.emit(WorkflowEvents.Immediate, action);
                                            }
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
    RedisWorkflowManager.prototype.reload = function (channels) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!channels || channels.length === 0) {
                throw new TypeError("Channels must be valid array of one or more strings");
            }
            var jobs = [];
            channels.map(function (ch) {
                jobs.push(_this.loadWorkflowsFromDatabaseForChannel(ch));
            });
            Promise.all(jobs)
                .then(function (values) {
                _this.emit(WorkflowEvents.Ready);
                resolve();
            })
                .catch(function (error) {
                _this.emit(WorkflowEvents.Error, (error));
            });
        });
    };
    RedisWorkflowManager.prototype.save = function (channels) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!channels || channels.length === 0) {
                throw new TypeError("Channels must be valid array of one or more strings");
            }
            var jobs = [];
            channels.map(function (ch) {
                jobs.push(_this.saveWorkflowsToDatabaseForChannel(ch));
            });
            Promise.all(jobs)
                .then(function (values) {
                _this.emit(WorkflowEvents.Save);
                resolve();
            })
                .catch(function (error) {
                _this.emit(WorkflowEvents.Error, (error));
            });
        });
    };
    RedisWorkflowManager.prototype.reset = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.workflows = {};
            _this.emit(WorkflowEvents.Reset);
            resolve();
        });
    };
    RedisWorkflowManager.prototype.saveWorkflowsToDatabaseForChannel = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            if (_this.workflows) {
                var jobs_1 = [];
                _this.workflows[channel].map(function (workflow) {
                    var nameHash = Util_1.default.hash(workflow.getName());
                    var key = [channel, nameHash].join(":");
                    jobs_1.push(_this.saveWorkflowToDatabase(key, workflow));
                });
                Promise.all(jobs_1)
                    .then(function (workflowKeys) {
                    var channelWorkflowId = [channel, _this.REDIS_WORKFLOW_KEY_SUFFIX].join(":");
                    (_a = _this.client).sadd.apply(_a, [channelWorkflowId].concat(workflowKeys, [function (err, reply) {
                            _this.emit(WorkflowEvents.Save, channel);
                            resolve();
                        }]));
                    var _a;
                })
                    .catch(function (error) {
                    reject(error);
                });
            }
        });
    };
    RedisWorkflowManager.prototype.saveWorkflowToDatabase = function (key, workflow) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!key || typeof key !== "string") {
                throw new TypeError("Key must be valid string");
            }
            if (!workflow || typeof workflow !== "object") {
                throw new TypeError("Workflow must be valid Workflow");
            }
            var workflowDict = workflow.toDict();
            _this.client.set(key, JSON.stringify(workflowDict), function (err, reply) {
                if (err !== null) {
                    throw err;
                }
                resolve(key);
            });
        });
    };
    RedisWorkflowManager.prototype.getWorkflowFromDb = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!key || typeof key !== "string") {
                throw new TypeError("Key must be valid string");
            }
            _this.client.get(key, function (err, reply) {
                if (err !== null) {
                    throw err;
                }
                try {
                    var pFlow = JSON.parse(reply);
                    var pWorkflow = new Workflow_1.default().fromDict(pFlow);
                    resolve(pWorkflow);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    };
    RedisWorkflowManager.prototype.loadWorkflowsFromDatabaseForChannel = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            var jobs = [];
            _this.client.smembers([channel, _this.REDIS_WORKFLOW_KEY_SUFFIX].join(":"), function (err, flows) {
                if (err !== null) {
                    throw err;
                }
                flows.map(function (key) {
                    jobs.push(_this.getWorkflowFromDb(key));
                });
                Promise.all(jobs)
                    .then(function (pWorkflows) {
                    _this.setWorkflowsForChannel(channel, pWorkflows);
                    _this.emit(WorkflowEvents.Load);
                    resolve();
                })
                    .catch(function (error) {
                    throw error;
                });
            });
        });
    };
    RedisWorkflowManager.prototype.removeWorkflowsFromDatabase = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            var key = [channel, _this.REDIS_WORKFLOW_KEY_SUFFIX].join(":");
            _this.client.del(key, function (err, reply) {
                _this.emit(WorkflowEvents.Delete, channel);
                resolve();
            });
        });
    };
    RedisWorkflowManager.prototype.getTriggersAsDictForChannel = function (channel) {
        var triggerDict = {};
        this.workflows[channel].map(function (flow) {
            if (flow &&
                flow !== null &&
                flow.getTrigger() !== null &&
                flow.getTrigger().getName() !== null &&
                flow.getTrigger().getName() !== undefined) {
                triggerDict[flow.getTrigger().getName()] = flow;
            }
        });
        return triggerDict;
    };
    return RedisWorkflowManager;
}(events_1.EventEmitter));
exports.RedisWorkflowManager = RedisWorkflowManager;
//# sourceMappingURL=index.js.map