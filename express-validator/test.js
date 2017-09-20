const express = require('express'),
    app = express();

const {
    check,
    validationResult
} = require('express-validator/check');

// console.log(check('username'));
//静态资源
app.use(express.static(__dirname));

//普通参数校验
app.all('/test1', [
    check('username')
    //这里面的方法处了express-validator提供的外，基本都是validator插件提供的：https://github.com/chriso/validator.js
    .isEmail()
    //这个方法用来描述错误信息，但是不推荐
    .withMessage('must be an email'),

    // 通常错误信息可以作为第二个参数
    check('password', 'passwords must be at least 5 chars long and contain one number')
    .isLength({ min: 5 })
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.mapped());
    } else {
        return res.json({
            status: 'success'
        });
    }

    /*//也可以使用下面这种方式处理
    try {
      validationResult(req).throw();
      res.json({status: 'success'});
    } catch (err) {
      return res.status(422).json(err.mapped());
    }
    */
});

//加入自定义校验
app.all('/test2', [
    check('username', 'must be an email')
    .isEmail()
    .custom(value => {
        //自定义校验，个人自己写
        function vali(val) {
            if (!/chua/.test(val)) {
                throw new Error('this email is not has "chua"');
            } else {
                return true;
            }
        }
        //通过hrow new Error抛出异常表示验证失败,否则返回true即可。
        return vali(value);

        /*//还可以通过异步的方式处理
        function findUserByEmail(val) {
            return new Promise((resolve, reject) => {
                setTimeout(function() {
                    if (!/chua/.test(val)) {
                        resolve('this email is not has "chua"');
                    } else {
                        resolve();
                    }
                }, 1000)
            });
        }
        return findUserByEmail(value).then(err => {
            if (err) {
                throw new Error(err);
            }else{
              return true;
            }            
        })*/

    })
], (req, res, next) => {
    try {
        validationResult(req).throw();
        res.json({
            status: 'success'
        });
    } catch (err) {
        return res.status(422).json(err.mapped());
    }
});

//包装返回，我们不能直接返回插件提供给我们的对象，需要包装一下,这里面使用errors.array()比errors.mapped要好处理
app.all('/test3', [
    check('username', 'username must be an email')
    .isEmail()
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          code: 1000,
          message: errors.array()[0].msg,
          data: {}
        });
    } else {
        return res.json({
          code: 0,
          message: 'success',
          data: {}
        });
    }
});
app.listen(9090);