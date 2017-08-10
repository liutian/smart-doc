const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//该集合数据会同步到redis中，同时每个实例都会缓存，当更新的时候通过redis广播到其他实例
const siteSchema = new Schema({
  name: { type: String, trim: true, maxlength: 50, require: true },
  logo: { type: String, trim: true, maxlength: 200 },
  des: { type: String, trim: true, maxlength: 200 },
  type: { type: Number, min: 0, max: 1, default: 1 },//站点是否公开
  createBy: { type: Schema.Types.ObjectId, require: true },
  viewCount: { type: Number, min: 0, default: 0 },
  praiseCount: { type: Number, min: 0, default: 0 },
  commentCount: { type: Number, min: 0, default: 0 },
  del: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  extra: { type: String }
}, { timestamps: true });

mongoose.model('site', siteSchema);
