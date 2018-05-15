"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var RedisConfig = (function () {
    function RedisConfig(host, port, db, password) {
        this.host = host;
        this.port = port;
        this.db = db ? db : null;
        this.password = password ? password : null;
    }
    return RedisConfig;
}());
exports.RedisConfig = RedisConfig;
var RedisWorkflow = (function () {
    function RedisWorkflow(config, client) {
        this.DEFAULT_REDIS_HOST = "localhost";
        this.DEFAULT_REDIS_PORT = 6379;
        this.ENTRY_TYPE = "entries";
        this.PEER_TYPE = "peers";
        if (client && client instanceof redis.RedisClient) {
            this.client = client;
        }
        else {
            var options = {
                host: config.host || this.DEFAULT_REDIS_HOST,
                port: config.port || this.DEFAULT_REDIS_PORT,
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
            this.client = redis.createClient(options);
        }
    }
    RedisWorkflow.prototype.length = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.client.zcard([channel, _this.PEER_TYPE].join(":"), function (err, reply) {
                if (err !== null) {
                    reject(err);
                }
                resolve(reply);
            });
        });
    };
    RedisWorkflow.prototype.isEmpty = function (channel) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            _this.client.zcard([channel, _this.PEER_TYPE].join(":"), function (err, reply) {
                if (err !== null) {
                    reject(err);
                }
                resolve(reply === 0);
            });
        });
    };
    return RedisWorkflow;
}());
exports.RedisWorkflow = RedisWorkflow;
//# sourceMappingURL=index.js.map