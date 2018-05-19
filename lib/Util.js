"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = (function () {
    function Util() {
    }
    Util.hash = function (str) {
        var hash = 0;
        var strlen = str.length;
        if (strlen === 0) {
            return hash;
        }
        for (var i = 0; i < strlen; ++i) {
            var code = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + code;
            hash &= hash;
        }
        return (hash >>> 0);
    };
    return Util;
}());
exports.default = Util;
//# sourceMappingURL=Util.js.map