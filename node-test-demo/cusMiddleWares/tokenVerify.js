var jwtVerify = require('../utils/jwt').jwtVerify;

var tokenVerify = function(req, res, next) {
    var token = req.body.token || req.query.token;
    if (token) {
        // invalid token
        jwtVerify(token).then(function(decode) {
            req.body.uid = decode.uid // 验证通过，将解码后的字符串转为req.body.uid;
            next()
        }).catch(function(err) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).end('token过期，请重新登录');
            } else {
                next(err)
            }
        })
    } else {
        res.status(403).send('No token provided')
    }
}

module.exports = tokenVerify;