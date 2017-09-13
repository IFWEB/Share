# node-zookeeper-dubbo
nodejs通过dubbo默认协议通信

[![NPM version][npm-image]][npm-url]


### Usage

```javascript
const nzd=require('node-zookeeper-dubbo');
const app=require('express')();
const opt={
  application:{name:'fxxk'},
  register:'www.cctv.com:2181',
  dubboVer:'2.5.3.6',
  root:'dubbo',
  dependencies:{
    Foo:{
      interface:'com.service.Foo',
      version:'LATEST',
      timeout:6000,
      group:'isis',
      methodSignature: {
        findById = (id) => [ {'$class': 'java.lang.Long', '$': id} ],
        findByName = (name) => (java) => [ java.String(name) ],
      }
    },
    Bar:{
      interface:'com.service.Bar',
      version:'LATEST',
      timeout:6000,
      group:'gcd'
    }
  }  
}
opt.java = require('js-to-java')

const Dubbo=new nzd(opt);

const customerObj = {
  $class: 'com.xxx.XXXDTO',
  $: {
    a: 1,
    b: 'test',
    c: {$class: 'java.lang.Long', $: 123}
  }
};

app.get('/foo',(req,res)=>{
  Dubbo.Foo
    .xxMethod({'$class': 'java.lang.Long', '$': '10000000'},customerObj)
    .then(data=>res.send(data))
    .catch(err=>res.send(err))
})

app.get('/foo/findById',(req,res)=>{
  Dubbo.Foo
    .findById(10000)
    .then(data=>res.send(data))
    .catch(err=>res.send(err))
})

app.listen(9090)



```
### Notice

**首先** 必须等待初始化完毕才能正常使用 ,标志就是**Dubbo service init done**

如果要和1.x版本共存的话试试这个，[niv](https://github.com/scott113341/npm-install-version).

### Config
#### application
###### name
项目名
#### register
zookeeper连接字符串
#### dubboVer
dubbo版本
#### root
注册到zk上的根节点，默认为dubbo
#### dependencies
依赖的服务列表
##### interface
服务地址，必填
##### version
版本号，可选，默认2.5.3.6
##### timeout
超时时间，可选，默认6000
##### group
分组，可选
##### methodSignature
方法签名，可选




you can use  [js-to-java](https://github.com/node-modules/js-to-java)
```javascript
var arg1={$class:'int',$:123};
//equivalent
var arg1=java('int',123);
```


[npm-image]:http://img.shields.io/npm/v/node-zookeeper-dubbo.svg?style=flat-square
[npm-url]:https://npmjs.org/package/node-zookeeper-dubbo?style=flat-square
[downloads-image]:http://img.shields.io/npm/dm/node-zookeeper-dubbo.svg?style=flat-square
