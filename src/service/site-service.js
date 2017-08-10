const mongoose = require('mongoose');
const logger = require('log4js').getLogger('site-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const siteModel = mongoose.model('site');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'name logo des type createBy');

  if (!data.name) apiError.throw('name cannot be empty');
  if (!data.createBy) apiError.throw('createBy cannot be empty');
  let siteCount = await siteModel.count({ name: data.name, del: 0 });
  if (siteCount > 0) apiError.throw('this site already exist');

  let site = await siteModel.create(data);

  return site.obj;
}

async function updateFn(data) {
  let newData = _util.pick(data, 'name logo des type del');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  let newSite = await siteModel.findOneAndUpdate({ _id: data.id, del: 0, createBy: data.createBy }, newData, { new: true, runValidators: true });
  if (!newSite) apiError.throw('this site cannot find');

  return newSite.obj;
}

async function findFn(data) {
  data = _util.pick(data, 'name des type createBy');

  if (data.name) data.name = new RegExp(data.name, 'i');
  if (data.des) data.des = new RegExp(data.des, 'i');
  data.del = 0;
  let siteList = await siteModel.find(data);

  return siteList;
}