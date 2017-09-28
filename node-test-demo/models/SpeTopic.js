/**
 * Created by luojian on 17-5-16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var speTopicSchema = mongoose.Schema({
    name:{type:String,reqired:true},
    topics:[{type:Schema.Types.ObjectId,ref:'Topic'}],  //所包含的帖子id
    topicTotal:{type:Number,default:0},      //总topic数
    lastUpdatedTime: { type:Date, default: Date.now }   //最新更新时间
}, {
    collection: 'speTopics'  //集合名
});

module.exports = speTopicSchema
