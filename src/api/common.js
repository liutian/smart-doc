const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const path = require('path');
const rename = util.promisify(fs.rename);

const logger = require('log4js').getLogger('api-common');
const _util = require('../util/util');
const config = require('../config');

module.exports = function (router) {

  /**
   * @api {post} /open/upload 上传文件
   * @apiName upload file
   * @apiGroup upload
   * @apiDescription 服务器返回上传后，以对象方式返回文件信息，对象键为上传时的name,值参见下列描述
   *
   * @apiSuccess {Number} size 文件大小
   * @apiSuccess {String} path 文件访问路径，相对服务器的路径
   * @apiSuccess {String} name 文件名称
   * @apiSuccess {String} type 文件类型
   *
   */
  router.post('/open/upload', upload);
}



/*---------------------------------------- 分割线 ------------------------------------------------*/

async function upload(ctx, next) {
  let filesObj = ctx.request.body.files;
  if (!filesObj || Object.keys(filesObj).length <= 0) {
    apiError.throw('At least one file ');
  }

  let date = new Date();
  let dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  let hash = crypto.createHash('md5');
  hash.update(dateStr);
  let dateHash = hash.digest('hex');

  let fileInfoList = [];
  let filesObjKeys = Object.keys(filesObj);
  for (let i = 0; i < filesObjKeys.length; i++) {
    let fileInfo = filesObj[filesObjKeys[i]];
    let random = await _util.random(5);
    let pathArr = [config.upload_dir, dateHash, random + path.extname(fileInfo.name)];
    let filePath = path.join.apply(null, pathArr);

    await _util.mkdir(path.dirname(filePath));
    await rename(fileInfo.path, filePath);

    fileInfoList.push(Object.assign(fileInfo, {
      path: config.upload_file_prefix + filePath.replace(config.upload_dir, '')
    }));
  }

  ctx.body = { files: fileInfoList, success: true };
  // ctx.body = JSON.stringify(fileInfoList);
  // ctx.type = 'text/html';
}

