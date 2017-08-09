const logger = require('log4js').getLogger('api-user');
const mongoose = require('mongoose');

const userService = require('../service/user');

module.exports = function (router) {

  /**
   * @api {post} /open/register 用户注册
   * @apiName user register
   * @apiGroup user
   *
   * @apiParam {String} loginName 登录名
   * @apiParam {String} nickname 用户昵称
   * @apiParam {String} password 用户密码
   */
  router.post('/open/register', register);

  /**
   * @api {post} /open/login 用户登录
   * @apiName user login
   * @apiGroup user
   *
   * @apiParam {String} loginName 登录名
   * @apiParam {String} password 用户密码
   */
  router.post('/open/login', login);

  /**
   * @api {post} /auth/user 查询用户
   * @apiName search user
   * @apiGroup user
   *
   * @apiParam {String} loginName 登录名
   * @apiParam {String} nickname 用户昵称
   */
  router.get('/auth/user', findUser);
}



/*---------------------------------------- 分割线 ------------------------------------------------*/

async function register(ctx, next) {
  await userService.register(ctx.request.body);
  ctx.body = {};
}

async function login(ctx, next) {
  try {
    let user = await userService.login(ctx.request.body);
    ctx.session.user = user;
    ctx.body = user;
  } catch (e) {
    delete ctx.session.user;
    ctx.status = e.status;
    ctx.expose = e.expose;
    ctx.message = e.message;
  }
}

async function findUser(ctx, next) {
  ctx.body = await userService.findUser(ctx.query);
}