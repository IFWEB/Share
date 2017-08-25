var http=require('http');

var server=http.createServer(function (req, res) {

  if ('/index' == req.url) {
    // 返回状态码200，响应头'Content-Type': 'text/html'
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end([
        '<form method="POST" action="/url">'
      ,   '<p>What is your name?</p>'
      ,   '<input type="text" name="name">'
      ,   '<p><button>Submit</button></p>'
      , '</form>'
    ].join(''));

  } else if ('/url' == req.url && 'POST' == req.method) {

    // 很明显，接受请求体这一部分很多时候都会用到
    var body = '';
    // 监听req的data事件，接收请求body
    req.on('data', function (chunk) {
      body += chunk;
    });

    // 监听req的end事件，接收请求body结束
    req.on('end', function () {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<p>Your name is <b>' + body.split('=')[1] + '</b></p>');
    });

  } else {

    res.writeHead(404);
    res.end('Not Found');

  }

});

// 开启http服务，监听端口3000
server.listen(3000,function(){
  console.log('Listening on port:3000')
});
