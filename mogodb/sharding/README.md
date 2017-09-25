##   mongodb分片例子
这是一个分片的简单例子，所有分片都在本地。  
这个例子只有两个分片分别是（shardsvr1和shardsvr2，他们分别有各自的副本shardsvr1_和shardsvr2_）。mongodb的分片我们不用手动控制如何分，mongodb帮我们处理。当做完分片以后设置一个test数据库允许分片，往test数据库的一个集合userinfo中插入一条数据，按推测两个分片中只有一个分片有改数据（当然其副本也是有数据）。  
本例子中建立一个单独的文件夹C:\mongo\sharding用于分片测试（**你下载到本地以后如果不是这个目录则需要替换掉所有.cfg文件中的c:\mongo\sharding目录为你本地的目录**），而且我把日志文件、数据库文件存放目录、配置文件都放在了一起(真实环境中每一个分片的副本集应该部署到不同的机器，比如shardsvr1和shardsvr1_分别部署到a和b服务器，a服务器挂了不影响使用，自动切换访问b的shardsvr1_)。目录结构如下  
![目录](https://raw.githubusercontent.com/IFWEB/share/master/mogodb/sharding/img/menu.png)  
在命令行依次运行下面的命令，注意mongod和mongo都需要单独的命令行窗口。  
```
//config server配置
mongod --config c:\mongo\sharding\configsvr1\sharding.cfg
mongod --config c:\mongo\sharding\configsvr2\sharding.cfg
mongo --port 27100
rs.initiate(
  {
    _id: "configsvr",
    configsvr: true,
    members: [
      { _id : 0, host : "127.0.0.1:27100" },
      { _id : 1, host : "127.0.0.1:27101" }
    ]
  }
)
//显示配置
rs.conf();


//shard server配置
mongod --config c:\mongo\sharding\shardsvr1\sharding.cfg
mongod --config c:\mongo\sharding\shardsvr1_\sharding.cfg
mongo --port 27010
//设置副本集
rs.initiate(
  {
    _id : "shardsvr1",
    members: [
      { _id : 0, host : "127.0.0.1:27010" },
      { _id : 1, host : "127.0.0.1:27011" }
    ]
  }
)
//显示配置
rs.conf();
mongod --config c:\mongo\sharding\shardsvr2\sharding.cfg
mongod --config c:\mongo\sharding\shardsvr2_\sharding.cfg
mongo --port 27020
//设置副本集
rs.initiate(
  {
    _id : "shardsvr2",
    members: [
      { _id : 0, host : "127.0.0.1:27020" },
      { _id : 1, host : "127.0.0.1:27021" }
    ]
  }
)
//显示配置
rs.conf();


//mongos配置
mongos --config c:\mongo\sharding\router1\sharding.cfg
mongo --port 40000
sh.addShard( "shardsvr1/127.0.0.1:27010")
sh.addShard( "shardsvr2/127.0.0.1:27020")
sh.enableSharding("test")
//测试分片结果
use test
db.userinfo.insert({name: 'chua'})
db.userinfo.find();


//去分片服务器去查看结果
mongo --port 27010
mongo --port 27011
mongo --port 27020
mongo --port 27021
```
**提示：运行具有少于3个配置服务器的分片集群应仅用于测试目的，不建议用于生产。**