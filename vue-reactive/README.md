# 先大概说下Vue响应式实现的原理。
![image](https://github.com/IFWEB/Share/blob/master/vue-reactive/assets/Image.jpg)

**Vue的响应式原理是通过“观察者、订阅者”模式实现的。**

首先，Vue会给data及data下的数组、对象循环调用Object.defineProperty方法来设置getter和setter，以此来拦截data的赋值和取值。也就是说，当我们赋值（如：`this.property='string'`）时，会调用Object.defineProperty方法设置的set方法，当我们取值时（如：`<div v-if="title">{{title}}</div>`），会调用设置的get方法。

get方法会判断当前Dep.target（Dep对象用于维护依赖，Dep.target用于保存当前Watcher对象）是否为空，如果不为空，则将Dep.target加入到dep对象的subs数组中用以记录依赖，也就是说这个subs数组中记录了所有会取该data的Watcher对象，这样的话当该data发生改变时，我们就能通过这个数组来通知所有的依赖去进行更新，从而完成响应式。

这个通知过程就是通过set方法来完成的。set方法会调用dep.notify方法来通知所有依赖的Watcher对象，让他们调用自己的update方法来进行更新。

**接下来说一下这个Watcher是如何创建的。**

当Vue组件在渲染时，会先通过compileToFunctions函数将组件的template来生成一个render函数（这个render函数是用于生成VNode虚拟DOM树的），然后会创建一个Watcher对象，并将生成的render函数传给这个Watcher对象用于更新。当Watcher对象创建时，会调用我们传进去的render函数，调用render函数时会去获取template中使用到的data的值，这样的话就会触碰到getter，将这个Watcher对象添加到依赖中。这样我们整一个链路就完成了。

当data发生改变，就会通知这个Watcher对象去更新，这个Watcher对象就会调用render函数去重新渲染。由于Vue2.0使用的是Virtual DOM，所以当data改变时，重新渲染的就只有改变的部分，不用担心整个组件重新渲染造成性能问题，所以整一个render就只需要一个Watcher对象去维护而不是像Vue1.0时那样每一个Directive对应一个Watcher对象。
