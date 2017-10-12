/**
数据库配置文件,使用数据库请使用utils.js
*/
var mongoose = require('mongoose');    //引用mongoose模块
var Schema = mongoose.Schema;
module.exports = {
	//mongoose数据库链接配置
	options:{
		server: {
			auto_reconnect: true,//自动重连
			poolSize: 10//连接池数量
		}
	},
	//数据库文档集合结构
	model:{
		//操作日志
		operateLog: {
			userName: String, //操作用户
			businessName: String,// 业务名称（指第三级菜单)
			type: String, // 操作类型（insert/update/remove/find）
			description: String,// 详细描述
			time: Date // 操作时间
		}
	}
}