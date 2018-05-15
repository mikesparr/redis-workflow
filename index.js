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
var RedisConfig_1 = require("./lib/RedisConfig");
exports.RedisConfig = RedisConfig_1.default;
var Trigger_1 = require("./lib/Trigger");
var WorkflowEvents;
(function (WorkflowEvents) {
    WorkflowEvents["Error"] = "error";
    WorkflowEvents["Add"] = "add";
    WorkflowEvents["Remove"] = "remove";
    WorkflowEvents["Load"] = "load";
    WorkflowEvents["Run"] = "run";
    WorkflowEvents["Stop"] = "stop";
})(WorkflowEvents = exports.WorkflowEvents || (exports.WorkflowEvents = {}));
var RedisWorkflow = (function (_super) {
    __extends(RedisWorkflow, _super);
    function RedisWorkflow(config, client) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_REDIS_HOST = "localhost";
        _this.DEFAULT_REDIS_PORT = 6379;
        if (client && client instanceof redis.RedisClient) {
            _this.client = client;
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
        }
        return _this;
    }
    RedisWorkflow.prototype.add = function (channel, name, trigger, rules, actions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            if (typeof name !== "string") {
                throw new TypeError("Name parameter must be a string");
            }
            if (trigger instanceof Trigger_1.default) {
                throw new TypeError("Trigger parameter must be an ITrigger");
            }
            if (rules instanceof Array) {
                throw new TypeError("Rules parameter must be an Array<IRule>");
            }
            if (actions instanceof Array) {
                throw new TypeError("Actions parameter must be a Array<IAction>");
            }
            _this.emit(WorkflowEvents.Add);
            resolve();
        });
    };
    RedisWorkflow.prototype.remove = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.emit(WorkflowEvents.Remove);
            resolve();
        });
    };
    RedisWorkflow.prototype.load = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.emit(WorkflowEvents.Load);
            resolve();
        });
    };
    RedisWorkflow.prototype.run = function (channel, events) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.emit(WorkflowEvents.Run);
            resolve();
        });
    };
    RedisWorkflow.prototype.stop = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.emit(WorkflowEvents.Stop);
            resolve();
        });
    };
    return RedisWorkflow;
}(events_1.EventEmitter));
exports.RedisWorkflow = RedisWorkflow;
//# sourceMappingURL=index.js.map