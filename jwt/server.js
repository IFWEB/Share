var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    user = require('./routers/user');


var app=express(),
    env = process.env.NODE_ENV || 'dev',
    port = normalizePort(process.env.port || 3000);

app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/user', user); // 路由前缀

// catch 404
app.use(function(req, res, next) {
    res.status(404).end('Not Found')
});

// error handler
app.use(function(err, req, res, next) {
    console.log(err)
    res.status(500).end(err)
});


app.listen(port, function() {
   console.log('Express server listening on port ' + port);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}