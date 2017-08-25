
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// 用户schema
var userSchema = mongoose.Schema({
    phone: { type: String, required: true }, //用户手机
    password: { type: String, required: true }, //用户密码
    nickname: { type: String, default: '柠檬小C' }, //昵称
    gender: { type: String, enum: ['1', '2', '3'], default: '3' }, // 1 - 男, 2 - 女, 3 - 未知
    age: Number,
    registerTime: Date, // 注册时间
}, {
    collection: 'users' //集合名
});

module.exports = mongoose.model('User', userSchema);