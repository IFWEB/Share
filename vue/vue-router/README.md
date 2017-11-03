我们知道，使用Vue构建的应用都是单页面应用，那么它自然也需要一个router来根据不同的url显示不同的页面。先看一个最基础的router是如何实现的。

## 一、简单的路由配置

```html
<div id="app">
    <h1>Hello App!</h1>
    <p>
        <!-- 使用 router-link 组件来导航. -->
        <!-- 通过传入 `to` 属性指定链接. -->
        <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
        <router-link to="/foo">Go to Foo</router-link>
        <router-link to="/bar">Go to Bar</router-link>
    </p>
    <!-- 路由出口 -->
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
</div>
```

```javascript
// 0. 如果使用模块化机制编程，導入Vue和VueRouter，要调用 Vue.use(VueRouter)

// 1. 定义（路由）组件。
// 可以从其他文件 import 进来
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. 定义路由
const routes = [
    { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
]

// 3. 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
    routes
     // （缩写）相当于 routes: routes
})

// 4. 创建和挂载根实例。
const app = new Vue({
    router
}).$mount('#app')
```

可以看到，首先我们需要定义组件，然后再定义url跟组件的对应关系（也就是routes），然后将这个routes当作根实例的配置项，就完成了路由的配置。
路由匹配到的组件会在router-view所在的占位进行渲染，而我们可以通过router-link或`vm.$router.push()`进行路由之间的跳转。

## 二、动态路由匹配
```javascript
const router = new VueRouter({
    routes: [
        // 动态路径参数 以冒号开头
        { path: '/user/:id', component: User }
    ]
})
```

像这样，我们可以用动态的路径参数去匹配路由，匹配到路由之后，参数的值会被保存到`this.$route.params`，我们可以在组件中获取到这些值。
需要注意的是，如果只是动态路径参数发生变化，如url从`/user/123`变化为`/user/456时`，原来的组件实例会被复用。这个时候我们要注意mounted、created这些钩子函数是不会被调用的，于是我们可以watch一下$route的变化，将相应的操作放到这里来。

## 三、向路由组件传递props

`{ path: '/user/:id', component: User, props: true }`，只需要像这样把props值设为true，动态路由的参数值就可以通过props的方式传到组件中，而不用通过`this.$route.params`获取。这样就实现了组件跟路由的解耦，不管这个数据是从父组件还是路由中传递过来的，我们都可以用同一套操作去对待。

## 四、导航守卫

导航守卫相当于路由时的钩子函数，不过有些导航守卫能够终止当前的导航。包括全局守卫beforeEach、全局后置钩子afterEach、路由独享守卫beforeEnter、组件内守卫beforeRouteEnter、beforeRouteUpdate和beforeRouteLeave。
如：`router.beforeEach((to, from, next) => {    // ...    })`，每个守卫接受3个参数，to表示即将要进入的路由对象，from表示当前正要离开的路由对象，next是用来resolve当前钩子函数的一个方法，当我们调用next之后，导航就会进入下一个钩子函数。`next(false)`会终止当前的导航，`next('/path')`或者`next({path:'/path'})`会停止当前导航并进行新的导航。
需要注意的是，beforeRouteEnter中无法访问this，因为此时组件实例还没被创建，我们可以传一个回调函数给next，在导航被确认之后会将组件实例作为参数执行该回调。如下：
```javascript
beforeRouteEnter (to, from, next) {
    next(vm => {
       // 通过 `vm` 访问组件实例
    })
}
```

### 完整的导航解析流程如下：

1. 导航被触发。
2. 在失活的组建里调用离开守卫。
3. 调用全局的 beforeEach 守卫。
4. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
5. 在路由配置里调用 beforeEnter。
6. 解析异步路由组件。
7. 在被激活的组件里调用 beforeRouteEnter。
8. 调用全局的 beforeResolve 守卫 (2.5+)。
9. 导航被确认。
10. 调用全局的 afterEach 钩子。
11. 触发 DOM 更新。
12. 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。


