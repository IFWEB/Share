# Vue源码研究之diff机制

之前研究Vue的响应式原理有提到， 当数据发生变化时， Watcher会调用 `vm._update(vm._render(), hydrating)`来进行DOM更新， 接下来我们看看这个具体的更新过程是如何实现的。

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

( 这里我们就将一些不太重要的代码忽略掉不讲了， 比如callHook调用钩子函数之类的， 我们只关注实现DOM更新相关代码。)

这里面最重要的代码就是通过 `vm.__patch__`
进行DOM更新。 如果之前没有渲染过， 就直接调用 `vm.__patch__`
生成真正的DOM并将生成的DOM挂载到vm.$el上， 否则会调用 `vm.__patch__(prevVnode, vnode)`
将当前vnode与之前的vnode进行diff比较， 最小化更新。

接下来我们就看一下这个最重要的 `vm.__patch__`
到底做了些什么。

```javascript
//摘自platforms\web\runtime\patch.js
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

可以看到__patch__方法主要就是调用了createPatchFunction这个函数。 一步步看看它主要干了些什么。

顾名思义， 这个函数的作用是创建并返回一个patch函数。

```javascript
//摘自core\vdom\patch.js

//......

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

      //......

      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)
      createElm(
        vnode,
        insertedVnodeQueue,
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )

      //......

    }
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```

在这个返回的patch函数里， 会进行许多的判断：

1. 判断vnode和oldVnode是否isDef（ 即非undefined且非null， 下面简称已定义）， 若vnode已定义且oldVnode未定义， 没有新的vnode就意味着要将组件销毁掉， 就会循环调用invokeDestroyHook函数将oldVnode销毁掉。
1. 如果oldVnode未定义， 意味着这是第一次patch， 就会调用 `createElm(vnode, insertedVnodeQueue, parentElm, refElm)`创建一个新的DOM。
1. 如果oldVnode跟vnode是同一个vnode， 且oldVnode.nodeType未定义， 就调用 `patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)`来更新oldVnode并生成新的DOM。( 这里判断nodeType是否定义是因为vnode是没有nodeType的， 当进行服务端渲染时会有nodeType， 这样可以排除掉服务端渲染的情况。 )
1. 如果oldVnode跟vnode不同， 会调用createElm函数来创建新的DOM来替换掉原来的DOM。

我们分别看一下上面的两种情况：

```javascript
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
```

如果没有prevVnode（也就是第一次渲染）， 这时vm.$el如果为undefined则满足 `isUndef(oldVnode)`，
会调用createElm函数； 如果vm.$el存在， 但其不满足 `sameVnode(oldVnode, vnode)`，
同样会调用createElm函数。 也就是说如果是首次渲染，就会调用createElm函数创建新的DOM。

如果有prevVnode（也就是进行视图的更新）， 这时如果满足 `sameVnode(oldVnode, vnode)`（
即vnode相同）， 则会调用patchVnode对vnode进行更新； 如果vnode不相同， 则会调用createElm函数创建新的DOM节点替换掉原来的DOM节点。

那么接下来分别看看这两个函数。

```javascript
//摘自\core\vdom\patch.js
function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
  vnode.isRootInsert = !nested // for transition enter check

  //......

  vnode.elm = vnode.ns
    ? nodeOps.createElementNS(vnode.ns, tag)
    : nodeOps.createElement(tag, vnode)

  //......

  createChildren(vnode, children, insertedVnodeQueue)

  insert(parentElm, vnode.elm, refElm)

  //......

}
```

可以看到， createElm中主要会根据vnode.ns（ vnode的命名空间）是否存在调用createElementNS函数或createElmement函数生成真正的DOM节点并赋给vnode.elm保存。然后通过createChildren函数创建vnode的子节点，并且通过insert函数将vnode.elm插入到父节点中。

```javascript
//摘自\core\vdom\patch.js
function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true)
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
  }
}
```

createChildren函数会判断vnode的children是否是数组，如果是，则表明vnode有子节点，循环调用createElm函数为子节点创建DOM；如果是text节点，则会调用createTextNode为其创建文本节点。

```javascript
//摘自\core\vdom\patch.js
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {

  //......

  const oldCh = oldVnode.children
  const ch = vnode.children
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text)
  }
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
  }
}
```

patchVnode主要是对oldVnode和vnode进行一定的对比：

1. 首先判断vnode.text未定义，意味着vnode可能有children（具有text的vnode不会有children）。
    1. 如果vnode和oldVnode都有children，则用updateChildren对两者的children进行对比。
    1. 如果vnode有children而oldVnode没有，则通过addVnodes函数给elm加上子节点。
    1. 如果oldVnode有children而vnode没有，则通过removeVnodes函数将elm的子节点删除。
    1. 同时如果oldVnode.text已定义，则通过setTextContent将elm的text设为空（因为vnode.text未定义）。
1. 如果vnode.text已定义并且不等于oldVnode.text的话，则将elm的text设为vnode.text。

我们先来看下比较简单的vnode和oldVnode只有其中一个有children时调用的addVnodes和removeVnodes函数。

```javascript
//摘自\core\vdom\patch.js
function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
  for (; startIdx <= endIdx; ++startIdx) {
    createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm)
  }
}
```

addVnodes函数通过循环调用createElm分别对vnode的children中的每个子vnode创建子节点并挂载到DOM上。

```javascript
function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (isDef(ch)) {
      if (isDef(ch.tag)) {
        removeAndInvokeRemoveHook(ch)
        invokeDestroyHook(ch)
      } else { // Text node
        removeNode(ch.elm)
      }
    }
  }
}
```

removeVnodes函数通过调用removeNode函数（removeAndInvokeRemoveHook函数最终也是调用removeNode函数）将oldVnode的children节点全部移除。

接下来就看一下当vnode和oldVnode都有children时调用的updateChildren函数。

```javascript
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {

  //......

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
      if (isUndef(idxInOld)) { // New element
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
        newStartVnode = newCh[++newStartIdx]
      } else {
        elmToMove = oldCh[idxInOld]
        if (sameVnode(elmToMove, newStartVnode)) {
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          canMove && nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          // same key but different element. treat as new element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }
  }
  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}
```

