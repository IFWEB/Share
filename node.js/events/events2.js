// 也可以通原型的方式非常容易的将其添加到自己的构造函数中
var EventEmitter=require('events').EventEmitter,
    A=function(){};

// 原型
A.prototype.__proto__ = EventEmitter.prototype;

// 或使用比较新的写法
// A.prototype=Object.create(EventEmitter.prototype);

//所有A的实例都具备了事件功能
var a=new A();

a.on('eventName',function(arg1,arg2){
    // do something
    console.log('事件回调，接受到参数:'+arg1+"  "+arg2);
})

// 分发事件，并传入参数
a.emit('eventName','参数1','参数2');

console.log(Object.getPrototypeOf(a));
