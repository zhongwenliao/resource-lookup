var instances = "";
var kdinstances = "";
var picslist = "";
var picslistdata = "";
var touches;
var getDataset;
var kdtouches;
var kdgetDataset;
var start = false;

function touchstart(event, ownerInstance) {
    picslist = ownerInstance.selectComponent('.picslist');
    picslistdata = picslist.getDataset();
    touches = event.touches;
    instances = ownerInstance.selectComponent('.' + picslistdata.types + picslistdata.index);
    if (instances == null) return;;
    getDataset = instances.getDataset()
};

function touchmove(event, ownerInstance) {
    if (instances == null) return;;
    var newtouches = event.touches;
    if (newtouches.length <= 1) {
        var x = newtouches[(0)].pageX - touches[(0)].pageX;
        var y = newtouches[(0)].pageY - touches[(0)].pageY;
        getDataset.x += x;
        getDataset.y += y;
        instances.setStyle(({
            "top": getDataset.y + "px",
            "left": getDataset.x + "px",
        }));
        picslistdata.x += x;
        picslistdata.y += y;
        picslist.setStyle(({
            "top": picslistdata.y + "px",
            "left": picslistdata.x + "px",
        }))
    } else {
        var preDistance = Math.sqrt(Math.pow((touches[(0)].pageX - touches[(1)].pageX), 2) + Math.pow((touches[(0)].pageY - touches[(1)].pageY), 2));
        var curDistance = Math.sqrt(Math.pow((newtouches[(0)].pageX - newtouches[(1)].pageX), 2) + Math.pow((newtouches[(0)].pageY - newtouches[(1)].pageY), 2));
        var scale = (curDistance - preDistance) / Math.sqrt(Math.pow(getDataset.w / 2, 2) + Math.pow(getDataset.h / 2, 2));
        if (getDataset.w + getDataset.w * scale < 10 || getDataset.h + getDataset.h * scale < 10)({});
        else {
            getDataset.x = getDataset.x - getDataset.w * scale / 2;
            getDataset.w = getDataset.w + getDataset.w * scale;
            getDataset.y = getDataset.y - getDataset.h * scale / 2;
            getDataset.h = getDataset.h + getDataset.h * scale;
            instances.setStyle(({
                "width": getDataset.w + "px",
                "height": getDataset.h + "px",
                "top": getDataset.y + "px",
                "left": getDataset.x + "px",
            }));
            picslistdata.x = picslistdata.x - picslistdata.w * scale / 2;
            picslistdata.w = picslistdata.w + picslistdata.w * scale;
            picslistdata.y = picslistdata.y - picslistdata.h * scale / 2;
            picslistdata.h = picslistdata.h + picslistdata.h * scale;
            picslist.setStyle(({
                "top": picslistdata.y + "px",
                "left": picslistdata.x + "px",
                "width": picslistdata.w + "px",
                "height": picslistdata.h + "px",
            }))
        }
    };
    touches = newtouches
};

function touchend(event, ownerInstance) {
    if (instances == null) return;;
    instances.callMethod("movedata", ({
        "getDataset": getDataset,
        "picslistdata": picslistdata,
    }));
    instances = "";
    kdinstances = "";
    picslist = ""
};

function kdtouchstart(event, ownerInstance) {
    kdtouches = event.touches;
    picslist = ownerInstance.selectComponent('.picslist');
    picslistdata = picslist.getDataset();
    kdinstances = ownerInstance.selectComponent('.' + picslistdata.types + picslistdata.index);
    if (kdinstances == null) return;;
    kdgetDataset = kdinstances.getDataset()
};

