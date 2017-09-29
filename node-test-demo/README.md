#### 1. TDD
TDD指的是Test Drive Development，很明显的意思是测试驱动开发，也就是说我们可以从测试的角度来检验整个项目。大概的流程是先针对每个功能点抽象出接口代码，然后编写单元测试代码，接下来实现接口，运行单元测试代码，循环此过程，直到整个单元测试都通过。这一点和敏捷开发有类似之处。
TDD的好处自然不用多说，它能让你减少程序逻辑方面的错误，尽可能的减少项目中的bug，开始接触编程的时候我们大都有过这样的体验，可能你觉得完成得很完美，自我感觉良好，但是实际测试或者应用的时候才发现里面可能存在一堆bug，或者存在设计问题，或者更严重的逻辑问题，而TDD正好可以帮助我们尽量减少类似事件的发生。而且现在大行其道的一些模式对TDD的支持都非常不错，比如MVC和MVP等。
但是并不是所有的项目都适合TDD这种模式的，我觉得必须具备以下几个条件。
首先，项目的需求必须足够清晰，而且程序员对整个需求有足够的了解，如果这个条件不满足，那么执行的过程中难免失控。当然，要达到这个目标也是需要做一定功课的，这要求我们前期的需求分析以及HLD和LLD都要做得足够的细致和完善。
其次，取决于项目的复杂度和依赖性，对于一个业务模型及其复杂、内部模块之间的相互依赖性非常强的项目，采用TDD反而会得不尝失，这会导致程序员在拆分接口和写测试代码的时候工作量非常大。另外，由于模块之间的依赖性太强，我们在写测试代码的时候可能不采取一些桥接模式来实现，这样势必加大了程序员的工作量。

#### 2. BDD
BDD指的是Behavior Drive Development，也就是行为驱动开发。这里的B并非指的是Business，实际上BDD可以看作是对TDD的一种补充，当然你也可以把它看作TDD的一个分支。因为在TDD中，我们并不能完全保证根据设计所编写的测试就是用户所期望的功能。BDD将这一部分简单和自然化，用自然语言来描述，让开发、测试、BA以及客户都能在这个基础上达成一致。因为测试优先的概念并不是每个人都能接受的，可能有人觉得系统太复杂而难以测试，有人认为不存在的东西无法测试。所以，我们在这里试图转换一种观念，那便是考虑它的行为，也就是说它应该如何运行，然后抽象出能达成共识的规范。

#### mocha
1. 钩子函数
  - befor(fn())
  - beforEach(fn())
  - afterEach(fn())
  - after(fn())

执行顺序:befor-->beforEach-->afterEach-->after
2. .only()决定哪个测试应该被执行，.only()可以被使用多次。 （一般在版本控制时才会使用）
3. .skip() 跳过某个测试（更好的实践：使用.skip()代替.only()）。在运行时跳过:
```
it('should only test in the correct environment', function() {
  if (/* check test environment */) {
    // make assertions
  } else {
    this.skip();
  }
});
```
4. 测试失败后重新测试.retries(num)
- 不要在单元测试中使用
- 在钩子函数breforEach()和afterEach()中不起作用

5. 测试结果输出至文件(默认输出至console)：
```
$ mocha > test-result.txt
```
6. 默认会全局寻找./test/*.js和./test/*.coffee，所以你可能需要将你的测试文件放到./test文件夹中

7. 支持的断言库
- node.js核心库assert,无需第三方依赖  语法较弱
- [should.js](https://github.com/shouldjs/should.js)  BDD风格贯穿始终，API 非常语义
- expect.js - expect() 风格的断言    
- chai - 大而全的 API

这里使用的是should.js断言库    

官方文档：[Moch](http://mochajs.org/)，
这里有一份详细的中文文档：[Mocha.js官方文档翻译](http://www.jianshu.com/p/9c78548caffa)


#### [supertest](https://github.com/visionmedia/supertest)
搭配supertest测试REST Api

#### 运行项目测试例子
1. 开启mongoDB 
```
$ mongod --dbpath=./data_mongo
```
2. 运行测试
```
$ npm run test

```

#### [istanbul](https://istanbul.js.org/)测试覆盖率计算
1. 安装
```
$ npm install -g nyc
```
2. 使用
```
$ npm run istanbul

```
此时，覆盖率报告同时输出在控制台和 .html文件，浏览浏览器中打开./coverage/index.html即可
