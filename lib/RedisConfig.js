"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RedisConfig = (function () {
    function RedisConfig(host, port, db, password) {
        this.host = host;
        this.port = port;
        this.db = db ? db : null;
        this.password = password ? password : null;
    }
    return RedisConfig;
}());
exports.default = RedisConfig;
//# sourceMappingURL=RedisConfig.js.map