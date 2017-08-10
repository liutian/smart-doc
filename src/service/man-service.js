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
exports.findWrite = findWriteFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'name cover des state createBy siteId enableComment enablePraise');

  if (!data.siteId) apiError.throw('site cannot be empty');
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
  let newData = _util.pick(data, 'name cover des state del enableComment enablePraise');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  let newMan = await manModel.findOneAndUpdate({ _id: data.id, del: 0, createBy: data.createBy }, newData, { new: true, runValidators: true });
  if (!newMan) apiError.throw('this man cannot find');

  return newMan.obj;
}

async function findFn(data) {
  data = _util.pick(data, 'name des state createBy siteId enableComment enablePraise');

  if (data.name) data.name = new RegExp(data.name, 'i');
  if (data.des) data.des = new RegExp(data.des, 'i');
  data.del = 0;
  let manList = await manModel.find(data);

  return manList;
}

async function findWriteFn(data) {

  let articleList = await articleModel.find({ authorList: data.userId, del: 0 }, 'title manId state');

  let manIdSet = new Set();
  articleList.forEach(a => manIdSet.add(a.manId));

  let manList = await manModel.find({ _id: { $in: Array.from(manIdSet) }, del: 0 }, 'name cover state viewCount praiseCount commentCount');
  return manList.map(man => {
    man.articleList = articleList.filter(a => a.manId == man.id);
  });
}