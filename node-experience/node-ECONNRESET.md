### node post请求ECONNRESET
当前端是post请求但是body中没有设置任何参数时，/newconsole/consoleapi/selectRechargeInfo接口中node去请求23服务器的'/newconsole/consoleapi/isLogin'接口会抛出异常如下
```
reqest /newconsole/consoleapi/selectRechargeInfo error
{ Error: socket hang up
    at createHangUpError (_http_client.js:345:15)
    at Socket.socketOnEnd (_http_client.js:437:23)
    at emitNone (events.js:110:20)
    at Socket.emit (events.js:207:7)
    at endReadableNT (_stream_readable.js:1059:12)
    at _combinedTickCallback (internal/process/next_tick.js:138:11)
    at process._tickCallback (internal/process/next_tick.js:180:9) code: 'ECONNRESET' }

```
具体原因是请求/newconsole/consoleapi/selectRechargeInfo经过node-master将请求的某些东西更改了，然后在更改的上下文环境下再去请求23服务器的'/newconsole/consoleapi/isLogin'请求抛错。如果直接访问node-console的/newconsole/consoleapi/selectRechargeInfo接口则不会有次问题
