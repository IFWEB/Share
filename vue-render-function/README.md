# render函数

我们知道，在初始化Vue组件时，Vue会根据template或el的outerHTML来生成一个render函数用以生成Virtual DOM。但是如果初始化的options对象中没有template并且有render属性的话，就会使用它来做render函数，也就是说我们可以自己手写render函数而不需要Vue帮我们生成（￣ω￣=）。听起来似乎很麻烦的样子，明明template这种HTML写法的更加直观，通过JS手写实在是太反人类反社会主义了。

那么我们为什么还要使用render函数呢，看看官方给的例子：

![image](https://github.com/IFWEB/Share/blob/master/vue-render-function/assets/Image.png)

像这样的template写起来似乎是比较的不优雅，重复代码比较多。如果我们用render函数写的话会是这样的：

![image](https://github.com/IFWEB/Share/blob/master/vue-render-function/assets/Image%20(2).png)

啊，代码清爽了很多，虽然没有template写法直观，但是的确少写了很多代码呀。不过这个例子似乎不够直观，并没有表现出render函数有特别强大的功能（￣ω￣=）。官方文档中说，在绝大多数情况下我们都应该使用template作为模板，只有在需要完全的JS编码能力时才去使用render函数。于是我去看了一圈Vue的开源项目，想看看别的项目中有什么使用render函数的例子。然而，并没有找到(￣ー￣)。只找到Element的messageBox组件有一个不是那么render函数的使用：

![image](https://github.com/IFWEB/Share/blob/master/vue-render-function/assets/Image%20(3).png)

当我们通过this.$msgbox去打开messageBox时，会判断这个message是否为VNode，如果是的话，就将它赋给instance.$slots.default，这样就可以通过js去调用对话框并自定义对话框中的内容。

总的来说，除非使用template无法实现我们的需求，否则还是尽量不要使用render函数。_(:з」∠)_

不说那么多，看一下render函数应该怎么写。
首先，render函数是用来生成VNode的，怎么去生成VNode呢？render函数可以接收一个参数createElement（在Vue中一般习惯用变量h来当形参，h代表hyperscript，意指生成HTML结构的脚本），这个函数就是用来生成VNode的。接下来讲讲这个createElement怎么使用。
createElement函数接收3个参数：
①第一个参数代表HTML标签，可以是string，也可以是结果为string的表达式或返回string的函数。
②第二个参数是代表VNode属性的一个数据对象。
③第三个参数是一个子节点数组，子节点都是VNode，可以用createElement来生成，也可以使用$slots实例属性接收父组件传进来的slot作为子节点。
官网对于第二个参数数据对象的解释：
```
{
    // 和`v-bind:class`一样的 API
    'class': {
    foo: true,
    bar: false
},
// 和`v-bind:style`一样的 API
style: {
    color: 'red',
    fontSize: '14px'
},
// 正常的 HTML 特性
attrs: {
    id: 'foo'
},
// 组件 props
props: {
    myProp: 'bar'
},
// DOM 属性
domProps: {
    innerHTML: 'baz'
},
// 事件监听器基于 "on"
// 所以不再支持如 v-on:keyup.enter 修饰器
// 需要手动匹配 keyCode。
on: {
    click: this.clickHandler
},
// 仅对于组件，用于监听原生事件，而不是组件使用 vm.$emit 触发的事件。
nativeOn: {
    click: this.nativeClickHandler
},
// 自定义指令. 注意事项：不能对绑定的旧值设值
// Vue 会为您持续追踨
directives: [
    {
        name: 'my-custom-directive',
        value: '2'
        expression: '1 + 1',
        arg: 'foo',
        modifiers: {
        bar: true
        }
    }
],
// 作用域插槽
// { name: props => VNode | Array<VNode> }
scopedSlots: {
    default: props => h('span', props.text)
},
// 如果子组件有定义 slot 的名称
slot: 'name-of-slot'
// 其他特殊顶层属性
key: 'myKey',
ref: 'myRef'
}
```
知道应该怎么写render函数之后我们直接上手实践一下，看看会怎么样。
接下来我会用render函数重写model组件的template。template原来是长这个样子的：

![image](https://github.com/IFWEB/Share/blob/master/vue-render-function/assets/Image%20(4).png)

用render函数写完之后亲测可运行的代码是这个样子的：

![image](https://github.com/IFWEB/Share/blob/master/vue-render-function/assets/Image%20(5).png)

啊，似乎代码量一下子就上去了，而且一点都不直观啊！都没办法一眼看出来DOM结构！还好我们的template只是三层的DOM结构，一旦DOM结构的层次变得更深，写起来就更加的僵硬。不仅如此，完全无法享受Vue提供的语法糖了，v-if、v-for、v-model等都需要自己通过JS来手动实现。

最后说一下写render函数需要注意的地方：

1. 不同于template，在render函数中，使用data、methods等属性时，我们需要标明上下文（this）。
2. template中所有传到子组件中的props都要用引号包含，但是在render函数中是不需要的。
3. **事件监听的所有回调函数必须写成箭头函数的形式！**这个是巨大的坑，文档根本没有提及。(≖_≖ )
