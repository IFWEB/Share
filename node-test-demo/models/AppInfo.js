/**
 * Created by luojian on 17-5-16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var appInfoSchema = mongoose.Schema({
    appId:{type:String,reqired:true},
    appName:{type:String,reqired:true},
    platform:{type:String,reqired:true},
    version:{type:String,reqired:true},
    build:{type:Number,reqired:true},
    updateInfo:{type:String},
    appUrl:{type:String}
}, {
  collection: 'appInfo'  //集合名
});

module.exports = appInfoSchema
