const mongoose = require('mongoose');
const logger = require('log4js').getLogger('article-service');

const config = require('../config');
const util = require('../util/util');
const apiError = require('../util/api-error');
const _util = require('../util/util');
const esClient = require('../util/es-factory')();

const articleModel = mongoose.model('article');
const siteModel = mongoose.model('site');
const manModel = mongoose.model('man');
const userModel = mongoose.model('user');
const praiseModel = mongoose.model('praise');

exports.create = createFn;
exports.update = updateFn;
exports.find = findFn;
exports.detail = detailFn;
exports.praise = praiseFn;
exports.search = searchFn;

/*---------------------------------------- 分割线 ------------------------------------------------*/

async function createFn(data) {
  // 提取参数
  data = _util.pick(data, 'title des content state createBy manId enableComment enablePraise index parentId');

  // 参数校验
  if (!data.manId) apiError.throw('manId cannot be empty');
  if (!data.title) apiError.throw('title cannot be empty');
  if (!data.createBy) apiError.throw('createBy cannot be empty');

  // 手册校验
  let man = await manModel.findOne({
    _id: data.manId,
    del: 0,
    $or: [
      { createBy: data.createBy },
      { admins: data.createBy }
    ]//必须是手册创建者或者管理者
  }, 'siteId');
  if (!man) apiError.throw('this man cannot find');
  // 站点校验
  let siteCount = await siteModel.count({ _id: man.siteId, del: 0 });
  if (siteCount <= 0) apiError.throw('this site cannot find');
  // 文章校验
  let articleCount = await articleModel.count({ title: data.title, manId: data.manId, del: 0 });
  if (articleCount > 0) apiError.throw('this article already exist');


  // 创建文章
  let articleIndex = await articleModel.count({ manId: data.manId, del: 0 });
  data.index = ++articleIndex;
  data.siteId = man.siteId;
  let article = await articleModel.create(data);

  // 录入搜索引擎
  // await esClient.create({
  //   index: 'man',
  //   type: 'article',
  //   id: article.id,
  //   body: {
  //     title: article.title,
  //     des: article.des,
  //     content: article.content,
  //     manId: article.manId,
  //     siteId: article.siteId,
  //     createBy: article.createBy,
  //     state: article.state
  //   }
  // });

  return article.obj;
}

async function updateFn(data) {
  // 提取参数
  let newData = _util.pick(data, 'title content des state del enableComment enablePraise index parentId');

  // 参数校验
  if (!data.id) apiError.throw('id cannot be empty');
  if (data.del != 1) delete data.del;// 只处理删除
  // 文章校验
  let article = await articleModel.findOne({
    _id: data.id,
    del: 0,
    $or: [
      { createBy: data.createBy },
      { admins: data.createBy }
    ]
  }, 'manId');
  if (!article) apiError.throw('article cannot find');

  // 更新文章
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

  // 录入搜索引擎
  if (newData.title || newData.content || newData.des) {
    let doc = {};
    if (newData.title) doc.title = newData.title;
    if (newData.content) doc.title = newData.content;
    if (newData.des) doc.des = newData.des;

    // await esClient.update({
    //   index: 'man',
    //   type: 'article',
    //   id: data.id,
    //   body: {
    //     doc: doc
    //   }
    // });
  }

}

async function findFn(data) {
  data = _util.pick(data, 'title des state createBy manId siteId admins');

  if (data.title) data.title = new RegExp(data.title, 'i');
  if (data.des) data.des = new RegExp(data.des, 'i');
  data.del = 0;
  let articleList = await articleModel.find(data).sort({ index: 1, _id: -1 });

  return articleList.map(v => {
    return v.obj;
  });
}


async function detailFn(id, currUserId) {
  let article = await articleModel.findByIdAndUpdate(id, {
    $inc: { viewCount: currUserId ? 0 : 1 },
    del: 0
  });
  if (!article) apiError.throw('article cannot find');
  let man = await manModel.findOne({ _id: article.manId, del: 0 }, 'createBy admins');
  if (!man) apiError.throw('man cannot find');

  if (currUserId && man.createBy != currUserId && !man.admins.indexOf(currUserId)) {// 后台查看必须有权限
    apiError.throw('Permission Denied');
  } else if (!currUserId && article.state === 0) {// 未上架不得查看
    apiError.throw('Permission Denied');
  }

  return article.obj;
}

async function praiseFn(data) {
  if (!data.createBy) apiError.throw('createBy cannot be empty');
  if (!data.articleId) apiError.throw('articleId cannot be empty');

  let article = await articleModel.findByIdAndUpdate(data.articleId, {
    praiseCount: {
      $inc: data.praise ? 1 : -1
    }
  }, 'manId siteId');
  if (!article) apiError.throw('article cannot find');
  if (!article.enablePraise) apiError.throw(' enablePraise false');

  let query = {
    createBy: data.createBy,
    articleId: article.id,
    manId: article.manId,
    siteId: article.siteId
  };
  await praiseModel.update(query, { del: data.praise ? 0 : 1 }, { upsert: true });
}

async function searchFn(data) {
  data = _util.pick(data, 'searchKey state createBy manId siteId');
  if (!data.searchKey) apiError.throw('searchKey cannot be empty');

  let searchData = {
    index: 'man',
    type: 'article',
    body: {
      query: {
        bool: {
          must: {
            multi_match: {
              query: data.searchKey,
              fields: ['title^3', 'des^2', 'content'],
              minimum_should_match: '20%',
              type: 'most_fields',
            }
          },
          filter: []
        }
      },
      highlight: {
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
        fields: { title: {}, des: {}, content: {} }
      }
    }
  };

  if (data.state) {
    searchData.body.query.bool.filter.push({ term: { state: data.state } });
  }
  if (data.createBy) {
    searchData.body.query.bool.filter.push({ term: { createBy: data.createBy } });
  }
  if (data.manId) {
    searchData.body.query.bool.filter.push({ term: { manId: data.manId } });
  }
  if (data.siteId) {
    searchData.body.query.bool.filter.push({ term: { siteId: data.siteId } });
  }

  let result = await esClient.search(searchData);

  if (result && result.hits && result.hits.total > 0) {
    return result.hits.hits.map(v => {
      return {
        id: v._id,
        title: v.highlight.title || v._source.title,
        des: v.highlight.des || v._source.des,
        content: v.highlight.content || v._source.content,
        createBy: v._source.createBy,
        state: v._source.state,
        manId: v._source.manId,
        siteId: v._source.siteId,
        _score: v._score
      }
    })
  }

  return [];
}