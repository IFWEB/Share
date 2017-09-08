var jwt = require('jsonwebtoken'),
    config = require('../configs/config.js');

var jwtSign = function(obj) {
    return new Promise(function(resolve, reject) {
        // sign token - asynchronou
        jwt.sign(obj, config.jwt_secret, {
                expiresIn: config.jwt_expiresIn,
                algorithm: config.algorithm
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
        jwt.verify(token, config.jwt_secret, function(err, decoded) {
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