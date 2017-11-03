# Vue源码研究之diff机制

之前研究Vue的响应式原理有提到，当数据发生变化时，Watcher会调用`vm._update(vm._render(), hydrating)`来进行DOM更新，接下来我们看看这个具体的更新过程是如何实现的。

```javascript
//摘自core\instance\lifecycle.js
Vue.prototype._update = function(vnode: VNode, hydrating ? : boolean) {
        const vm: Component = this
        if (vm._isMounted) {
            callHook(vm, 'beforeUpdate')
        }
        const prevEl = vm.$el
        const prevVnode = vm._vnode
        const prevActiveInstance = activeInstance
        activeInstance = vm
        vm._vnode = vnode
        if (!prevVnode) {
            // initial render
            vm.$el = vm.__patch__(
                    vm.$el, vnode, hydrating, false /* removeOnly */ ,
                    vm.$options._parentElm,
                    vm.$options._refElm
                )
            vm.$options._parentElm = vm.$options._refElm = null
        } else {
            // updates
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
        activeInstance = prevActiveInstance
        if (prevEl) {
            prevEl.__vue__ = null
        }
        if (vm.$el) {
            vm.$el.__vue__ = vm
        }
        if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
            vm.$parent.$el = vm.$el
        }
    }
```

(这里我们就将一些不太重要的代码忽略掉不讲了，比如callHook调用钩子函数之类的，我们只关注实现DOM更新相关代码。)
这里面最重要的代码就是通过`vm.__patch__`进行DOM更新。如果之前没有渲染过，就直接调用`vm.__patch__`生成真正的DOM并将生成的DOM挂载到vm.$el上，否则会调用`vm.__patch__(prevVnode, vnode)`将当前vnode与之前的vnode进行diff比较，最小化更新。

接下来我们就看一下这个最重要的`vm.__patch__`到底做了些什么。

```javascript
//摘自platforms\web\runtime\patch.js
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

可以看到__patch__方法主要就是调用了createPatchFunction这个函数。这个函数的代码就不全部贴上来了，总共600多行(￣ー￣)。一步步看看它到底干了些什么。

这个函数首先在里面定义了很多的函数，顾名思义，这个函数的作用是创建并返回一个patch函数。

```javascript
//摘自core\vdom\patch.js
......
return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue, parentElm, refElm)
    } else {
      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } else {
        ......
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)
        createElm(
          vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          while (ancestor) {
            ancestor.elm = vnode.elm
            ancestor = ancestor.parent
          }
          if (isPatchable(vnode)) {
            for (let i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent)
            }
          }
        }

        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
```

这个patch函数里，会进行许多的判断。

1. 判断vnode和oldVnode是否isDef（即非undefined且非null，下面简称已定义），若vnode已定义且oldVnode未定义，没有新的vnode就意味着要将组件销毁掉，就会循环调用invokeDestroyHook函数将oldVnode销毁掉。
1. 如果oldVnode未定义，意味着这是第一次patch，就会调用`createElm(vnode, insertedVnodeQueue, parentElm, refElm)`创建一个新的DOM。
1. 如果oldVnode跟vnode是同一个vnode，且oldVnode.nodeType未定义，就调用`patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)`来更新oldVnode并生成新的DOM。
1. 如果oldVnode跟vnode不同，会调用createElm函数来创建新的DOM。

也就是说，会调用createElm函数来创建新的DOM或者调用patchVnode函数来更新vnode并生成新的DOM。那么接下来分别看看这两个函数。

```javascript
function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
  vnode.isRootInsert = !nested // for transition enter check
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }

  const data = vnode.data
  const children = vnode.children
  const tag = vnode.tag
  if (isDef(tag)) {
    if (process.env.NODE_ENV !== 'production') {
      if (data && data.pre) {
        inPre++
      }
      if (
        !inPre &&
        !vnode.ns &&
        !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
        config.isUnknownElement(tag)
      ) {
        warn(
          'Unknown custom element: <' + tag + '> - did you ' +
          'register the component correctly? For recursive components, ' +
          'make sure to provide the "name" option.',
          vnode.context
        )
      }
    }
    vnode.elm = vnode.ns
      ? nodeOps.createElementNS(vnode.ns, tag)
      : nodeOps.createElement(tag, vnode)
    setScope(vnode)

    /* istanbul ignore if */
    if (__WEEX__) {
      // in Weex, the default insertion order is parent-first.
      // List items can be optimized to use children-first insertion
      // with append="tree".
      const appendAsTree = isDef(data) && isTrue(data.appendAsTree)
      if (!appendAsTree) {
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        insert(parentElm, vnode.elm, refElm)
      }
      createChildren(vnode, children, insertedVnodeQueue)
      if (appendAsTree) {
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        insert(parentElm, vnode.elm, refElm)
      }
    } else {
      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
      insert(parentElm, vnode.elm, refElm)
    }

    if (process.env.NODE_ENV !== 'production' && data && data.pre) {
      inPre--
    }
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  }
}
```