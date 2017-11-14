### node post请求ECONNRESET
当前端是post请求但是body中没有设置任何参数时，node去请求23服务器的'/newconsole/consoleapi/isLogin'接口会抛出异常如下
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
目前没有找到抛出异常的根本原因。