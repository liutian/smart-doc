const mongoose = require('mongoose');
const logger = require('log4js').getLogger('comment-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');

const commentModel = mongoose.model('comment');
const siteModel = mongoose.model('site');
const manModel = mongoose.model('man');
const userModel = mongoose.model('user');
const praiseModel = mongoose.model('praise');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  data = _util.pick(data, 'content createBy articleId parentId');

  if (!data.content) apiError.throw('content cannot be empty');
  if (!data.articleId) apiError.throw('articleId cannot be empty');
  if (!data.createBy) apiError.throw('createBy cannot be empty');

  let article = await articleModel.findById(data.articleId, 'manId siteId');
  if (!article) apiError.throw('article cannot find');
  if (!article.enableComment) apiError.throw('enableComment false');
  data.manId = article.manId;
  data.siteId = article.siteId;

  if (data.parentId) {
    let parentComment = await commentModel.findById(data.parentId);
    if (!parentComment) apiError.throw('parentComment cannot find');
    let user = await userModal.findById(parentComment.createBy, 'nickname');
    data.ancestorList = comment.ancestorList.push(data.parentId);
    data.parentNickname = user.nickname;
    data.parentContent = parentComment.content;
  }

  let comment = await articleModel.create(data);

  return comment.id;
}

async function updateFn(data) {
  let newData = _util.pick(data, ' del');

  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除

  await articleModel.findByIdAndUpdate({
    _id: data.id,
    createBy: data.createBy,
    del: 0
  }, newData, { runValidators: true });

}

async function findFn(data) {
  data = _util.pick(data, 'articleId page size');

  if (!data.size) data.size = 10;
  if (!data.page) data.page = 1;

  let skip = data.size * (data.page - 1);
  let commentList = await commentModel.find({
    articleId: data.articleId,
    ancestorList: { $size: 0 }
  }).skip(skip).count(data.size);

  return commentList;
}
