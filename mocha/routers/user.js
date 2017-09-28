var express = require('express'),
    tokenVerify = require('../cusMiddleWares/tokenVerify'),
    Users = require('../models/User'),
    resErrType = require('../constants/resErrType'),
    resResult = require('../utils/resResult'),
    bcrypt = require('bcrypt'),
    jwtSgin = require('../utils/jwt').jwtSgin;

var router = express.Router();

// 注册
router.post('/register', function(req, res, next) {
    //验证请求body
    req.checkBody({
        'phone': {
            notEmpty: true,
            isNumeric: true,
            isMobilePhone: {
                options: ['zh-CN'],
                errorMessage: 'Invalid phone'
            },
            errorMessage: 'Invalid phone'
        },
        'password': {
            notEmpty: true,
            errorMessage: 'Invalid Password'
        },
        'confirmPassword': {
            notEmpty: true,
            errorMessage: 'Invalid confirmPassword'
        },
    });
    var errors = req.validationErrors();
    if (errors) return res.json(resResult.error(resErrType.ERR_INVALID_BODY, errors));

    var { password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.json(resResult.error({
        code: 212,
        message: '两次输入的密码不相等'
    }));

    next();
}, function(req, res, next) {
    var { phone, password } = req.body;
    //判断用户是否已注册
    Users.findOne({ phone: '18408244552' }, function(err, user) {

        if (err) return next(err);
        if (user) return res.json(resResult.error({ code: 222, message: '已注册，请直接登录' })); //已注册

        bcrypt.genSalt(12, function(err, salt) { //未注册,hash密码并存储
            if (err) return next(err)

            bcrypt.hash(password, salt, function(err, hash) {
                if (err) return next(err)

                var user = new Users({
                    phone: phone,
                    password: hash,
                    nickname: '',
                    avatar: '',
                    desc: '',
                    registerTime: new Date()
                })
                user.save(function(err, user) {
                    if (err) return next(err)

                    jwtSign(user._id).then(token => {
                        res.json(resResult.success({ token: token })) //返回token
                    }).catch(err => {
                        next(err);
                    });
                })
            });

        });
    })

});

router.post('/login', function(req, res, next) {
    var { phone, password } = req.body;

    Users.findOne({ phone: phone }, function(err, user) {
        if (err) return next(err)
        if (!user) return res.json(resResult.error({ code: 222, message: '未注册，请先注册' }))

        bcrypt.compare(password, user.password, function(err, equal) {
            if (err) return next(err)

            if (!equal) return res.json(resResult.error({ code: 221, message: '密码错误，请重新登录' }))

            jwtSign(user._id).then(token => {
                res.json(resResult.success({ token: token })) //密码正确，登录成功，返回token
            }).catch(err => {
                next(err);
            });
        })

    })
});

// 修改用户个人信息
router.post('/modifyProfile', tokenVerify, function(req, res, next) {
    var { uid, nickname, avatar, desc, gender } = req.body;
    Users.findOneAndUpdate({ _id: uid }, {
            $set: { nickname: nickname, avatar: avatar, desc: desc, gender: gender }
        }, { new: true, upsert: false, select: 'nickname avatar desc gender' },
        function(err, user) {
            if (err) return next(err)

            return res.json(
                resResult.success({
                    nickname: user.nickname,
                    avatar: user.avatar,
                    desc: user.desc,
                    gender: user.gender
                })
            )
        })

});

// 获取用户个人信息
router.get('/profile', tokenVerify, function(req, res, next) {
    var user = req.body.user;

    Users.findById(user._id, 'nickname avatar desc gender', function(err, user) {
        if (err) return next(err)

        return res.json(
            resResult.success(user)
        )
    })
});

module.exports = router;