var mongoose = require('mongoose'),
    Users=require('./schema/user.js');

//连接mongodb
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connect success\r\n\r\n')
});

// // 增加一条数据
// var user = new Users({
//     phone: '18408244552', //用户手机
//     password: '123456', //用户密码
//     nickname: '柠檬小C' , //昵称
//     gender: '3', // 1 - 男, 2 - 女, 3 - 未知
//     age: 18
// })
// user.save(function(err, user) {
//     if (err) return console.log(err)
//     console.log(user)
// })


// // 查找数据
// Users.findOne({phone:'18408244552'},function(err, user) {
//     if (err) return console.log(err)
//     console.log(user)
// })



// 更新数据
// Users.findOneAndUpdate({phone:'18408244552'},{nickname:'小明'},{new:true},function(err, user) {
//     if (err) return console.log(err)
//     console.log(user)
// })



// // 删除数据
// Users.findOneAndRemove({phone:'18408244552'},function(err, user) {
//     if (err) return console.log(err)
//     console.log(user)
// })

