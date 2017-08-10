const logger = require('log4js').getLogger('api-man');

const manService = require('../service/man-service');

module.exports = function (router) {

  /**
   * @api {post} /auth/man 新增手册
   * @apiName add man
   * @apiGroup man
   *
   * @apiParam {String} name 手册名称
   * @apiParam {String} cover 手册封面
   * @apiParam {String} des 手册描述
   * @apiParam {Number} state 手册是否上架
   * @apiParam {Number} enableComment 手册是否启用评论
   * @apiParam {Number} enablePraise 手册是否用赞
   * @apiParam {Number} siteId 手册所属站点 
   */

  /**
   * @api {post} /auth/man 更新手册
   * @apiName update man
   * @apiGroup man
   *
   * @apiParam {Number} id 手册ID
   * @apiParam {String} name 手册名称
   * @apiParam {String} cover 手册封面
   * @apiParam {String} des 手册描述
   * @apiParam {Number} state 手册是否上架
   * @apiParam {Number} enableComment 手册是否启用评论
   * @apiParam {Number} enablePraise 手册是否用赞
   */
  router.post('/auth/man', saveMan);

  /**
   * @api {get} /auth/man 查询手册信息
   * @apiName search man
   * @apiGroup man
   *
   * @apiParam {String} name 手册名称
   * @apiParam {String} des 手册描述
   * @apiParam {Number} state 手册是否上架
   * @apiParam {String} createBy 手册创建者
   * @apiParam {String} siteId 手册所属的站点ID
   * 
   */
  router.get('/auth/man', findMan);

}



/*---------------------------------------- 分割线 ------------------------------------------------*/


async function saveMan(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  if (ctx.request.body.id) {
    ctx.body = await manService.update(ctx.request.body);
  } else {
    ctx.body = await manService.create(ctx.request.body);
  }
}

async function findMan(ctx, next) {
  ctx.body = await manService.find(ctx.query);
}