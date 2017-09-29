var mongoose = require('mongoose'),
    should = require('should'),
    app = require('../app.js'),
    agent = require('supertest')(app);

describe('User API', function() {
    var token = '';

    before(function() {
        var db = mongoose.connection;
        db.dropDatabase(function(err) {
            if (err) console.log(err);
        });
    })

    // 正常情况下访问 /user/register
    it('注册成功应该返回token', function(done) {
        agent.post('/user/register')
            .send({
                "phone": "18408244552",
                "password": "123456",
                "confirmPassword": "123456"
            })
            .expect(200)
            .expect('content-type', /application\/json/)
            .end(function(err, res) {
                if (err) {
                    done(err)
                } else {
                    should(res.body.code).equal(0);
                    should(res.body.data.token).be.a.String();
                    done();
                };
            })
    });

    // 正常情况下访问 /user/login
    it('登陆成功应该返回token', function(done) {
        agent.post('/user/login')
            .send({
                "phone": "18408244552",
                "password": "123456",
            })
            .expect(200)
            .expect('content-type', /application\/json/)
            .end(function(err, res) {
                if (err) {
                    done(err)
                } else {
                    should(res.body.code).equal(0);
                    should(res.body.data.token).be.a.String();
                    token = res.body.data.token;
                    done();
                };
            })
    });

    //正常情况下访问 /user/modifyProfile
    it('修改用户个人信息应该返回修改后的用户个人信息', function(done) {
        agent.post('/user/modifyProfile')
            .send({
                "token": token,
                "userName": "柠檬小A",
                "age": 28
            })
            .expect(200)
            .expect('content-type', /application\/json/)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    should(res.body.code).equal(0);
                    should(res.body.data).have.keys('userName', 'age');
                    done();
                };
            })
    });
 
    //正常情况下访问 /user/profile
    it('获取用户个人信息', function(done) {
        agent.get('/user/profile')
            .query({
                "token": token,
            })
            .expect(200)
            .expect('content-type', /application\/json/)
            .end(function(err, res) {
                if (err) {
                    done(err);
                } else {
                    should(res.body.code).equal(0);
                    should(res.body.data).have.keys('userName', 'age');
                    done();
                };
            })
    })
})