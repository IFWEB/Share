var env = process.env.NODE_ENV || 'dev';

// dev环境，日志输出至控制台;prod环境，日志输出至文件
var log4jsConfig = {
  prod: {
    appenders: [
      {
        type: 'dateFile', // 文件输出
        filename: './logs/',
        pattern: "yyyy-MM-dd.log",
        alwaysIncludePattern: true,
        maxLogSize: 1024,
        backups: 4,
        category: 'app' // 记录器名
      }
    ],
    levels: {
      logInfo: "ALL",
    },
  },
  dev: {
    appenders: [
      {
        type: "console", // 控制台输出
        category: "app"
      }
    ],
    levels: {
      logInfo: "ALL"
    }
  }
};

module.exports = log4jsConfig[env];