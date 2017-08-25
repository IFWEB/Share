var express = require('express'),
    path=require('path');

var app = express();

app.use('/static',express.static(path.resolve(__dirname, './public')));

app.get('/',function(req,res,next){
    res.send("<img src='./static/images/node.jpg'/>")
})

app.listen(3000,function(){
    console.log('Listening on port:3000')
});