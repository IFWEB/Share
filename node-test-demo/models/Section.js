/**
 * Created by luojian on 17-5-16.
 */
var mongoose = require('mongoose')
var Schema=mongoose.Schema

var sectionSchema = mongoose.Schema({
    name:{type:String,required:true},  //论坛名称
    iconUrl:String,      //论坛icon地址
    desc:String,         //论坛描述
    lastUpdatedTime: { type:Date, default: Date.now },   //最新更新时间
    topics:[{type:Schema.Types.ObjectId,ref:'Topic'}],  //该论坛所包含的帖子id
    topicTotal:{type:Number,default:0}      //总帖子数
},{
    collection: 'sections'  //集合名
});

module.exports=sectionSchema

