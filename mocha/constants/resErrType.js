/**
 * Created by luojian on 17-5-17.
 */
module.exports = {

  ERR_INVALID_TOKEN: {
    code: 101,
    message: "无效的token"
  },

  ERR_TOKEN_EXPIRED: {
    code: 102,
    message: "TOKEN过期"
  },

  ERR_SIGNUP_VCODE_CHECK_NOT_MATCH: {
    code: 103,
    message: "验证码不正确"
  },

  ERR_SIGNUP_VCODE_CHECK_NOT_EXIST: {
    code: 104,
    message: "验证码不存在"
  },

  ERR_MOBILE_HAS_REGISTERED: {
    code: 201,
    message: "手机号码已经注册"
  },

  ERR_USER_NOT_EXISTED: {
    code: 211,
    message: "用户不存在"
  },

  ERR_USER_PWD_INCORRECT: {
    code: 212,
    message: "密码错误"
  },

  ERR_USER_AUTHORITY_ERROR: {
    code: 221,
    message: "用户权限错误"
  },

  ERR_MOBILE_HAS_NOT_REGISTERED: {
    code: 202,
    message: "手机号码未注册"
  },

  ERR_MOBILE_ILLEAGE: {
    code: 203,
    message: "手机号码不合法"
  },

  ERR_PWD_UPDATE_FAILED: {
    code: 301,
    message: "修改密码失败"
  },

  ERR_INVALID_BODY: {
    code: 302,
    message: "无效的请求body"
  },

  ERR_INVALID_PARAMS: {
    code: 303,
    message: "无效的请求params"
  },

  ERR_INVALID_QUERY: {
    code: 304,
    message: "无效的请求query"
  },

  ERR_INVALID_COOKIE: {
    code: 305,
    message: "无效的请求cookie"
  },

  ERR_SIGN_ILLEAGE:{
    code: 601,
    message: "接口认证失败"
  },

  ERR_UNKNOWN_EXCEPTION: {
    code: 999,
    message: "未知错误"
  }
};