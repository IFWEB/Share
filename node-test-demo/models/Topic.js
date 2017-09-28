/**
 * Created by luojian on 17-5-16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var topicSchema = mongoose.Schema({
  auth: {
    _id: Schema.Types.ObjectId, //帖子作者id
    nickname: String,           //帖子作者昵称
    avatar: String              //帖子作者头像地址
  },
  section: {type: Schema.Types.ObjectId, required: true}, //所属论坛
  title: String,      //帖子标题
  content: String,    //帖子内容
  imgUrls: [String],  //帖子图片地址
  tag: String,        //帖子标签
  aggreTotal: {type: Number, default: 0},   //点赞数
  commentTotal: {type: Number, default: 0}, //评论数
  comments: [{
    auth: {
      _id: Schema.Types.ObjectId, //评论作者id
      nickname: String,           //评论作者昵称
      avatar: String              //评论作者头像地址
    },
    content: String,                                  //评论内容
    imgUrls: [String],                                //评论图片地址
    atAuth: {
      _id: Schema.Types.ObjectId, //@的用户的id
      nickname: String,           //@的用户的昵称
      avatar: String            //@的用户的头像地址
    },
    aggreTotal: {type: Number, default: 0},                //点赞数
    lastUpdatedTime: {   //最新更新时间
      type: Date,
      default: Date.now
    }
  }],
  lastUpdatedTime: {   //最新更新时间
    type: Date,
    default: Date.now
  }
}, {
  collection: 'topics'  //集合名
});

module.exports = topicSchema

