const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//该集合数据会同步到redis中，同时每个实例都会缓存，当更新的时候通过redis广播到其他实例
const articleSchema = new Schema({
  manId: { type: Schema.Types.ObjectId, require: true },
  siteId: { type: Schema.Types.ObjectId, require: true },
  title: { type: String, trim: true, maxlength: 50, require: true },
  des: { type: String, trim: true, maxlength: 200 },
  content: { type: String, maxlength: 50000 },
  state: { type: Number, min: 0, max: 1, default: 1 },//是否发布
  createBy: { type: Schema.Types.ObjectId, require: true },
  updateBy: { type: Schema.Types.ObjectId, require: true },
  viewCount: { type: Number, min: 0, default: 0 },
  praiseCount: { type: Number, min: 0, default: 0 },
  commentCount: { type: Number, min: 0, default: 0 },
  enableComment: { type: Number, min: 0, max: 1, default: 0 },
  enablePraise: { type: Number, min: 0, max: 1, default: 0 },
  latestUpdate: { type: Date },
  parentId: { type: Schema.Types.ObjectId },
  index: { type: Number, default: 0 },
  del: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  extra: { type: String }
}, { timestamps: true });

mongoose.model('article', articleSchema);
