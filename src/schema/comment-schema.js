const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//该集合数据会同步到redis中，同时每个实例都会缓存，当更新的时候通过redis广播到其他实例
const articleSchema = new Schema({
  manId: { type: Schema.Types.ObjectId, require: true },
  siteId: { type: Schema.Types.ObjectId, require: true },
  articleId: { type: Schema.Types.ObjectId, require: true },
  content: { type: String, maxlength: 200, required: true },
  createBy: { type: Schema.Types.ObjectId, require: true },
  praiseCount: { type: Number, min: 0, default: 0 },
  ancestorList: { type: [Schema.Types.ObjectId], require: true, default: [] },
  parentNickname: { type: String },
  parentContent: { type: String },
  del: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  extra: { type: String }
}, { timestamps: true });

mongoose.model('article', articleSchema);
