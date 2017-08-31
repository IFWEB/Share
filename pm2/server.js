var express = require('express'),
    path=require('path');

var app = express();

var port = process.env.port || 3000;
var count=0;

app.get('/',function(req,res,next){
   res.sendFile(__dirname + '/index.html');
})

app.get('/testRotateLog',function(req,res,next){
    ++count;
    console.log(count);
    console.error(count);
    res.send('hello world');
});

app.get('/captureError', function(req, res, next) {
    ++a; // 变量a未被定义，会抛出一个ReferenceError错误
})

app.get('/error', function(req, res, next) {
    throw new Error('抛出错误'); // 手动抛出错误
})

app.get('/assertFalse', function(req, res, next) {
    console.assert(false, '断言为false,抛出 AssertionError');  // 断言为false,抛出 AssertionError
})

// 处理404
app.use(function(req, res, next) {
    res.status(404);
    res.send('404 Not Found');
})

app.listen(port, function() {
    console.log('这是一个log');
    console.info('这是一个info'); // console.info() 函数是 console.log() 的一个别名
    console.dir({ 'pm2': 'Advanced, production process manager for Node.js' });

    console.trace('res');
    console.error('这是一个error');
    console.warn('这是一个warn'); // console.warn() 函数是 console.error() 的一个别名
});