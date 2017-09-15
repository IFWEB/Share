## 这是一个node链接使用zookeeper作为注册中心，服务使用dubbox 2.8.4来提供的demo 
其中使用到了node-zookeeper-dubbo插件，具体安装和使用参考：[node-zookeeper-dubbo](https://github.com/p412726700/node-zookeeper-dubbo)  
但是这里有个问题，node-zookeeper-dubbo 2.2.1中encode.js第35行后的一段代码是有问题的
```
  // var ver = this._opt._dver || '2.5.3.6';
  // if(ver.startsWith('2.8')){
  //   body.write(-1);  //for dubbox 2.8.X
  // }
```
如果上面这段代码不注释掉，那么总是会报
```
Fail to decode request due to: RpcInvocation[methodName=getAvailableQuickPayBankMap, parameterTypes=[], arguments=null, attachments={dubbo=2.8.4, input=220, path=com.njq.nongfadai.service.IBankService, version=1.0.0}
```
我把这部分代码注释以后就可以用了,所以我将node-zookeeper-dubbo插件完整的拷贝出来将上面那段代码注释，改了一个文件名称为node-zookeeper-dubbox

## 运行
```
$ cd dubbox 
$ node test.js
```
在浏览器上执行  
http://localhost:9090/IBankService/getAvailableQuickPayBankMap  
http://localhost:9090/IAssetAccountService/getZhye  
http://localhost:9090/IBigDataService/getUserInvestRank  
http://localhost:9090/IMediaNoticeService/getIndexMediaReport    
可以看到访问.23服务器的效果
