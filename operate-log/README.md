## node记录操作日志的demo
### 什么是操作日志
简单来说就是用户操作数据（主要是增删改查）的记录。举例：做企业管理系统时，有多多少少都有对数据的完整性有所要求，比如要求系统不能物理删除记录，要求添加每一条数据时都要有系统记录、或者更新某条数据都需要跟踪到变化的内容、或者删除数据时需要记录谁删除了，何时删除了，以便误删后可以通过系统的XXX功能来恢复误删的数据。我将这种功能称为操作日志。

### 为什么要做操作日志？
其主要目的就是跟踪到每一个用户在系统的操作行为，如对数据进行查询、新增、编辑或删除甚至是登录等行为。更进一步的理解可以说是对用户使用系统情况的跟踪，对数据的跟踪防止数据意外删除、更改时有所记录，有所依据，以便对数据的还原，从某种程序上可以保护数据的完整性。  

### 关键信息
我们的系统中也做了不能物理删除的处理，而且由于node作为接口中间层（浏览器-->node接口层-->dubbo服务层），node不直接操作数据库，所以不需要做数据变更的记录（由dubbo层记录）。node层的操作日志主要记录用户操作的业务和操作类型（增删改查）就行。  
userName  操作用户  
businessName 业务名称（指第三级菜单） 
![业务名称](https://raw.githubusercontent.com/IFWEB/share/master/operate-log/img/businessName.png)  
type 操作类型（insert/update/remove/find，和数据库操作名称保持一致,还有一个类型是'unkown:xxx'，当用户写入的操作日志类型不正确时候，比如写类型是'add',则保存如数据库类型是'unkown:add'）  
description 详细描述  
time 操作时间  

### demo运行
安装依赖  
```
$ npm install
```
运行mongodb服务（前提是安装了mongodb）
```
$ mongod
```
运行node
```
$ node app.js 
```
在浏览器访问 http://localhost:3000/operate-log  
查看数据库new-node-deploy的operatelogs表，新添加了一条数据
```
{
    "_id" : ObjectId("59dedd24eb94243238d0981a"),
    "userName" : "chua",
    "businessName" : "内部资产用户管理",
    "description" : "删除用户名QYZH00000901893",
    "type" : "insert",
    "time" : ISODate("2017-10-12T03:10:28.698Z"),
    "__v" : 0
}
```