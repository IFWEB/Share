var jwt = require('jsonwebtoken'),
    jwtConf = require('../configs/config.jwt.js');

var jwtSign = function(uid) {
    return new Promise(function(resolve, reject) {
        // sign token - asynchronou
        jwt.sign({uid:uid}, jwtConf.jwt_secret, {
                expiresIn: jwtConf.jwt_expiresIn,
                algorithm: jwtConf.algorithm
            },
            function(err, token) {
                if (err) {
                    reject(err);
                };
                resolve(token);
            });
    })
}

var jwtVerify = function(token) {
    return new Promise(function(resolve, reject) {
        // invalid token - asynchronou
        jwt.verify(token, jwtConf.jwt_secret, function(err, decoded) {
            if (err) {
                reject(err);
            };
            resolve(decoded);
        });
    })
}

module.exports = {
    jwtSign:jwtSign,
    jwtVerify:jwtVerify
};