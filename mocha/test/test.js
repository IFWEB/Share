var should = require('should'),
    // app = require('../app.js'),
    // agent = require('supertest')(app);
    agent = require('supertest')('http://localhost:4000');

describe('assertion', function() {
    it('assertion assert', function() {
        should.deepEqual({ a: 1 }, { a: 1 });
        should.equal(1, '1');
        should.notEqual(1, '2');
        should.strictEqual(1, 1);
        should.notStrictEqual(1, '1');
    })

    it('assert boolean', function() {
        (true).should.not.be.false();
        false.should.be.false();
        (10).should.be.ok();
        (0).should.not.be.ok();
        (true).should.be.true();
        false.should.not.be.true();
        ('1').should.not.be.true();
    })

    it('assert contain', function() {
        [1, 2, 3].should.containDeep([2, 1]);
        [1, 2, [1, 2, 3]].should.containDeep([1, [3, 1]]);
        [1, 2, [1, 2, 3]].should.containDeepOrdered([1, [2, 3]]);
        [1, 2, 3].should.containEql(1);
        [{ a: 1 }, 'a', 10].should.containEql({ a: 1 });
    })

    it('assert equality', function() {
        var obj1 = obj2 = ({ a: { b: 1 } }),
            arr1 = arr2 = [1, 2, 3];
        obj1.should.equal(obj1);
        arr1.should.equal(arr2);
        ({ a: { b: 1 } }).should.deepEqual({ a: { b: 1 } }); // 严格比较对象的每个key-value
        ({ a: { b: 1 } }).should.eql({ a: { b: 1 } }); // deepEqual的别名
        (['a', 'b', 'c']).should.deepEqual(['a', 'b', 'c']); // 严格比较对象的每个key-value
        (1).should.exactly(1); // 严格相等 ===
        (1).should.equal(1); // exactly的别名
        'ab'.should.be.equalOneOf('a', 10, 'ab');
        'ab'.should.be.equalOneOf(['a', 10, 'ab']);
    })

    it('assert match', function() {
        'abc'.should.be.a.String().and.match(/abc/);
        (new Error('this is a error')).should.be.match({ message: /this/ });
        (['a', 'a', 'c']).should.matchAny('a'); //匹配一个或多个
        (['a', 'a', 'a']).should.matchEach('a');
        (['a', 'a', 'a']).should.matchEach(function(value) { value.should.be.equal('a') });
        ({ a: 'a', b: 'a', c: 'a' }).should.matchEach(function(value) { value.should.be.equal('a') });
    })

    it('assert number', function() {
        (10).should.not.be.Infinity();
        NaN.should.not.be.Infinity();
        (10).should.not.be.NaN();
        NaN.should.be.NaN();
        (10).should.be.above(0);
        (10).should.be.aboveOrEqual(0);
        (10).should.be.aboveOrEqual(10);
        (9.99).should.be.approximately(10, 0.1);
        (0).should.be.below(10);
        (0).should.be.belowOrEqual(10);
        (0).should.be.belowOrEqual(0);
    })

    it('assert promises', function() {
        (new Promise(function(resolve, reject) { return resolve(10); })).should.be.a.Promise();
        (10).should.not.be.a.Promise();
    })

    it('is async1', () => {
        return new Promise((resolve, reject) => resolve(10))
            .should.be.fulfilled();
    });

    it('is async2', () => {
        return new Promise((resolve, reject) => resolve(10))
            .should.be.fulfilledWith(10);
    });

    it('is async3', () => {
        return new Promise((resolve, reject) => reject(new Error('boom')))
            .should.be.rejected();
    });

    it('is async4', () => {
        return new Promise((resolve, reject) => reject(new Error('boom')))
            .should.be.rejectedWith({ message: 'boom' });
    });

    it('assert property', function() {
        ''.should.be.empty();
        [].should.be.empty();
        ({}).should.be.empty();
        ({ a: 10 }).should.have.keys('a');
        ({ a: 10, b: 20 }).should.have.keys('a', 'b');
        [1, 2].should.have.length(2);
        ({ a: 10 }).should.have.properties('a');
        ({ a: 10, b: 20 }).should.have.properties(['a']);
        ({ a: 10, b: 20 }).should.have.properties({ b: 20 });
        ({ a: 10 }).should.have.ownProperty('a');
        ({ a: 10 }).should.have.propertyWithDescriptor('a', { enumerable: true });
        ({ a: 10 }).should.have.size(1);
        ({ a: 10 }).should.have.value('a', 10);
        ([1, 2]).should.have.value(0, 1);
    })

    it('asssert strings', function() {
        'abc'.should.startWith('a');
        'abc'.should.endWith('c')
    })

    it('assert type', function() {
        var a;
        ([]).should.be.an.Array();
        ([]).should.be.an.Object();
        (function() {}).should.be.an.Function();
        ({}).should.be.an.Object();
        ('abc').should.be.a.String();
        (12).should.be.an.Number();
        (NaN).should.be.an.Number();
        (new Date()).should.be.a.Date();
        (new Error('this is a error')).should.be.a.Error();
        (false).should.be.a.Boolean();
        should(a).be.an.undefined();
        should(null).be.an.null();
        ({}).should.be.an.instanceof(Object);
        ([]).should.be.an.instanceof(Array);
        ('').should.be.an.instanceof(String);
        (123456).should.be.an.instanceof(Number);
    })

    it('response with 200', function(done) {
        // agent.get('/').expect(200).end(done);
        agent.get('/').expect(200,done);
    })

    it('response with 200 and hello world', function(done) {
        // agent.get('/').expect(200,'hello world',done);
        agent.get('/').expect(200,'hello world').end(done)
    })

    it('自定义判断状态码', function(done) {
        agent.get('/test').expect(function(res) {
            if (res.status != 201) {
                throw new Error('状态码不为201')
            }
        }).end(done)
    })

    it('response with json', function(done) {
        agent.post('/users/login').expect(200).expect('content-type', /application\/json/).end(function(err, res) {
            if (err) {
                done(err)
            } else {
                res.body.should.have.properties({ name: 'Bob' });
                done();
            };
        })
    })
});