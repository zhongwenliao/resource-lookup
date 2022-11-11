var e = function (e) {
    return (e = e.toString())[1] ? e : '0' + e;
};
module.exports = {
    formatTime: function (t) {
        var i = t.getFullYear(),
            o = t.getMonth() + 1,
            g = t.getDate(),
            n = t.getHours(),
            a = t.getMinutes(),
            h = t.getSeconds();
        return [i, o, g].map(e).join('/') + ' ' + [n, a, h].map(e).join(':');
    },
    imageUtil: function (e) {
        var t = {},
            i = e.width,
            o = e.height,
            g = o / i;
        return (
            console.log('原始宽: ' + i),
            console.log('原始高: ' + o),
            console.log('宽高比' + g),
            uni.getSystemInfo({
                success: function (e) {
                    var n = e.windowWidth / 2,
                        a = e.windowHeight / 2,
                        h = a / n;
                    i > e.windowWidth || o > e.windowHeight
                        ? g < h
                            ? ((t.imageWidth = n), (t.imageHeight = (n * o) / i))
                            : ((t.imageHeight = a), (t.imageWidth = (a * i) / o))
                        : ((t.imageHeight = o), (t.imageWidth = i));
                }
            }),
            console.log('缩放后的宽: ' + t.imageWidth),
            console.log('缩放后的高: ' + t.imageHeight),
            t
        );
    }
};
