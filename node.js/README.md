##   Node.js
![image](http://f11.baidu.com/it/u=1718780317,1726177806&fm=72)
### 一、基于事件轮询的非阻塞I/O

1. 事件轮询 #example: events
##### 事件的监听与分发依赖于events模块中的EventEmitter 
node中的http、net、fs等模块都是继承自EventEmitter，同样具有事件功能

![image](http://www.th7.cn/d/file/p/2015/09/29/9d06c9ad8f073015563753c2755e7012.jpg)

==Node会先注册事件，然后不停的询问内核这些事件是否已经分发。当事件分发时，对应的回调函数就会触发。如果没有事件触发，则继续执行其他的代码，直到有新的事件触发，再去执行对应的回调函数==

2. 非阻塞I/O
- 别阻塞——`Node.js`是单线程的，如果代码阻塞的话所有其他一切都停止了
- 快速返回——操作应当快速返回。如果不能快速返回，就应当将其迁移到另一个进程中


### 二、一个简单的HTTP服务 #example: http
这个例子中：接受请求体这一部分可作为公用代码，改进，看一个基于connect实现中间件管理的例子

### 三、[connect](https://github.com/senchalabs/connect)：基于Web服务器做==中间件==管理 #example: connect
使用中间件的好处：

- 模型简单，仅仅只是一个一个中间队列，进行流式处理而已，流式处理可能性能不是最优，但是却是最易于被理解和接受。
- 中间件易于组合和插拔
- 中间件易于定制和优化
- 丰富的中间件
以上例子任然需要频繁的去根据判断请求url来执行相应的中间件，可通过给中间件挂载url来改进：

### 四、[express](http://www.expressjs.com.cn/)，在connect的基础上又增添了许多功能 #example: express
- 模板引擎
- 路由处理
- Request Extension
- Response Extension

使用express更改上面的例子：
#### Express@4.x中一些常用的第三方中间件：
- [basic-auth](https://github.com/jshttp/basic-auth) 用户认证 #example middlewares/basic-auth
- [body-parser](https://github.com/expressjs/body-parser) 解析客户端请求body 
- [cookie-parser](https://github.com/expressjs/cookie-parser) 解析cookie #example middlewares/cookie-parser
- [express-session](https://github.com/expressjs/session) 会话 #example middlewares/express-session
- [response-time](https://github.com/expressjs/response-time) 在响应头中添加X-Response-Time字段  #example middlewares/response-time
- express.statice   express内置， 访问静态文件 #example middlewares/expressStatic
- [serve-index](https://github.com/expressjs/serve-index) 列出某个目录下的所有子目录 #example middlewares/serve-index
- [serve-favicon](https://github.com/expressjs/serve-favicon) favicon #example middlewares/serve-favicon

==Express 4 不再依赖 Connect，而且从内核中移除了除 express.static 外的所有内置中间件.==查看[Express 3 和 Express 4 中对应的中间件](http://www.expressjs.com.cn/guide/migrating-4.html)
### 五、mongoDB #example: mongoDB
1. [monogoose](http://mongoosejs.com/)
```
$ npm install mongoose --save
```
### 六、日志记录[log4js](http://stritti.github.io/log4js/) #example: log4js

### 七、开发&调试
1. [node-dev](https://github.com/fgnass/node-dev)  代码修改，自动重启服务，使用方法：
- step1: 安装node-dev
```
$ npm install node-dev --save-dev
```
- step2: 使用node-dev启动服务
```
$ node-dev server.js
```
2. [node-inspector](https://github.com/node-inspector/node-inspector) node.js应用调试,使用方法：
- step1: 安装node-inspector
```
$ npm install node-inspector --save-dev
```
- step2: 启动node服务，开启debug模式,默认端口:5858
```
$ node --debug server.js
```
你也可以更改端口:
```
$ node--debug=5000 server.js
```
- step3: 开启node-inspector,默认端口8080，开启成功后在会在控制台返回相应的地址，在浏览器中打开即可
```
$ node-inspector 
```
你也可以更改端口:
```
$ node-inspector --web-port=8000
```

### 八、部署
1. [forever](https://github.com/foreverjs/forever) 守护进程
- step1: 安装forever
```
$ npm install -g forever
```
- step2: 使用forever开启node服务
```
$ forever start server.js

# 停止forever开启的node服务
$ forever stop server.js
```
2. [pm2](http://pm2.keymetrics.io/) #example: pm2,比forever更加强大

pm2 | forever
---|---
守护进程 | 守护进程
远程部署 | ---------   
监控     | --------- 
日志记录 | --------- 
多进程启动|---------

- step1: 安装pm2
```
$  npm install pm2@latest -g
```
- step2: 定义pm2配置文件，./process.yml
```
apps:
  - script   : server.js
    watch  : true # 开启watcher，文件更改，自动重启
    ignore_watch:
      - node_modules
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

### 九、es6 #example: babel

1. 使用es-checker查看node对es6的支持情况
- step1: 安装es-checker
```
$ npm install -g es-checker
```
- step2: 查看node对es6的支持情况
```
$ es-checker
```
2. 使用babel将es6转换为es5
- step1: 安装babel-cli
```
$ npm install babel-cli -g
```
- step2: 安装转码规则
```
# 最新转码规则
$ npm install --save-dev babel-preset-latest

# react 转码规则
$ npm install --save-dev babel-preset-react

# vue 转码规则
$ npm install --save-dev babel-preset-flow-vue

# 不同阶段语法提案的转码规则（共有4个阶段），选装一个
$ npm install --save-dev babel-preset-stage-0
$ npm install --save-dev babel-preset-stage-1
$ npm install --save-dev babel-preset-stage-2
$ npm install --save-dev babel-preset-stage-3
```
- step3: 配置文件.babelrc,存放在项目的根目录下
```
  {
    "presets": [
      "latest",
      "react",
      "flow-vue",
      "stage-2"
    ],
    "plugins": []
  }
```
- step4: 转码
```
$ babel ./src -d ./lib
```