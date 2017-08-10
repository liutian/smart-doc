const mongoose = require('mongoose');
const logger = require('log4js').getLogger('man-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const manModel = mongoose.model('man');
const siteModel = mongoose.model('site');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'name cover des state createBy siteId');

  if (!data.siteId) apiError.throw('siteId cannot be empty');
  if (!data.name) apiError.throw('name cannot be empty');
  if (!data.createBy) apiError.throw('createBy cannot be empty');

  let siteCount = await siteModel.count({ _id: data.siteId, del: 0, createBy: data.createBy });
  if (siteCount <= 0) apiError.throw('this site cannot find');

  let manCount = await manModel.count({ name: data.name, del: 0, createBy: data.createBy });
  if (manCount > 0) apiError.throw('this man already exist');

  let man = await manModel.create(data);

  return man.obj;
}

async function updateFn(data) {
  let newData = _util.pick(data, 'name cover des state del');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  let newMan = await manModel.findOneAndUpdate({ _id: data.id, del: 0, createBy: data.createBy }, newData, { new: true, runValidators: true });
  if (!newMan) apiError.throw('this man cannot find');

  return newMan.obj;
}

async function findFn(data) {
  data = _util.pick(data, 'name des state createBy');

  if (data.name) data.name = new RegExp(data.name, 'i');
  let manList = await manModel.find(data);

  return manList;
}