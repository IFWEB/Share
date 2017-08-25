var EventEmitter=require('events').EventEmitter,
    a=new EventEmitter(); // 定义一个事件发射器

// 监听一个事件，事件名为eventName.  on类似于浏览器端的addEventListener
a.on('eventName',function(){
    // do something
    console.log('事件回调');
})

// 分发一个事件，事件名为eventName.  emit类似于浏览器端的dispatchEvent
a.emit('eventName')
