const logger = require('log4js').getLogger('api-article');

const articleService = require('../service/article-service');

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
   * @apiParam {[Number]} authorList 作者列表
   * @apiParam {Number} enableComment 手册是否启用评论
   * @apiParam {Number} enablePraise 手册是否用赞
   */

  /**
   * @api {post} /auth/article 更新文章
   * @apiName update article
   * @apiGroup article
   *
   * @apiParam {Number} id 文章ID
   * @apiParam {String} title 文章标题
   * @apiParam {String} des 文章内容
   * @apiParam {String} content 文章内容
   * @apiParam {Number} state 状态 0发布 1草稿
   * @apiParam {[Number]} authorList 作者列表
   * @apiParam {Number} enableComment 文章是否启用评论
   * @apiParam {Number} enablePraise 文章是否用赞
   */
  router.post('/auth/article', saveArticle);

  /**
   * @api {get} /auth/article 查询文章信息
   * @apiName search article
   * @apiGroup article
   *
   * @apiParam {String} title 文章标题
   * @apiParam {String} des 文章描述
   * @apiParam {Number} state 状态 0发布 1草稿
   * @apiParam {String} createBy 文章创建者
   * @apiParam {String} manId 文章所属的手册ID
   * @apiParam {String} siteId 文章所属的站点ID
   * 
   */
  router.get('/auth/article', findArticle);

}



/*---------------------------------------- 分割线 ------------------------------------------------*/


async function saveArticle(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  if (ctx.request.body.id) {
    ctx.body = await articleService.update(ctx.request.body);
  } else {
    ctx.body = await articleService.create(ctx.request.body);
  }
}

async function findArticle(ctx, next) {
  ctx.body = await articleService.find(ctx.query);
}