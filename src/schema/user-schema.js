const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//该集合数据会同步到redis中，同时每个实例都会缓存，当更新的时候通过redis广播到其他实例
const userSchema = new Schema({
  loginName: { type: String, trim: true, maxlength: 20, require: true },
  password: { type: String, maxlength: 100, require: true },
  passwordKey: { type: String, maxlength: 100, require: true },
  nickname: { type: String, trim: true, maxlength: 20, require: true },
  latestLogin: { type: Date },
  latestLogout: { type: Date },
  des: { type: String, trim: true, maxlength: 200 },
  lock: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  del: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  extra: { type: String }
}, { timestamps: true });

mongoose.model('user', userSchema);
