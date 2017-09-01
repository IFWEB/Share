# pm2
![image](https://raw.githubusercontent.com/unitech/pm2/master/pres/pm2.20d3ef.png)

### 1.基本用法
- step1: 安装pm2
```
$  npm install pm2@latest -g
```
- step2: 定义pm2配置文件，./process.yml
```
apps:
  - name: server
    script: server.js
    watch: true # 开启watcher，文件更改，自动重启
    env    :
      NODE_ENV: dev
      port: 3000
    env_prod    :
      NODE_ENV: prod
      port: 4000
    instances: 0  # 启用多少个实例，可用于负载均衡, 0:根据cpu核数来决定运行多少个进程
    exec_mode: cluster # 使用集群模式来运行，fork:使用fork模式来运行

```
- step3: 使用pm2启动Node服务
```
$ pm2 start precess.yml
# 在特定的env环境启动Node服务
$ pm2 stop all
$ pm2 delete all
$ pm2 start process.yml --env production
```
```
# 查看进程情况
$ pm2 list 
$ pm2 show 0
# 查看日志
$ pm2 logs 
$ pm2 log 0|server
```

== 在使用 “pm2 restart [配置文件] ” 命令重启时服务时，pm2会从缓存中拉取pm2配置文件，所以：如果你更改了pm2配置文件（除env字段），想以最新的配置文件启动服务，需先执行“ pm2 delete [配置文件] ” 删除缓存，再启动服务： “ pm2 start [配置文件] ”。如果配置文件只更改了env字段，你可以使用命令“ pm2 restart [配置文件] --update-env ”来运行，此时pm2运行的env将会是你更改后的env ==


### pm2中的日志：

#### 1. pm2分为普通日志和错误日志，默认情况下，普通日志保存在/home/user/.pm2/logs/[serverName]-out-[instanceId].log文件中，错误日志保存在
/home/user/.pm2/logs/[serverName]-error-[instanceId].log文件中，举个栗子：
```
// process.yml pm2配置文件
apps:
  - name：server
    script: server.js
    watch: true # 开启watcher，文件更改，自动重启
    ignore_watch:
      - node_modules/
      - logs/
      - package.json
      - npm-debug.log
      - npm-debug.log.*
      - process.yml
    instances: 2  # 启用多少个实例，可用于负载均衡, 0:根据cpu核数来决定运行多少个进程
    exec_mode: cluster
```
运行
```
$ pm2 start process.yml
```
此时：
 - instance 0中的普通日志将会保存在/home/user/.pm2/logs/server-out-0.log中，错误日志将保存在/home/user/.pm2/logs/server-error-0.log中；
- instance 1中的普通日志将会保存在/home/user/.pm2/logs/server-out-1.log中，错误日志将保存在/home/user/.pm2/logs/server-error-1.log中；

很多时候，我们想把多个instance的日志合并到同一个文件中，此时，可以在配置文件中添加参数 merge_logs: true
```
// process.yml pm2配置文件
apps:
  - name：server
    script: server.js
    watch: true # 开启watcher，文件更改，自动重启
    ignore_watch:
      - node_modules/
      - logs/
      - package.json
      - npm-debug.log
      - npm-debug.log.*
      - process.yml
    instances: 2  # 启用多少个实例，可用于负载均衡, 0:根据cpu核数来决定运行多少个进程
    exec_mode: cluster
    merge_logs: true # 合并日志，默认不合并。合并时会把所有instance日志输出至一个文件
```
此时：
- 所有的instance的普通日志会输出到/home/user/.pm2/logs/server-out.log中，错误日志会输出到/home/user/.pm2/logs/server-error.log中
#### 2. 自定义日志文件输出目录,并添加日志日期前缀
```
// process.yml pm2配置文件
apps:
  - name: server
    script: server.js
    watch: true # 开启watcher，文件更改，自动重启
    ignore_watch:
      - node_modules/
      - logs/
      - package.json
      - npm-debug.log
      - npm-debug.log.*
      - process.yml
    instances: 2  # 启用多少个实例，可用于负载均衡, 0:根据cpu核数来决定运行多少个进程
    exec_mode: cluster
    out_file : ./logs/out.log # 默认放在/home/user/.pm2/logs/文件夹中
    error_file : ./logs/error.log
    log_file: ./logs/combined.log # 将out日志和error日志合并在一起
    merge_logs: true # 合并日志，默认不合并。合并时会把所有instance日志输出至一个文件
    log_date_format : YYYY-MM-DD HH:mm:ss Z # 日志日期前缀
```
此时：
- 所有的instance的普通日志会输出到./logs/out.log中，错误日志会输出到./logs/error.log中,普通日志和错误日志会合并到./logs/combined.log文件中

#### 3. 普通日志(out_file) && 错误日志(error_file)
- 以下情况会作为普通日志输出
  - console.log()
  - console.info()    //console.info() 函数是 console.log() 的一个别名
  - console.dir()
- 以下情况会作为错误日志输出
  - console.error()
  - console.warn()    // console.warn() 函数是 console.error() 的一个别名
  - console.trace()
  - throw new Error();
  - console.assert(false, 'some message'); // AssertionError
  - node程序运行时捕获的错误：RangeError,ReferenceError，SyntaxError， TypeError

==注意：通过try()catch(err){}语句捕获的错误将不会输出至错误日志==

举个栗子：
```
// server.js
var express = require('express');
var app = express();

var port = process.env.port || 3000;

app.get('/captureError', function(req, res, next) {
    ++a; // 变量a未被定义，会抛出一个ReferenceError错误
})

app.get('/error', function(req, res, next) {
    throw new Error('抛出错误'); // 手动抛出错误
})

app.get('/assertFalse', function(req, res, next) {
    console.assert(false, '断言为false,抛出 AssertionError');  // 断言为false,抛出 AssertionError
})

// 处理404
app.use(function(req, res, next) {
    res.status(404);
    res.send('404 Not Found');
})

app.listen(port, function() {
    console.log('这是一个log');
    console.info('这是一个info'); // console.info() 函数是 console.log() 的一个别名
    console.dir({ 'pm2': 'Advanced, production process manager for Node.js' });

    console.trace('res');
    console.error('这是一个error');
    console.warn('这是一个warn'); // console.warn() 函数是 console.error() 的一个别名
});

// process.yml

apps:
  - name: server
    script: server.js
    watch: true # 开启watcher，文件更改，自动重启
    ignore_watch:
      - node_modules/
      - logs/
      - package.json
      - npm-debug.log
      - npm-debug.log.*
      - process.yml
    instances: 1  # 启用多少个实例，可用于负载均衡, 0:根据cpu核数来决定运行多少个进程
    exec_mode: cluster
    out_file : ./logs/out.log # 默认放在/home/user/.pm2/logs/文件夹中
    error_file : ./logs/error.log
    merge_logs: true # 合并日志，默认不合并。合并时会把所有instance日志输出至一个文件
    log_date_format : YYYY-MM-DD HH:mm:ss Z
```
运行：
```
$ pm2 start process.yml
```
会在./logs/out.log输出：
```
2017-08-30 15:07:38 +08:00: 这是一个log
2017-08-30 15:07:38 +08:00: 这是一个info
2017-08-30 15:07:38 +08:00: { pm2: 'Advanced, production process manager for Node.js' }

```
会在./logs/error.log输出：
```
2017-08-30 15:07:38 +08:00: Trace: res
    at Server.<anonymous> (H:\IFWEB\Share\node.js\pm2\server.js:35:13)
    at Server.g (events.js:260:16)
    at emitNone (events.js:72:20)
    at Server.emit (events.js:166:7)
    at emitListeningNT (net.js:1260:10)
    at nextTickCallbackWith1Arg (node.js:431:9)
    at process._tickDomainCallback (node.js:394:17)
2017-08-30 15:07:38 +08:00: 这是一个error
2017-08-30 15:07:38 +08:00: 这是一个warn

```
分别访问：localhost:3000/captureError,localhost:3000/error,localhost:3000/assertFalse,会在./logs/error.log输出
```
2017-08-30 15:31:23 +08:00: ReferenceError: a is not defined
    at H:\IFWEB\Share\node.js\pm2\server.js:7:7
    at Layer.handle [as handle_request] (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\layer.js:95:5)
    at next (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\route.js:137:13)
    at Route.dispatch (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\route.js:112:3)
    at Layer.handle [as handle_request] (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\layer.js:95:5)
    at H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\index.js:281:22
    at Function.process_params (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\index.js:335:12)
    at next (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\index.js:275:10)
    at expressInit (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\middleware\init.js:40:5)
    at Layer.handle [as handle_request] (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\layer.js:95:5)
2017-08-30 15:31:36 +08:00: Error: 抛出错误
    at H:\IFWEB\Share\node.js\pm2\server.js:11:11
    at Layer.handle [as handle_request] (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\layer.js:95:5)
    at next (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\route.js:137:13)
    at Route.dispatch (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\route.js:112:3)
    at Layer.handle [as handle_request] (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\layer.js:95:5)
    at H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\index.js:281:22
    at Function.process_params (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\index.js:335:12)
    at next (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\index.js:275:10)
    at expressInit (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\middleware\init.js:40:5)
    at Layer.handle [as handle_request] (H:\IFWEB\Share\node.js\pm2\node_modules\_express@4.15.4@express\lib\router\layer.js:95:5)
2017-08-30 15:31:57 +08:00: AssertionError: 断言为false,抛出 AssertionError
    at Console.assert (console.js:93:23)
```
4. pm2 flush 命令能清除默认目录（/home/user/.pm2/logs/）下的日志文件，和自定义目录输出的日志文件的内容

5. ==pm2 reloadLogs到底起什么作用？？？==

6. [pm2-logrotate](https://github.com/pm2-hive/pm2-logrotate#configure)

使用pm2-logrotate进行日志管理使得我们的node服务的log以及pm2的log能够得到控制，将log以时间为单位拆分成多个文件，防止log过多导致把磁盘刷爆。
- step1: 安装pm2-logrotate
```
$pm2 install pm2-logrotate
```
安装完成后启动pm2会自动开启pm2-logrotate
- 部分配置configure
  - `max_size` (Defaults to `10MB`): 文件最大容量，`10G`, `10M`, `10K`
  - `retain` (Defaults to `all`): ==不明白？？？==.
  - `compress` (Defaults to `false`): 是否压缩日志文件
  - `dateFormat` (Defaults to `YYYY-MM-DD_HH-mm-ss`) : 日期格式

- 如何更改配置？
```
$ pm2 set pm2-logrotate:max_size 1K 
$ pm2 set pm2-logrotate:compress true
```
== 开启pm2-logrotate后无法手动停止，只能通过卸载pm2-logrotate的方式来停止“ pm2 uninstall pm2-logrotate” ==
#### 使用[keymetrics](https://app.keymetrics.io/)图形界面进行监控
![image](https://i.imgur.com/bgPDwbF.png)
