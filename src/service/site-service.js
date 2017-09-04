const mongoose = require('mongoose');
const logger = require('log4js').getLogger('site-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const siteModel = mongoose.model('site');
const manModel = mongoose.model('man');
const articleModel = mongoose.model('article');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;
exports.siteAndMan = siteAndManFn;
exports.findAboutMe = findAboutMeFn;

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

  return siteList.map(v => {
    return v.obj;
  });
}

async function findAboutMeFn(userId) {
  let siteList = await siteModel.find({ createBy: userId });

  let siteIds = await manModel.find({ admins: userId }, 'siteId');
  let otherList = await siteModel.find({ _id: { $in: siteIds.map(v => v.siteId) } });

  return siteList.concat(otherList).map(v => {
    return v.obj;
  });
}

async function siteAndManFn(siteId, manId, currUserId) {
  if (currUserId) {
    let site = await siteModel.findOne({ _id: siteId, del: 0 });
    if (!site) apiError.throw('this site cannot find');
    let man = await manModel.findOne({ _id: manId, $or: [{ admins: currUserId }, { createBy: currUserId }] });
    if (!man) apiError.throw('this man cannot find');

    let manList = await manModel.find({ siteId: siteId });
    let articleList = await articleModel.find({ manId: manId });

    return {
      site: site.obj,
      manList: manList.map(v => v.obj),
      articleList: articleList.map(a => a.obj)
    }
  } else {

    let site = await siteModel.findOne({ _id: siteId, type: 1, del: 0 });
    if (!site) apiError.throw('this site cannot find');
    let man = await manModel.findOne({ _id: manId, del: 0, state: 1 });
    if (!man) apiError.throw('this man cannot find');

    let manList = await manModel.find({ siteId: siteId, del: 0, state: 1 });
    let articleList = await articleModel.find({ manId: manId, del: 0, state: 0 });

    return {
      site: site.obj,
      manList: manList.map(v => v.obj),
      articleList: articleList.map(a => a.obj)
    }
  }
}