## 五、路由懒加载
结合Vue的异步组件和Webpack的代码分割功能，我们能够实现路由组件的懒加载。`const Component= () => import('./Component.vue')`，像这样我们就能定义一个能被Webpack进行代码分割的异步组件，然后我们将该组件用于路由配置就可以了。

需要注意的是，当项目比较大时，路由懒加载可能会造成热更新时webpack打包非常慢。这个时候我们可以根据NODE_ENV只在生产环境才进行路由懒加载，这样就能使我们在开发环境中更快地完成热更新打包。


动态路由匹配，嵌套路由，重命名，别名以及向路由组件传递props这些其实都是为了更方便地去配置路由，或者让路由能实现更多的功能。router的本质，其实就是让应用知道，对应这个url，匹配的是哪一个路由，应该显示哪一个组件。

## 新console路由配置
接下来看一下应该如何去实现我们后台管理系统的三层导航路由。上方导航菜单是第一层路由，侧边栏的二级菜单和三级菜单是第二、三层路由。
我们需要根据后台返回的菜单数据生成routes，后台所返回的菜单数据与我们所需要的路由对象类似，我们只需要给它每一个项添加一个component就可以了。
```javascript
if (source['path'] !== undefined) {
    if (source['path']) {
        //用于将父辈菜单项的path与当前path进行拼接
        currPath += source['path'] !== '/' ?
            '/' + source['path'] :
            '/';
    } else {
        if (currPath.charAt(currPath.length - 1) !== '/') {
            //防止出现path为空的children与父同name的情况
            currPath += '/';
        }
    }
    //将拼接后的字符串赋给菜单数据的name属性
    source['name'] = currPath;
 
    //为菜单项添加component属性
    source['component'] = getComponent({
        path: currPath,
        level: level,
        children: source.children
    });
    //为只有第一层菜单的菜单项添加一个空的子菜单项，防止侧边栏找不到子菜单项而报错
    if (_level === 1 && !(source['children'] && source['children'].length)) {
        source.children = [{
            "path": "",
            "label": source.label,
            "component": getComponent({
                path: "",
                level: 2,
                children: source.children
            })
        }];
    }
}
```

可以看到，上面的代码最为重要的部分就是给菜单项添加component属性，以添加url和组件的对应关系。下面再看一下getComponent这个函数是如何添加component属性的。
```javascript
function getComponent(opts) {
    var result = null,
        pathStr = opts.path.split('/').join('_') || '_';
    if (opts.level > 1) {
        if (opts.children && opts.children.length > 0) {
            //当前大于第一层，且有children，即还包含三级子目录
            result = require('src/pages/index/empty.vue');
        } else {
            //根据map.js返回url对应的component
            result = map(pathStr) || require('src/pages/index/default/main.vue');
        }
    } else {
        //第一层
        result = require('src/pages/index/empty.vue');
    }
    return result;
}
```

可以看到，第一层和第二层的菜单项的component属性都是empty.vue，这是一个用于装载router-view的空组件。这是因为Vue-Router的每一级路由都是要对应一个component，从而层层嵌套的，如下图所示。


第一级的菜单会在index.vue中的router-view处渲染，第二级的菜单会在第一级菜单对应的component中的router-view处渲染，所以我们需要一个有router-view的空组件用于承载下一级的component。由于只有第三级菜单项才是真实对应一个页面的，所以第一级和第二级的菜单对应的component都是空组件。
```javascript
for (var key in source) {
    if (checkType(source[key], 'Object') && key !== 'component') {
        if (source[key]['path'] !== undefined) {
            if (checkType(source, 'Array')) {  
                //如果当前项是数组，将数组的所有元素递归调用transRoute并push到result中
                result.push(transRoute(source[key], currPath, _level));
            } else {
                result[key] = transRoute(source[key], currPath, _level);
            }
        }
    } else if (checkType(source[key], 'Array')) {
        //children属性递归调用transRoute并赋值
        result[key] = transRoute(source[key], currPath, _level);
    } else {   
        //非Object属性或component组件内容无需遍历直接赋值
        result[key] = source[key];
    }
}
```

上面的代码主要是对菜单数据进行了深拷贝，生成路由对象用于路由。这样，我们的路由就完成了。
