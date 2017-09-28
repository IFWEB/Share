var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var userSchema = new Schema({
    phone: String, //用户手机
    password: {
        type: String,
        required: true
    }, //用户密码
    nickname: String, //昵称
    avatar: String, //头像
    desc: String, //个人简介
    gender: { type: String, enum: ['1', '2', '3'], default: '3' }, // 1 - 男, 2 - 女, 3 - 未知
    registerTime: Date, // 注册时间
    lastUpdatedTime: { type: Date, default: Date.now }, //最进更新时间
    authority: { type: String, default: 'normal' } //权限
}, {
    collection: 'users' //集合名
});

var Users = mongoose.model('User', userSchema);

module.exports = Users;