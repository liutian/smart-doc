const util = require('util');

exports.codeMap = {
  code_9999: '服务器端错误',
}

exports.throw = function throwFn(msg, status) {
  let error = new Error();
  if (util.isNumber(msg)) {
    error.message = '{"code": ' + msg + ',"msg": "' + exports.codeMap['code_' + msg] + '"}';
  } else {
    error.message = '{"code": 1000,"msg": "' + msg + '"}';
  }
  error.status = status || 400;
  error.expose = true;
  throw error;
}
