var jwtVerify = require('../utils/jwtSign.js').jwtVerify;

var tokenVerify = function(req, res, next) {
    var token = req.cookies.token
    if (token && typeof token === 'string' && token !== "") {
        // invalid token
        jwtVerify(token).then(function(decode) {
            req.body.uid = decode.uid // 验证通过
            next()
        }).catch(function(err) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).end('token过期，请重新登录')
            } else {
                next(err)
            }
        })
    } else {
        res.status(401).send('unauthorized')
    }
}

module.exports = tokenVerify