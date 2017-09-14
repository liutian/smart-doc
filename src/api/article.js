const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const path = require('path');
const rename = util.promisify(fs.rename);

const logger = require('log4js').getLogger('api-article');
const articleService = require('../service/article-service');
const _util = require('../util/util');
const config = require('../config');

module.exports = function (router) {

  /**
   * @api {post} /auth/article 新增文章
   * @apiName add article
   * @apiGroup article
   *
   * @apiParam {String} title 文章标题
   * @apiParam {String} des 文章描述
   * @apiParam {String} content 文章内容
   * @apiParam {Number} state 状态 0发布 1草稿
   * @apiParam {Number} manId 文章所属手册
   * @apiParam {Number} enableComment 手册是否启用评论
   * @apiParam {Number} enablePraise 手册是否用赞
   * @apiParam {Number} parentId 文章父级ID
   * @apiParam {Number} index 文章索引位置
   */
  router.post('/auth/article', createArticle);

  /**
   * @api {post} /auth/article/:id 更新文章
   * @apiName update article
   * @apiGroup article
   *
   * @apiParam {Number} id 文章ID
   * @apiParam {String} title 文章标题
   * @apiParam {String} des 文章内容
   * @apiParam {String} content 文章内容
   * @apiParam {Number} state 状态 0发布 1草稿
   * @apiParam {Number} enableComment 文章是否启用评论
   * @apiParam {Number} enablePraise 文章是否用赞
   * @apiParam {Number} parentId 文章父级ID
   * @apiParam {Number} index 文章索引位置 
   */
  router.post('/auth/article/:id', updateArticle);

  /**
   * @api {get} /auth/article 查询文章信息
   * @apiName query article
   * @apiGroup article
   *
   * @apiParam {String} title 文章标题
   * @apiParam {String} des 文章描述
   * @apiParam {Number} state 状态 0发布 1草稿
   * @apiParam {String} manId 文章所属的手册ID
   * @apiParam {String} siteId 文章所属的站点ID
   * 
   */
  router.get('/auth/article', findArticle);

  /**
   * @api {get} /auth/article-search 全文检索
   * @apiName search article
   * @apiGroup article
   *
   * @apiParam {String} searchKey 文章标题
   * @apiParam {Number} state 状态 0发布 1草稿
   * @apiParam {String} createBy 文章创建者
   * @apiParam {String} manId 文章所属的手册ID
   * @apiParam {String} siteId 文章所属的站点ID
   * 
   */
  router.get('/auth/article-search', searchArticle);

  /**
   * @api {get} /open/article/:id 查询文章详情
   * @apiName detail article
   * @apiGroup article
   *
   */
  router.get('/open/article/:id', detailArticle);

  /**
   * @api {get} /auth/article/:id 查询文章详情
   * @apiName detail article
   * @apiGroup article
   *
   */
  router.get('/auth/article/:id', authDetailArticle);


  /**
   * @api {post} /auth/:id/praise
   * @apiName praise article
   * @apiGroup article
   * 
   * @apiParam {Number} praise 是否赞
   *
   */
  router.post('/auth/article/:id/praise', articlePraise);

}



/*---------------------------------------- 分割线 ------------------------------------------------*/


async function createArticle(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  ctx.body = await articleService.create(ctx.request.body);
}

async function updateArticle(ctx, next) {
  ctx.request.body.id = ctx.params.id;
  await articleService.update(ctx.request.body, ctx.session.user.id);
  ctx.body = {};
}


async function findArticle(ctx, next) {
  ctx.body = await articleService.find(ctx.query, ctx.session.user.id);
}

async function searchArticle(ctx, next) {
  ctx.body = await articleService.search(ctx.query);
}

async function detailArticle(ctx, next) {
  ctx.body = await articleService.detail(ctx.params.id);
}

async function authDetailArticle(ctx, next) {
  ctx.body = await articleService.detail(ctx.params.id, ctx.session.user.id);
}

async function articlePraise(ctx, next) {
  let data = {
    createBy: ctx.session.user.id,
    articleId: ctx.params.id
  }
  await articleService.praise(Object.assign(ctx.request.body, data));
  ctx.body = {};
}



