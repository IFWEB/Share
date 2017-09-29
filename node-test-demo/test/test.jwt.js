var should = require('should'),
    jwt = require('jsonwebtoken'),
    jwtConf = require('../configs/config.jwt.js'),
    jwtSign = require('../utils/jwt.js').jwtSign,
    jwtVerify = require('../utils/jwt.js').jwtVerify;

describe('验证jwt', function() {

    var uid = 'qwertyuiopasdfgh',
        token = '';

    before(function() {
        token = jwt.sign({ uid: uid }, jwtConf.jwt_secret, {
            expiresIn: jwtConf.jwt_expiresIn,
            algorithm: jwtConf.algorithm
        });
        decode = jwt.verify(token, jwtConf.jwt_secret);
    })

    it('验证jwtSign', function() {
        return jwtSign(uid).should.be.fulfilledWith(token);
    })

    it('验证jwtVerify', function() {
        return jwtVerify(token).should.be.fulfilledWith(decode);
    })

});