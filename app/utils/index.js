import moment from "moment";

import Storage from "../lib/storage";

const prefix = "__yundao__";
const storage = new Storage();

function formatDate(value, format = "YYYY-MM-DD HH:mm") {
  if (value) {
    return moment(value).format(format);
  }
  return value;
}

function parseQuery(str) {
  //解析字符串的参数
  var ret = {},
    reg = /([^?|#=&]+)=([^&]+)/gi,
    match;
  while ((match = reg.exec(str)) != null) {
    ret[match[1]] = decodeURIComponent(match[2]);
  }
  return ret;
}

function parseUrl(url) {
  let urlObj,
    urlHash,
    urlQuery,
    params;

  url = url || location.href;
  urlObj = {
    href: url
  };
  url = url.split("#");
  urlHash = url
    .slice(1)
    .join("#");
  url = url[0];
  url = url.split("?");
  urlQuery = url
    .slice(1)
    .join("?");
  url = url[0];
  if (urlQuery) {
    urlObj.query = urlQuery;
    params = urlParamsToObject(urlQuery);
  }
  urlObj.urlHash = urlHash;
  urlObj.urlQuery = urlQuery;
  urlObj.params = params;
  urlObj.url = url;
  return urlObj;
}

function urlParamsToObject(str) {
  let kv,
    k,
    v,
    params;

  params = {};
  str = str.split("&");
  for (let i = 0; i < str.length; i++) {
    kv = str[i];
    if (kv) {
      if (kv.indexOf("=") != 0) {
        kv = kv.split("=");
        k = kv[0];
        v = kv[1];
        if (params[k]) {
          params[k] = params[k].split(",");
          params[k].push(v);
          params[k] = params[k].join(",");
        } else {
          params[k] = v;
        }
      }
    }
  }
  return params;
}

function setCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
  } else {
    var expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document
    .cookie
    .split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function bytesToSize(bytes) {

  if (bytes === 0) 
    return '0 B';
  
  var k = 1000, // or 1024

    sizes = [
      'B',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB',
      'EB',
      'ZB',
      'YB'
    ],

    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];

}

 function formatTime(a) {  
  // 计算
  var h = 0,
  i = 0,
  s = parseInt(a);
  if (s > 60) {
      i = parseInt(s / 60);
      s = parseInt(s % 60);
      if (i > 60) {
          h = parseInt(i / 60);
          i = parseInt(i % 60);
      }
  }
  // 补零
  var zero = function (v) {
      return (v >> 0) < 10 ? "0" + v : v;
  };
  return [zero(h), zero(i), zero(s)].join(":");
}

const setStorage = (name, data) => {
  storage.set(name, data);
};

const getStorage = name => {
  return storage.get(name);
};

const removeStorage = name => {
  storage.remove(name);
};
const hasStorage = name => {
  return storage.has(name);
};

const checkPermission = (auth) => {
  //权限检测存在  检查是否有权限
  let checked = true
  let permissionData = []
  const permissions = getStorage("permissions")
  if (permissions) {
    permissionData = permissionData.concat(permissions.split(','))
  }
  const roles = auth.split(',')
  //遍历当前需要的权限 假如不存在 就检查不通过
  for (var index = 0; index < roles.length; index++) {
    var role = roles[index];
    if (permissionData.indexOf(role) == -1) {
      checked = false
      break;
    }
  }
  return checked
}

function deepCompare  (){
  var i, l, leftChain, rightChain;

  function compare2Objects (x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    // Compare primitives and functions.     
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         return false;
    }

    // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
            case 'object':
            case 'function':

                leftChain.push(x);
                rightChain.push(y);

                if (!compare2Objects (x[p], y[p])) {
                    return false;
                }

                leftChain.pop();
                rightChain.pop();
                break;

            default:
                if (x[p] !== y[p]) {
                    return false;
                }
                break;
        }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
          return false;
      }
  }

  return true;
}

export default {
  formatDate,
  parseQuery,
  parseUrl,
  setCookie,
  getCookie,
  setStorage,
  getStorage,
  removeStorage,
  hasStorage,
  checkPermission,
  bytesToSize,
  formatTime,
  deepCompare,
};
