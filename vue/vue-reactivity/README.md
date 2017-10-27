# 先大概说下Vue响应式实现的原理。
![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image.jpg)

**Vue的响应式原理是通过“观察者/订阅者”模式实现的。**

首先，Vue会给data及data下的数组、对象循环调用`Object.defineProperty`方法来设置getter和setter，以此来拦截data的赋值和取值。也就是说，当我们赋值（如：`this.property='string'`）时，会调用`Object.defineProperty`方法设置的set方法，当我们取值时（如：`<div v-if="title">{{title}}</div>`），会调用设置的get方法。

get方法会判断当前`Dep.target`（Dep对象用于维护依赖，`Dep.target`用于保存当前Watcher对象）是否为空，如果不为空，则将`Dep.target`加入到dep对象的subs数组中用以记录依赖，也就是说这个subs数组中记录了所有会取该data的Watcher对象，这样的话当该data发生改变时，我们就能通过这个数组来通知所有的依赖去进行更新，从而完成响应式。

这个通知过程就是通过set方法来完成的。set方法会调用dep.notify方法来通知所有依赖的Watcher对象，让他们调用自己的update方法来进行更新。

接下来说一下这个Watcher是如何创建的。

当Vue组件在渲染时，会先通过compileToFunctions函数将组件的template来生成一个render函数（这个render函数是用于生成VNode虚拟DOM树的），然后会创建一个Watcher对象，并将生成的render函数传给这个Watcher对象用于更新。当Watcher对象创建时，会调用我们传进去的render函数，调用render函数时会去获取template中使用到的data的值，这样的话就会触碰到getter，将这个Watcher对象添加到依赖中。这样我们整一个链路就完成了。

当data发生改变，就会通知这个Watcher对象去更新，这个Watcher对象就会调用render函数去重新渲染。由于Vue2.0使用的是Virtual DOM，所以当data改变时，重新渲染的就只有改变的部分，不用担心整个组件重新渲染造成性能问题，所以整一个render就只需要一个Watcher对象去维护而不是像Vue1.0时那样每一个Directive对应一个Watcher对象。


**1. 为什么有时候我的数据响应式会失效？**

由于这个响应式的建立是在Vue组件渲染时就进行的，所以在代码中给data添加属性就无法实现响应式，因为这些属性并没有加上setter和getter，当它被修改时无法通知Watcher对象去进行更新。

如果我们需要在组件渲染完之后去添加一个响应式的属性，需要用`Vue.$set(obj,'name',value)`来为data对象中已有的对象添加属性。也就是说data中的根属性必须要一开始就定义好，否则无法实现响应式。

举个例子：

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image.png)

我们可以通过`Vue.$set`方法给dialog添加一个响应式的callback属性，但是无法添加一个响应式的data根属性productId（假设productId这个属性一开始没有定义）。

**2. 为什么计算属性也能实现响应式？**

在Vue2.0中，data改变时Watcher对象调用render函数重新渲染，所以使用到计算属性的地方也会被重新计算，从而实现了响应式。

**3. 为什么有时响应会有延时？**

比如当我们修改数据后马上去获取DOM时会发现获取到DOM似乎还没有改变，这是因为当数据发生变化时，Vue会将数据的变化放到一个队列中，等到下一个‘tick’再去执行DOM的更新，从而避免反复地去更新DOM。如果我们有一些需要依赖更新后的DOM的操作，我们可以将这些操作作为回调放到`vm.$nextTick（callback）`里，这样在下一个‘tick’就会执行我们回调函数。


# 接下来看一下代码的具体实现。

## Init

先从建立一个Vue实例开始看。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(2).png)

可以看到，创建Vue实例时，会调用`this._init`方法，接下来看一下`this._init`方法中的关键代码。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(3).png)

这里面调用了一个initState方法，看一下initState方法干了什么。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(4).png)

可以看到，在initState方法中，会调用initProps，initMethods，initData，initComputed，initWatch等方法。它们会根据组件的props，methods，data，computed，watch等进行初始化。
我们主要关注initData方法。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(5).png)

首先，组件options中的data会被赋给`vm._data`，然后会执行`observe（data，true）`，接下来看看observe方法是怎么定义的。

## Observer

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(6).png)

如果value已经有__ob__对象的话，会返回value.__ob__，否则经过一系列判断后（如value是否为数组或对象，value是否可拓展，value是否为Vue实例等）使用value来创建一个Observer对象并返回。接下来看看Observer类是如何定义的。


![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(7).png)

