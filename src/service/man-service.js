const mongoose = require('mongoose');
const logger = require('log4js').getLogger('man-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const manModel = mongoose.model('man');
const siteModel = mongoose.model('site');
const articleModel = mongoose.model('article');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;
exports.detail = detailFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'name cover des state createBy siteId enableComment enablePraise admins');

  // 验证参数
  if (!data.siteId) apiError.throw('siteId cannot be empty');
  if (!data.name) apiError.throw('name cannot be empty');
  if (!data.createBy) apiError.throw('createBy cannot be empty');

  // 验证站点
  let siteCount = await siteModel.count({ _id: data.siteId, del: 0, createBy: data.createBy });
  if (siteCount <= 0) apiError.throw('this site cannot find');

  // 验证手册
  let manCount = await manModel.count({ name: data.name, del: 0, createBy: data.createBy });
  if (manCount > 0) apiError.throw('this man already exist');

  data.admins = data.admins ? data.admins : [];
  let man = await manModel.create(data);

  return man.obj;
}

async function updateFn(data, currUserId) {
  let newData = _util.pick(data, 'name cover des state del enableComment enablePraise admins');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  let queryParams = {
    _id: data.id,
    del: 0
  }

  if (currUserId) {
    if (newData.del === 1) {
      apiError.throw('Permission Denied');
    }
    queryParams.$or = [{ createBy: currUserId }, { admins: currUserId }];
  }

  let newMan = await manModel.findOneAndUpdate(queryParams, newData, { new: true, runValidators: true });
  if (!newMan) apiError.throw('this man cannot find');

  return newMan.obj;
}

async function findFn(data, currUserId) {
  data = _util.pick(data, 'name des state createBy siteId enableComment enablePraise');

  if (data.name) data.name = new RegExp(data.name, 'i');
  if (data.des) data.des = new RegExp(data.des, 'i');
  data.del = 0;
  if (currUserId) {
    data.$or = [{ createBy: currUserId }, { admins: currUserId }];
  }
  let manList = await manModel.find(data);

  return manList.map(v => {
    return v.obj;
  });
}

async function detailFn(id, currUserId) {
  let man = await manModel.findById(id).populate('admins', 'loginName nickname');
  if (!man) apiError.throw('man cannot find');
  if (currUserId && man.createBy != currUserId && man.admins.findIndex(a => {
    return a.obj.id === currUserId;
  }) === -1) {
    apiError.throw('Permission Denied');
  } else if (!currUserId && man.state !== 1) {
    apiError.throw('Permission Denied');
  }

  let result = man.obj;
  result.admins = result.admins.map(admin => {
    admin.id = admin._id;
    return admin;
  })

  return result;
}