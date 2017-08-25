var express = require('express'),
    serveIndex = require('serve-index'),
    path=require('path');

var app = express();

app.use(express.static(path.resolve(__dirname, './public')));

app.use(serveIndex(path.resolve(__dirname, './public'), {'icons': true}))

app.listen(3000,function(){
    console.log('Listening on port:3000')
});