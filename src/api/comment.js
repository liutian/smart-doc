const logger = require('log4js').getLogger('api-comment');

const commentService = require('../service/comment-service');

module.exports = function (router) {

  /**
   * @api {post} /auth/comment 新增评论
   * @apiName add comment
   * @apiGroup comment
   *
   * @apiParam {String} content 评论内容
   * @apiParam {Number} parentId 父级评论
   * @apiParam {Number} articleId 文章ID
   */
  router.post('/auth/comment', createcomment);

  /**
   * @api {post} /auth/comment/:id 更新评论
   * @apiName update comment
   * @apiGroup comment
   *
   * @apiParam {Number} id 评论ID
   * @apiParam {Number} del 是否删除
   */
  router.post('/auth/comment/:id', updatecomment);

  /**
   * @api {get} /auth/comment 查询评论信息
   * @apiName search comment
   * @apiGroup comment
   *
   * @apiParam {String} articleId 文章ID
   * @apiParam {String} size 分页大小
   * @apiParam {String} page 分页
   */
  router.get('/auth/comment', findcomment);


}



/*---------------------------------------- 分割线 ------------------------------------------------*/


async function createcomment(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  let commentId = await commentService.create(ctx.request.body);
  ctx.body = { id: commentId };
}

async function updatecomment(ctx, next) {
  ctx.request.body.createBy = ctx.session.user.id;
  ctx.request.body.id = ctx.params.id;
  await commentService.update(ctx.request.body);
  ctx.body = {};
}


async function findcomment(ctx, next) {
  ctx.body = await commentService.find(ctx.query);
}

