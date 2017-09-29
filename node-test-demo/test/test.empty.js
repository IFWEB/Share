var should = require('should'),
    empty = require('../utils/empty.js');

describe('验证empty', function() {

    it('empty.check(undefined)返回false', function() {
        var a;
        empty.check(a).should.be.false();
    })

    it('empty.check(null)返回false', function() {
        empty.check(null).should.be.false();
    })

    it('empty.check([])返回false', function() {
        var a = [];
        empty.check(a).should.be.false();
    })

    it('empty.check({})返回false', function() {
        var a = {};
        empty.check(a).should.be.false();
    })

    it('empty.check("")返回false', function() {
        empty.check("").should.be.false();
    })

    it('empty.check(0)返回false', function() {
        empty.check(0).should.be.false();
    })

    it('empty.check(false)返回false', function() {
        empty.check(false).should.be.false();
    })

});