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
exports.detail = detailFn;
exports.detailAbout = detailAboutFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'title des content state createBy manId authorList enableComment enablePraise index parentId');

  if (!data.manId) apiError.throw('manId cannot be empty');
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
  let newData = _util.pick(data, 'title content des state del authorList enableComment enablePraise index parentId');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  let article = await articleModel.findOne({ _id: data.id, del: 0, createBy: data.createBy }, 'manId');
  if (!article) apiError.throw('article cannot find');

  if (newData.authorList && newData.authorList.length > 0) {
    let names = await getAuthorList(data.authorList);
    newData.authorNames = names;
  }

  await articleModel.findByIdAndUpdate(data.id, newData, { runValidators: true });

  if (data.index !== undefined) {
    await articleModel.update({
      manId: article.manId,
      del: 0,
      parentId: article.parentId,
      _id: { $ne: data.id },
      index: { $gte: data.index }
    }, { $inc: { index: 1 } });
  }

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

async function detailFn(id) {
  let article = await articleModel.findById(id);
  if (!article) apiError.throw('article cannot find');
  return article.obj;
}

async function detailAboutFn(id) {
  let article = await articleModel.findById(id);
  if (!article) apiError.throw('article cannot find');

  let articleList = await articleModel.find({ manId: article.manId, del: 0 });

  let manList = await manModel.find({ siteId: article.siteId, del: 0 });

  let site = await siteModel.findById(article.siteId);

  return {
    site: site.obj,
    manList: manList,
    articleList: articleList,
    article: article
  }
}