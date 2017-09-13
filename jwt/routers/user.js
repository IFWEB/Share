var express = require('express'),
    tokenVerify = require('../cusMiddleWares/tokenVerify'),
    jwtSign = require('../utils/jwtSign.js').jwtSign;

var router = express.Router();

var DB = {
    name: 'luojian',
    pass: 123456,
    uid:'1' // 用户ID
}

// 获取个人信息
router.get('/profile.htm', tokenVerify, function(req, res, next) {
    res.json({ age: 22 });
});

// 登录
router.post('/login.htm', function(req, res, next) {
    if (req.body.name === DB.name && req.body.pass === DB.pass) {

        jwtSign({ uid: DB.uid }).then(function(token) {
            res.cookie('token', token, {httpOnly:true});
            res.json('登录成功')
        }).catch(function(err) {
            next(err); // 跳转到错误处理中间件
        })

    }else{
        res.status(200).end('用户名或密码错误')
    }
});

module.exports = router;