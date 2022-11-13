var e = require("./objectWithoutPropertiesLoose");

module.exports = function(r, t) {
    if (null == r) return {};
    var o, n, l = e(r, t);
    if (Object.getOwnPropertySymbols) {
        var u = Object.getOwnPropertySymbols(r);
        for (n = 0; n < u.length; n++) o = u[n], 0 <= t.indexOf(o) || Object.prototype.propertyIsEnumerable.call(r, o) && (l[o] = r[o]);
    }
    return l;
};