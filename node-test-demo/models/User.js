/**
 * Created by luojian on 17-5-16.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = mongoose.Schema({
  phone: String,           //用户手机
  password: {
    type: String,
    required: function () {
      return this.registerFrom === 'phone'
    }
  },        //用户密码
  nickname: String,        //昵称
  avatar: String,          //头像
  desc: String,     //个人简介
  gender: {type: String, enum: ['1', '2', '3'], default: '3'}, // 1 - 男, 2 - 女, 3 - 未知
  registerTime: Date, // 注册时间
  registerFrom: {type: String, enum: ['phone', 'wechat'],required:true}, // 用户注册来源： 手机注册-phone, 微信-wechat
  lastUpdatedTime: {type: Date, default: Date.now},   //最新更新时间
  authority: {type: String, default: 'normal'}, //权限
  sendTopicTotal: {type: Number, default: 0},  //发送的帖子数
  sendTopics: [{type: Schema.Types.ObjectId, ref: 'Topic'}], //发送的帖子
  partTopicTotal: {type: Number, default: 0},  //参与的帖子数
  partTopics: [{type: Schema.Types.ObjectId, ref: 'Topic'}], //参与的帖子数
  // message_send:[Message.Schema],
  // message_recieve:[Message.Schema]
}, {
  collection: 'users'  //集合名
});

module.exports = userSchema

