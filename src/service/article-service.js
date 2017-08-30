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
exports.detailAbout = detailAboutFn;
exports.praise = praiseFn;
exports.search = searchFn;

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
  data = _util.pick(data, 'title des state createBy manId siteId');

  if (data.title) data.title = new RegExp(data.title, 'i');
  if (data.des) data.des = new RegExp(data.des, 'i');
  data.del = 0;
  let articleList = await articleModel.find(data).sort({ index: -1, _id: -1 });

  return articleList.map(v => {
    return v.obj;
  });
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

async function detailFn(id, currUserId) {
  let article = await articleModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  if (!article) apiError.throw('article cannot find');
  if (currUserId && article.createBy != currUserId && !article.authorList.includes(currUserId)) {
    apiError.throw('Permission Denied');
  } else if (!currUserId && article.state === 1) {
    apiError.throw('Permission Denied');
  }

  return article.obj;
}

async function detailAboutFn(id, currUserId) {
  let article = await articleModel.findByIdAndUpdate(id, { viewCount: { $inc: 1 } });
  if (!article) apiError.throw('article cannot find');
  if (currUserId && article.createBy != currUserId && !article.authorList.includes(currUserId)) {
    apiError.throw('Permission Denied');
  } else if (!currUserId && article.state === 1) {
    apiError.throw('Permission Denied');
  }

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