这里首先会给Observer对象new一个Dep对象，Dep对象是用于处理数据依赖的，它有一个id和subs（用于收集依赖）。然后def方法会通过defineProperty把该Observer对象作为__ob__属性添加给value。然后判断value是否为数组，如果是，则调用observeArray方法对数组中的元素调用observe方法；如果不是数组的话会调用walk方法。walk方法会对value中的属性循环调用definereactivity方法。下面看看definereactivity中的关键代码。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(8).png)

首先我们会对value的属性进行observe（`let childOb = !shallow && observe(val)`）。在definereactivity中会调用defineProperty方法给value设置getter和setter，这样我们就可以拦截到value的get和赋值。也就是说当我们使用value时会调用getter来取值，给value赋值时会调用setter而不是想原来一样直接赋值。

当getter被调用时，如果`Dep.target`不为空，则将调用`dep.depend`方法，在depend方法中会调用`Dep.target.addDep`方法（addDep是Watcher类的一个方法）将dep对象push到Dep.target的newDeps数组中，同时会调用Dep类的addSub方法将Watcher对象push到Dep对象中用来记录依赖的subs数组中。然后会调用`childOb.dep.depend()`将Watcher对象收集到value的childOb的dep对象中。

*有一个问题是，childOb的dep对象是Observer类中的dep，而当我们调用setter时，调用dep.notify()来通知依赖该数据的Watcher时，使用的是在definereactivity方法中定义的dep，所以这一步暂时意义不明，可能有别的用途。*

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(9).png)

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(10).png)

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(11).png)

当Watcher对象调用getter时，通过以上代码就可以将依赖该value的Watcher收集起来。

再来看看setter。setter首先是会设置新的值，然后重新observe这个新的值，最后调用`dep.notify()`通知依赖该数据的Watcher对象调用update方法。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(12).png)

## Render

接下来看一下Vue组件的渲染过程。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(13).png)

在_init方法中，会调用`vm.$mount`方法将template或el编译成render函数。这个生成的render函数会在`vm._render`方法中被调用，生成VNode对象。然后经过DOM Diff算法查找差异，生成真正的DOM树，从而实现渲染。

下面看一下具体的实现过程，看看$mount方法到底做了什么。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(14).png)

在$mount方法中，会调用compileToFunctions方法生成render和staticRenderFns。render就是render函数，staticRenderFns是一个数组，包含着不会发生变化的VNode节点所生成的函数。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(15).png)

接下来，$mount方法会调用这个mount方法，而这个mount方法会调用mountComponent方法。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(16).png)

可以看到在mountComponent方法中，会创建一个新的Watcher对象，并传入updateComponent函数，这个函数会返回`vm._update(vm._render(), hydrating)`。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(17).png)

前面我们知道`vm._render`方法会调用生成的render函数来返回一个VNode对象，`vm._update`方法会调用`vm.__patch__`方法将这个VNode对象与之前的VNode对象比较，把差异的部分渲染到真正的DOM树上。

## Watcher

最后来看一看Watcher类的定义。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(18).png)

首先它会将getter设为expOrFn，从上面看到，在渲染时，这个expOrFn就是updateComponent函数。然后会调用get方法。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(19).png)

在get方法中，首先会调用pushTarget函数将Watcher对象设为Dep.target，然后会调用getter函数获取value，也就是会调用`vm._update(vm._render(), hydrating)`，从而调用compileToFunctions函数生成的render函数。在调用render函数的时候，会去获取模板中所使用到的数据，从而触发数据Observer的getter。

由于设置了`Dep.target`，所以触发getter时，数据的Dep对象会将Watcher对象收集为依赖，这样就完成了渲染的依赖收集。每当我们去修改响应式数据时，setter就会通过`dep.notify`方法来调用Watcher的update方法。在调用完getter函数后，会通过popTarget函数将`Dep.target`置空。

![image](https://github.com/IFWEB/Share/blob/master/vue-reactivity/assets/Image%20(20).png)

可以看到update方法中会调用run方法或queueWatcher方法，queueWatcher会将Watcher对象加入到队列中，在nextTick调用它的run方法。所以这两种方式最终都会调用Watcher对象的run方法。在run方法中会再次调用Watcher对象的get方法，重新取值并收集依赖。上面可以看到Watcher对象的get方法会调用getter函数，这个getter函数会去调用`vm._update(vm._render(), hydrating)`，从而重新渲染。

这样当我们修改数据时，就完成了响应式的DOM变化。

