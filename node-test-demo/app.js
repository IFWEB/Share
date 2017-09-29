var http = require('http'),
    express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    mongoConf = require('./configs/config.mongo.js');

var Users = require('./models/user.js');

mongoose.Promise = global.Promise;

//连接mongodb
mongoose.connect('mongodb://localhost/test',{ useMongoClient: true });
var db = mongoose.connection;
db.on('error', function() {
    console.log('mongoDB连接失败');
});
// 连接断开
db.on('disconnected', function() {
    console.error('mongoDB连接断开');
});
db.once('open', function() {
    console.log('mongoDB连接成功');
});

var env = process.env.NODE_ENV || 'development',
    port = process.env.port || 4000;

var user = require('./routers/user');

var app = express();
app.set('env', env);
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator()); //验证请求参数（body,params,cookie)是否合法中间件

app.use('/user', user); // 路由前缀

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});

//开启服务
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports=app;