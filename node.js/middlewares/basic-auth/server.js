var  express=require('express'),
     basicAuth = require('basic-auth');

var app=express();

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.append('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'luojian' && user.pass === '123') {
    return next();
  } else {
    return unauthorized(res);
  };
};

app.get('/', auth, function (req, res) {
  res.status(200);
  res.send('Authenticated');
});

app.listen(3000,function(){
    console.log('Listening on port:3000')
});