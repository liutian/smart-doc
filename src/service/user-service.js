const mongoose = require('mongoose');
const logger = require('log4js').getLogger('user-service');
const crypto = require('crypto');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const userModel = mongoose.model('user');
const randomLength = 16;


exports.register = registerFn;
exports.login = loginFn;
exports.findUser = findUserFn;
exports.updateUser = updateUserFn;


/*---------------------------------------- 分割线 ------------------------------------------------*/

async function registerFn(data) {
  data = _util.pick(data, 'loginName nickname password');

  if (!data.loginName) apiError.throw('loginName cannot be empty');
  if (!data.password) apiError.throw('password cannot be empty');

  let isExist = await userModel.count({ loginName: data.loginName, del: 0 });
  if (isExist > 0) apiError.throw('this user already exist');

  let key = crypto.randomBytes(randomLength).toString('hex');
  let secrect = crypto.createHmac('sha256', key);
  secrect.update(data.password);
  let password = secrect.digest().toString('hex');

  await userModel.create(Object.assign(data, { password: password, passwordKey: key }), { runValidators: true, new: true });
}

async function loginFn(data) {
  data = _util.pick(data, 'loginName password');

  let user = await userModel.findOne({ loginName: data.loginName, del: 0 });
  if (!user) apiError.throw('this user do not exist');

  let secrect = crypto.createHmac('sha256', user.passwordKey);
  secrect.update(data.password);
  let password = secrect.digest().toString('hex');

  if (password != user.password) apiError.throw('this user do not exist ');

  return _util.pick(user.obj, 'id loginName nickname ');
}

async function findUserFn(data) {
  data = _util.pick(data, 'loginName nickname');

  if (data.loginName) data.loginName = new RegExp(data.loginName, 'i');
  if (data.nickname) data.nickname = new RegExp(data.nickname, 'i');

  data.del = 0;
  let userList = await userModel.find(data);

  return userList.map(u => {
    return _util.pick(u.obj, 'id loginName nickname');
  });
}

async function updateUserFn(data) {
  let newData = _util.pick(data, 'id nickname password');

  if (!data.id) apiError.throw('id cannot be empty');

  if (newData.password) {
    let key = crypto.randomBytes(randomLength).toString('hex');
    let secrect = crypto.createHmac('sha256', key);
    secrect.update(data.password);
    let password = secrect.digest().toString('hex');
    newData.password = password;
    newData.passwordKey = key;
  }

  let user = await userModel.findByIdAndUpdate(data.id, newData, { runValidators: true, new: true });
  return _util.pick(user.obj, 'loginName nickname id');
}