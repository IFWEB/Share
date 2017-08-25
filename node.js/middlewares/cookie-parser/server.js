var express = require('express'),
    fs = require('fs'),
    cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/index.html', function(req, res) {
    for (var key in req.cookies) {
        res.write("cookie名:" + key);
        res.write(",cookie值:" + req.cookies[key] + "<br/>");
    }
    res.end();
});

app.listen(3000,function(){
    console.log('Listening on port:3000')
});