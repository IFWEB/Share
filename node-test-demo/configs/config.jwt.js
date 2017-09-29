var config={
    jwt_secret:'123456',
    jwt_expiresIn:60 * 60, //m,1小时过期
    // jwt_expiresIn:30, // 30s 过期
    algorithm:'HS256' // 加密方式
}


module.exports = config;