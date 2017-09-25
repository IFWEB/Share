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