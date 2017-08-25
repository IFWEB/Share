var connect = require('connect');
var http = require('http');

var app = connect();

// 中间件1： 处理请求body,将请求body转换为req.body
app.use(require('body-parser').urlencoded({extended: false}));

// 中间件2挂载在'/',只有请求url为'/index'时才会执行该中间件
app.use('/index', function(req, res, next) {
    // 返回状态码200，响应头'Content-Type': 'text/html'
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end([
        '<form method="POST" action="/url">',
        '<p>What is your name?</p>',
        '<input type="text" name="name">',
        '<p><button>Submit</button></p>',
        '</form>'
    ].join(''));
});

// 中间件3挂载在'/url',只有请求url为'/url'时才会执行该中间件
app.use('/url',function(req, res, next) {
    if ('POST' == req.method) {
        // 监听req的end事件，接收请求body结束
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<p>Your name is <b>' + req.body.name + '</b></p>');
    } else {
        next()
    }
})

// 中间件4，处理404
app.use(function(req, res, next) {
    res.writeHead(404);
    res.end('404 Not Found');
})

// 开启http服务，监听端口3000
http.createServer(app).listen(3000, function() {
    console.log('Listening on port:3000')
});