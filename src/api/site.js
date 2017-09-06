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
  router.post('/auth/site', createSite);

  /**
   * @api {post} /auth/site/:id 更新站点信息
   * @apiName update site
   * @apiGroup site
   *
   * @apiParam {Number} id 站点ID
   * @apiParam {String} name 站点名称
   * @apiParam {String} logo 站点logo
   * @apiParam {String} des 站点描述
   * @apiParam {Number} type 站点是否公开
   */
  router.post('/auth/site/:id', updateSite);

  /**
   * @api {get} /auth/site/:id 查看站点详情
   * @apiName detail site
   * @apiGroup site
   *
   * @apiParam {Number} id 站点ID
   */
  router.get('/auth/site/:id', detailSite);

  /**
   * @api {get} /auth/site 查询站点信息
   * @apiName search site
   * @apiGroup site
   *
   * @apiParam {String} name 站点名称
   * @apiParam {String} des 站点描述
   * @apiParam {Number} type 站点是否公开
   * 
   */
  router.get('/auth/site', findSite);

  /**
   * @api {get} /open/siteAndMan/:siteId/:manId 查询站点以及站点所属的手册列表
   * @apiName siteAndMan
   * @apiGroup site
   *
   */
  router.get('/open/siteAndMan/:siteId/:manId', siteAndMan);

  /**
  * @api {get} /auth/siteAndMan/:siteId/:manId 查询站点以及站点所属的手册列表
  * @apiName siteAndMan[auth]
  * @apiGroup site
  *
  */
  router.get('/auth/siteAndMan/:siteId/:manId', authSiteAndMan);

  /**
   * @api {get} /auth/site-about-me 查询和自己相关的站点，包括自己创建的和自己管理的
   * @apiName findAboutMe
   * @apiGroup site
   *
   */
  router.get('/auth/site-about-me', findAboutMe);
}



/*---------------------------------------- 分割线 ------------------------------------------------*/


async function createSite(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  ctx.body = await siteService.create(ctx.request.body);
}

async function updateSite(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  ctx.request.body.id = ctx.params.id;
  ctx.body = await siteService.update(ctx.request.body);
}

async function findSite(ctx, next) {
  ctx.body = await siteService.find(Object.assign(ctx.query, {
    createBy: ctx.session.user.id
  }));
}

async function siteAndMan(ctx, next) {
  ctx.body = await siteService.siteAndMan(ctx.params.siteId, ctx.params.manId);
}

async function authSiteAndMan(ctx, next) {
  ctx.body = await siteService.siteAndMan(ctx.params.siteId, ctx.params.manId, ctx.session.user.id);
}

async function findAboutMe(ctx, next) {
  ctx.body = await siteService.findAboutMe(ctx.session.user.id);
}

async function detailSite(ctx, next) {
  ctx.body = await siteService.detail(ctx.params.id);
}