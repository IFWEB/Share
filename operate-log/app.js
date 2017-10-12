/*
 * deploy 模块入口
 */
var express = require('express'),
    app = express();

var DB = require('./database/utils.js'),
    business = require('./utils/business.js')(DB);


//接口请求分发处理
app.all('/operate-log', function(req, res) {
    //添加操作日志
    business.addOLog('chua', '内部资产用户管理', 'insert', '删除用户名QYZH00000901893');
    // business.addOLog({
    //     userName: 'chua',
    //     businessName: '内部资产用户管理1',
    //     type: 'insert',
    //     description: '删除用户名QYZH00000901893'
    // });
    res.send('成功');
});

// 监听服务
app.listen('3000', function() {
    console.log('Express server listening on port 3000');
});