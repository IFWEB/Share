var express = require('express'),
    favicon = require('serve-favicon'),
    path=require('path');

var app = express();

app.use(favicon(path.join(__dirname, './favicon.ico')))

app.get('/',function(req,res,next){
    res.sendFile(path.resolve(__dirname,'./index.html'))
})

app.listen(3000,function(){
    console.log('Listening on port:3000')
});