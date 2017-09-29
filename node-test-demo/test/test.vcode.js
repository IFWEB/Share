var should = require('should'),
    vcode = require('../utils/vcode.js');

describe('验证vcode', function() {

    it('生成4位随机验证码', function() {
        vcode(4).should.be.a.String().and.match(/[0-9]{4}/);
    })

    it('生成6位随机验证码', function() {
        vcode(6).should.be.a.String().and.match(/[0-9]{6}/);
    })

});