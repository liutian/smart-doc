const logger = require('log4js').getLogger('api-site');

const siteService = require('../service/site-service');

module.exports = function (router) {

  /**
   * @api {post} /auth/site 新增站点
   * @apiName add site
   * @apiGroup site
   *
   * @apiParam {String} name 站点名称
   * @apiParam {String} logo 站点logo
   * @apiParam {String} des 站点描述
   * @apiParam {Number} type 站点是否公开
   */

  /**
   * @api {post} /auth/site 更新站点信息
   * @apiName update site
   * @apiGroup site
   *
   * @apiParam {Number} id 站点ID
   * @apiParam {String} name 站点名称
   * @apiParam {String} logo 站点logo
   * @apiParam {String} des 站点描述
   * @apiParam {Number} type 站点是否公开
   */
  router.post('/auth/site', saveSite);

  /**
   * @api {get} /auth/site 查询站点信息
   * @apiName search site
   * @apiGroup site
   *
   * @apiParam {String} name 站点名称
   * @apiParam {String} des 站点描述
   * @apiParam {Number} type 站点是否公开
   * @apiParam {String} createBy 站点创建者
   * 
   */
  router.get('/auth/site', findSite);

}



/*---------------------------------------- 分割线 ------------------------------------------------*/


async function saveSite(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  if (ctx.request.body.id) {
    ctx.body = await siteService.update(ctx.request.body);
  } else {
    ctx.body = await siteService.create(ctx.request.body);
  }
}

async function findSite(ctx, next) {
  ctx.body = await siteService.find(ctx.query);
}