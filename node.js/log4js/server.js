var express = require('express'),
    log4js=require('log4js'),
    lo4jsConfig = require('./config/log4js.js');

var app = express();

log4js.configure(lo4jsConfig);  // 配置log4js

var log = log4js.getLogger('app');

// 将log4js作为中间件使用，记录请求日志
app.use(log4js.connectLogger(log))

app.use(require('body-parser').urlencoded({ extended: false }));

app.get('/index', function(req, res, next) {
    // 返回状态码200，响应头'Content-Type': 'text/html'
    res.status(200);
    res.append('Content-Type','text/html');
    res.send([
        '<form method="POST" action="/url">',
        '<p>What is your name?</p>',
        '<input type="text" name="name">',
        '<p><button>Submit</button></p>',
        '</form>'
    ].join(''));
});

app.post('/url', function(req, res, next) {
    // 监听req的end事件，接收请求body结束
    res.status(200);
    res.append('Content-Type','text/html');
    res.send('<p>Your name is <b>' + req.body.name + '</b></p>');
})

app.use(function(req, res, next) {
    res.status(404);
    res.send('404 Not Found');
})

var port = process.env.port || 3000;

app.listen(port,function(){
    log.info('Listening on port:30fersfesesfsef00')
});