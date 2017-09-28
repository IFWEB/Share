/**
 * Created by luojian on 17-5-17.
 */
module.exports = {

  ERR_INVALID_TOKEN: {
    code: 101,
    desc: "无效的token"
  },

  ERR_TOKEN_EXPIRED: {
    code: 102,
    desc: "TOKEN过期"
  },

  ERR_SIGNUP_VCODE_CHECK_NOT_MATCH: {
    code: 103,
    desc: "验证码不正确"
  },

  ERR_SIGNUP_VCODE_CHECK_NOT_EXIST: {
    code: 104,
    desc: "验证码不存在"
  },

  ERR_MOBILE_HAS_REGISTERED: {
    code: 201,
    desc: "手机号码已经注册"
  },

  ERR_USER_NOT_EXISTED: {
    code: 211,
    desc: "用户不存在"
  },

  ERR_USER_PWD_INCORRECT: {
    code: 212,
    desc: "密码错误"
  },

  ERR_USER_AUTHORITY_ERROR: {
    code: 221,
    desc: "用户权限错误"
  },

  ERR_MOBILE_HAS_NOT_REGISTERED: {
    code: 202,
    desc: "手机号码未注册"
  },

  ERR_MOBILE_ILLEAGE: {
    code: 203,
    desc: "手机号码不合法"
  },

  ERR_PWD_UPDATE_FAILED: {
    code: 301,
    desc: "修改密码失败"
  },

  ERR_INVALID_BODY: {
    code: 302,
    desc: "无效的请求body"
  },

  ERR_INVALID_PARAMS: {
    code: 303,
    desc: "无效的请求params"
  },

  ERR_INVALID_QUERY: {
    code: 304,
    desc: "无效的请求query"
  },

  ERR_INVALID_COOKIE: {
    code: 305,
    desc: "无效的请求cookie"
  },

  ERR_SIGN_ILLEAGE:{
    code: 601,
    desc: "接口认证失败"
  },

  ERR_UNKNOWN_EXCEPTION: {
    code: 999,
    desc: "未知错误"
  }
};