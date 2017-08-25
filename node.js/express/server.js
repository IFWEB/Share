var express = require('express');
var app = express();

// 中间件1： 处理请求body,将请求body转换为req.body
app.use(require('body-parser').urlencoded({ extended: false }));

// 路由 /index,GET请求,中间件2
app.all('/index', function(req, res, next) {
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

// 路由 /url,post请求，中间件3
app.post('/url', function(req, res, next) {
    // 监听req的end事件，接收请求body结束
    res.status(200);
    res.append('Content-Type','text/html');
    res.send('<p>Your name is <b>' + req.body.name + '</b></p>');
})

// 中间件4，处理404
app.use(function(req, res, next) {
    res.status(404);
    res.send('404 Not Found');
})

app.listen(3000,function(){
    console.log('Listening on port:3000')
});