function kdtouchmove(event, ownerInstance) {
    var newkdtouches = event.touches;
    var zx = kdgetDataset.x + kdgetDataset.w / 2 + kdgetDataset.windowwidth * 0.17;
    var zy = kdgetDataset.y + kdgetDataset.h / 2 + kdgetDataset.windowheight * 0.1;
    if (event.currentTarget.dataset.kn == "kd1") {
        var preDistance = Math.sqrt(Math.pow(zx - kdtouches[(0)].pageX, 2) + Math.pow(zy - kdtouches[(0)].pageY, 2));
        var curDistance = Math.sqrt(Math.pow(zx - newkdtouches[(0)].pageX, 2) + Math.pow(zy - newkdtouches[(0)].pageY, 2));
        var scale = (curDistance - preDistance) / Math.sqrt(Math.pow(kdgetDataset.w / 2, 2) + Math.pow(kdgetDataset.h / 2, 2));
        kdgetDataset.x = kdgetDataset.x - kdgetDataset.w * scale / 2;
        kdgetDataset.w = kdgetDataset.w + kdgetDataset.w * scale;
        picslistdata.x = picslistdata.x - picslistdata.w * scale / 2;
        picslistdata.w = picslistdata.w + picslistdata.w * scale
    } else if (event.currentTarget.dataset.kn == "kd2") {
        var preDistance = Math.sqrt(Math.pow(zx - kdtouches[(0)].pageX, 2) + Math.pow(zy - kdtouches[(0)].pageY, 2));
        var curDistance = Math.sqrt(Math.pow(zx - newkdtouches[(0)].pageX, 2) + Math.pow(zy - newkdtouches[(0)].pageY, 2));
        var scale = (curDistance - preDistance) / Math.sqrt(Math.pow(kdgetDataset.w / 2, 2) + Math.pow(kdgetDataset.h / 2, 2));
        kdgetDataset.y = kdgetDataset.y - kdgetDataset.h * scale / 2;
        kdgetDataset.h = kdgetDataset.h + kdgetDataset.h * scale;
        picslistdata.y = picslistdata.y - picslistdata.h * scale / 2;
        picslistdata.h = picslistdata.h + picslistdata.h * scale
    } else if (event.currentTarget.dataset.kn == "xz") {
        var perAngle = Math.atan2((kdtouches[(0)].pageY - zy), (kdtouches[(0)].pageX - zx)) * 180 / Math.PI;
        var curAngle = Math.atan2((newkdtouches[(0)].pageY - zy), (newkdtouches[(0)].pageX - zx)) * 180 / Math.PI;
        if (Math.abs(perAngle - curAngle) > 1) {
            var rotate = kdgetDataset.rotate + (curAngle - perAngle);
            if (Math.abs(rotate % 90) < 15) {
                newkdtouches = kdtouches;
                rotate = rotate - rotate % 90
            } else if (Math.abs(rotate % 90) > 75) {
                newkdtouches = kdtouches;
                if (rotate < 0) {
                    rotate = rotate - (rotate % 90 + 90)
                } else {
                    rotate = rotate + (90 - rotate % 90)
                }
            };
            kdgetDataset.rotate = rotate;
            picslistdata.rotate = rotate
        }
    } else if (event.currentTarget.dataset.kn == "kd") {
        var preDistance = Math.sqrt(Math.pow(zx - kdtouches[(0)].pageX, 2) + Math.pow(zy - kdtouches[(0)].pageY, 2));
        var curDistance = Math.sqrt(Math.pow(zx - newkdtouches[(0)].pageX, 2) + Math.pow(zy - newkdtouches[(0)].pageY, 2));
        var scale = (curDistance - preDistance) / Math.sqrt(Math.pow(kdgetDataset.w / 2, 2) + Math.pow(kdgetDataset.h / 2, 2));
        if (kdgetDataset.h + kdgetDataset.h * scale < 10 || kdgetDataset.w + kdgetDataset.w * scale < 10) return;;
        kdgetDataset.y = kdgetDataset.y - kdgetDataset.h * scale / 2;
        kdgetDataset.h = kdgetDataset.h + kdgetDataset.h * scale;
        kdgetDataset.x = kdgetDataset.x - kdgetDataset.w * scale / 2;
        kdgetDataset.w = kdgetDataset.w + kdgetDataset.w * scale;
        picslistdata.y = picslistdata.y - picslistdata.h * scale / 2;
        picslistdata.h = picslistdata.h + picslistdata.h * scale;
        picslistdata.x = picslistdata.x - picslistdata.w * scale / 2;
        picslistdata.w = picslistdata.w + picslistdata.w * scale
    };
    kdinstances.setStyle(({
        'transform': 'scale(' + kdgetDataset.scale + ') rotate(' + kdgetDataset.rotate + 'deg)',
        "width": kdgetDataset.w + "px",
        "height": kdgetDataset.h + "px",
        "top": kdgetDataset.y + "px",
        "left": kdgetDataset.x + "px",
    }));
    picslist.setStyle(({
        'transform': 'rotate(' + picslistdata.rotate + 'deg)',
        "width": picslistdata.w + "px",
        "height": picslistdata.h + "px",
        "top": picslistdata.y + "px",
        "left": picslistdata.x + "px",
    }));
    kdtouches = newkdtouches
};

function kdtouchend(event, ownerInstance) {
    kdinstances.callMethod("movedata", ({
        "getDataset": kdgetDataset,
        "picslistdata": picslistdata,
    }));
    instances = "";
    kdinstances = "";
    picslist = ""
};
module.exports = ({
    touchmove: touchmove,
    touchend: touchend,
    touchstart: touchstart,
    kdtouchstart: kdtouchstart,
    kdtouchmove: kdtouchmove,
    kdtouchend: kdtouchend,
});