var express = require('express'),
    responseTime = require('response-time');

var app = express();

app.use(responseTime())

app.get('/', function (req, res) {
  for(var i=0;i<10000000;i++){}
  res.send('hello, world!')
})

app.listen(3000,function(){
    console.log('Listening on port:3000')
});