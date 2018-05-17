"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RedisConfig = (function () {
    function RedisConfig(host, port, db, password) {
        this.host = host;
        this.port = port;
        if (db >= 0) {
            this.db = db;
        }
        if (password) {
            this.password = password;
        }
    }
    RedisConfig.prototype.setHost = function (host) {
        if (!host || typeof host !== "string") {
            throw new TypeError("Host must be a valid string");
        }
        this.host = host;
        return this;
    };
    RedisConfig.prototype.setPort = function (port) {
        if (!port || typeof port !== "number") {
            throw new TypeError("Port must be a number");
        }
        this.port = port;
        return this;
    };
    RedisConfig.prototype.setDb = function (id) {
        if (!id || typeof id !== "number") {
            throw new TypeError("Database id must be a number");
        }
        this.db = id;
        return this;
    };
    RedisConfig.prototype.setPassword = function (password) {
        if (!password || typeof password !== "string") {
            throw new TypeError("Password must be a valid string");
        }
        this.password = password;
        return this;
    };
    return RedisConfig;
}());
exports.default = RedisConfig;
//# sourceMappingURL=RedisConfig.js.map