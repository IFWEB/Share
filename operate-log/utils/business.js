/**
业务相关函数
*/
var DB,
    utils = require('./util.js');

/*
添加操作日志，传参方式：
第一种：分开来传递
user 用户名
businessN 业务名称（指第三级菜单） 
tp 操作类型（insert/update/remove/find）和数据库操作名称保持一致,还有一个类型是'unkown:xxx'，当用户写入的操作日志类型不正确时候，比如写类型是'add',则保存如数据库类型是'unkown:add'
descript 详细描述(可选)
第二种：对象传递
user = {
    userName: 'xxx'
    businessName: 'xxx' 
    type: 'insert',
    description: 'xxx'
}
*/
function addOLog(user, businessN = '', tp = 'unkown', descript = '') {
    let types = 'insert/update/remove/find'.split('/'),
        obj,
        typeS = '';
    //如果是通过对象方式传递
    if(utils.type(user) === 'object'){
        typeS = user.type;
        obj = {
            userName: user.userName,
            businessName:  user.businessName || '', 
            description: user.description || ''
        };
    }else{
        typeS = tp;
        obj = {
            userName: user,
            businessName:  businessN, 
            description: descript
        };
    }
    //查看类型对不对
    if (!types.includes(typeS)) {
        typeS = `unkown:${typeS}`;
    }
    obj.type = typeS;
    obj.time = new Date();
    // 插入信息到打包配置表
    DB.operateLog.insert(obj, function(err, data) {
        var resData = {};
        if (err) {
            console.log(`insert  opertate log ${JSON.stringify(obj)} err: ${err}`);
        }
    });
}
module.exports = function(db) {
    DB = db;
    return {
        //添加操作日志
        addOLog: addOLog
    }
}