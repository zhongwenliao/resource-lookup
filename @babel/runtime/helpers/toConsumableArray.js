var r = require("./arrayWithoutHoles"), e = require("./iterableToArray"), t = require("./nonIterableSpread");

module.exports = function(u) {
    return r(u) || e(u) || t();
};