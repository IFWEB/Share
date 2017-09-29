var mongoose = require('mongoose');
// 用户schema
var userSchema = mongoose.Schema({
    phone: { type: String, required: true }, //用户手机
    password: { type: String, required: true }, //用户密码
    userName: { type: String, default: '柠檬小C' }, //昵称
    age: Number
}, {
    collection: 'users' //集合名
});

module.exports = mongoose.model('User', userSchema);