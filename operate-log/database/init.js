/**
数据库链接以及初始化,使用数据库功能请使用utils.js
*/
var mongoose = require('mongoose'),//引用mongoose模块
    dbConfig = require('./config.js'),
    dbModels = dbConfig.model,
    config = require('../config/config'),
	//链接数据库，配置数据库连接池
    db,
    models = {};

mongoose.Promise = global.Promise;
db = mongoose.createConnection('mongodb://'+ config.mongodb.host +':'+ config.mongodb.port +'/' + config.mongodb.dbName, dbConfig.options);

db.on('error',function(){
  console.error('mongoDB连接错误')
});

// 连接断开
db.on('disconnected',function(){
  console.error('mongoDB连接断开')
});

db.once('open', function() {
  console.log('mongoDB连接成功')
});

//建立Schema和model
for(var i in dbModels){
    models[i] = addSchemaAndModel(i, dbModels[i]);
}
function addSchemaAndModel(name, dbConf){
    var schema = new mongoose.Schema(dbConf);
    return db.model(name,schema);
}
//models的属性名称和dbConfig.model相同
module.exports = models;