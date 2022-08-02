// 获取cookie
export function getCookie (cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return '';
}

/**
 * 获取一组随机数2
 */
export const keyGuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  // eslint-disable-next-line eqeqeq
  const v = c == 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

/**
 * 获取一组随机数2
 */
export const keyGuid2 = () => {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
};

// 获取当前路径下？后边的值
export const getQueryString = (name) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const index = window.location.href.indexOf('?');
  const r = window.location.href.substr(index + 1).match(reg);
  if (r) return decodeURIComponent(r[2]);
  return null;
};

// 获取当前路径下？后边的值写法2
export const getQueryString2 = (name) => {
  const temp = window.location.href.split('?');
  const params = temp[1];
  const keyValue = params.split('&');
  const paramObj = {};
  for (let i = 0; i < keyValue.length; i++) {
    const item = keyValue[i].split('=');
    const key = item[0];
    const value = item[1];
    paramObj[key] = decodeURIComponent(value);
  }
  return paramObj[name] || null;
}

/**
 * 封装一下跳转函数
 * 直接使用，window.location.href='xxxx.html',在某些情况下会出现白屏的情况
 * @param { 需要跳转的链接 } url
 */
export const handleJumpLink = (url) => {
  window.history.pushState({}, '', url);
}

/**
 * 数组去重
 * @param {*数组} songs
 */
export function arrayUnique (songs) {
  const result = {};
  const finalResult = [];
  for (let i = songs.length - 1; i >= 0; i--) {
    result[songs[i].name] = songs[i];
  }
  Object.keys(result).map((item) => finalResult.push(result[item]));
  return finalResult;
}

/**
 * 数组去重
 * @param { 数组 } arr
 * @returns 去重后函数
 */
export const arrayUnique2 = (arr) => {
  if (!Array.isArray(arr)) {
    return;
  }
  const array = [];
  for (let i = 0; i < arr.length; i++) {
    if (array.indexOf(arr[i]) === -1) {
      array.push(arr[i]);
    }
  }
  return array;
};

/**
 * @param { 时间戳 } result
 * @returns 时间戳转换输出xx天xx小时xx分xx秒
 */
export const formatSeconds = function (result) {
  const d = Math.floor(result / (60 * 60 * 24));
  const h = Math.floor((result % (60 * 60 * 24)) / (60 * 60));
  const m = Math.floor((result % (60 * 60)) / 60);
  const s = Math.floor(result % 60);
  if (d && h && m && s) {
    return `${d}${'天'}${h}${'小时'}${m}${'分'}${s}${'秒'}`;
  }
  if (h && m && s) {
    return `${h}${'小时'}${m}${'分'}${s}${'秒'}`;
  }
  if (m && s) {
    return `${m}${'分'}${s}${'秒'}`;
  }
  if (s) {
    return `${s}${'秒'}`;
  }
  return '-';
};

/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {cb}
 */
export function getBlob (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function () {
    if (xhr.status === 200) {
      cb(xhr.response);
    }
  };
  xhr.send();
}

/**
* 保存
* @param  {Blob} blob
* @param  {String} filename 想要保存的文件名称
*/
function saveAs (blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    var body = document.querySelector('body');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    // fix Firefox
    link.style.display = 'none';
    body.appendChild(link);
    link.click();
    body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  };
}

/**
* 下载
* @param  {String} url 目标文件地址
* @param  {String} filename 想要保存的文件名称
*/
export function download (url, filename) {
  getBlob(url, function (blob) {
    saveAs(blob, filename);
  });
};

/**
 * 获取前端静态资源文件夹下的所有文件
 * @param { 文件路径，一般是静态资源文件static下 } filePath
 * @param { 某种文件.md，.png，.text，写法参考 /\.md$/ } fileExp
 * @returns 获取所有符合规则文件名
 */
export const loadAllFile = function (filePath, fileExp) {
  const filesMD = require.context(filePath, true, fileExp);
  return filesMD.keys();
};

/**
 * 自定义排序
 * @param { 排序key，目前支持数字 } objKey
 * @param { 升序 asc | 降序 desc } order
 * @returns
 */
export function sortDiy (objKey, order = 'asc') {
  return function (obj1, obj2) {
    let val1 = obj1[objKey];
    let val2 = obj2[objKey];
    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1);
      val2 = Number(val2);
    }
    if (val1 < val2) {
      return order === 'asc' ? -1 : 1;
    }
    if (val1 > val2) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  };
}

/**
 * 自定义排序
 * @param { 排序key，目前支持时间 } objKey
 * @param { 升序 asc | 降序 desc } order
 * @returns
 */
export function sortDiyTime (objKey, order = 'asc') {
  return function (obj1, obj2) {
    const val1 = obj1[objKey];
    const val2 = obj2[objKey];
    if (Date.parse(val1) < Date.parse(val2)) {
      return order === 'asc' ? -1 : 1;
    }
    if (Date.parse(val1) > Date.parse(val2)) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  };
};

/**
 * 字符串倒叙输出
 */
export function flashback (val) {
  return val.split('').reverse().join('');
};
