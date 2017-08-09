const logger = require('log4js').getLogger('api-user');
const mongoose = require('mongoose');

module.exports = function (router) {
  router.post('/open/login', login);

  router.get('/auth/user', getUser);
}


async function login(ctx, next) {
  ctx.session.user = ctx.request.body;
}

async function getUser(ctx, next) {
  ctx.body = ctx.session.user;
}