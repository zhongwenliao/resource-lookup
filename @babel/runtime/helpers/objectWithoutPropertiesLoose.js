module.exports = function(e, r) {
    if (null == e) return {};
    var t, n, u = {}, f = Object.keys(e);
    for (n = 0; n < f.length; n++) t = f[n], r.indexOf(t) >= 0 || (u[t] = e[t]);
    return u;
};