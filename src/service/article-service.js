const mongoose = require('mongoose');
const logger = require('log4js').getLogger('article-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const articleModel = mongoose.model('article');
const siteModel = mongoose.model('site');
const manModel = mongoose.model('man');
const userModel = mongoose.model('user');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'title des content state createBy manId authorList enableComment enablePraise');

  if (!data.manId) apiError.throw('man cannot be empty');
  if (!data.title) apiError.throw('title cannot be empty');
  if (!data.createBy) apiError.throw('createBy cannot be empty');

  let man = await manModel.findOne({ _id: data.manId, del: 0, createBy: data.createBy }, 'siteId');
  if (!man) apiError.throw('this man cannot find');

  let siteCount = await siteModel.count({ _id: man.siteId, del: 0, createBy: data.createBy });
  if (siteCount <= 0) apiError.throw('this site cannot find');

  let articleCount = await articleModel.count({ title: data.title, manId: data.manId, del: 0, createBy: data.createBy });
  if (articleCount > 0) apiError.throw('this article already exist');

  if (data.authorList && data.authorList.length > 0) {
    let names = await getAuthorList(data.authorList);
    data.authorNames = names;
  }

  data.siteId = man.siteId;
  let article = await articleModel.create(data);

  return article.obj;
}

async function updateFn(data) {
  let newData = _util.pick(data, 'title content des state del authorList enableComment enablePraise');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  if (newData.authorList && newData.authorList.length > 0) {
    let names = await getAuthorList(data.authorList);
    newData.authorNames = names;
  }
  let newarticle = await articleModel.findOneAndUpdate({ _id: data.id, del: 0, createBy: data.createBy }, newData, { new: true, runValidators: true });
  if (!newarticle) apiError.throw('this article cannot find');

  return newarticle.obj;
}

async function findFn(data) {
  data = _util.pick(data, 'title des state createBy manId siteId');

  if (data.title) data.title = new RegExp(data.title, 'i');
  if (data.des) data.des = new RegExp(data.des, 'i');
  data.del = 0;
  let articleList = await articleModel.find(data);

  return articleList;
}

async function getAuthorList(authorList) {
  let nicknameList = [];
  for (var i = 0; i < authorList.length; i++) {
    let authorId = authorList[i];
    let author = await userModel.findOne({ _id: authorId, del: 0 }, 'nickname');
    if (!author) apiError.throw('this user not exist');
    nicknameList.push(author.nickname);
  }
  return nicknameList.join('、');
}