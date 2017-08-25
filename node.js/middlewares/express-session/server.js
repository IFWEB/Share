var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

var app = express();

app.use(cookieParser());

app.use(session({
  secret: '123456',
  name:'session', // 默认值为connect.id
  cookie: { maxAge: 10 * 60 * 1000 }, // 10m
  resave: false, //重新保存：强制会话保存即使是未修改的。重新保存后，假设你的cookie是10分钟过期，每次请求都会再设置10分钟
  saveUninitialized: false, //是指无论有没有session cookie，每次请求都设置个session cookie ，默认给个标示为 connect.sid
}))

app.use(function (req, res, next) {
  if(!req.session.views){
    req.session.views = 0;
  }

  // count the views
  req.session.views += 1;

  next()
})

app.get('/', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views + ' times')
})

app.listen(3000,function(){
    console.log('Listening on port:3000')
});