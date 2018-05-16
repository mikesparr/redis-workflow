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
exports.Action = Action_1.default;
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
    WorkflowEvents["Run"] = "run";
    WorkflowEvents["Stop"] = "stop";
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
        this.workflows = workflows;
    };
    RedisWorkflowManager.prototype.getWorkflows = function () {
        return this.workflows;
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
    RedisWorkflowManager.prototype.run = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.subscriber.on("message", function (ch, message) {
                if (message === _this.PUBSUB_KILL_MESSAGE) {
                    _this.subscriber.unsubscribe(channel);
                    _this.emit(WorkflowEvents.Kill);
                }
                else {
                    _this.emit(message);
                }
            });
            _this.subscriber.subscribe(channel, function (err, reply) {
                if (err !== null) {
                    throw err;
                }
                _this.emit(WorkflowEvents.Run);
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