# Vue组件渲染机制

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

这里面最重要的代码就是通过 `vm.__patch__`进行DOM更新。 如果之前没有渲染过， 就直接调用 `vm.__patch__`生成真正的DOM并将生成的DOM挂载到vm.$el上， 否则会调用 `vm.__patch__(prevVnode, vnode)`
将当前vnode与之前的vnode进行diff比较， 最小化更新。

接下来我们就看一下这个最重要的 `vm.__patch__`到底做了些什么。

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

1. 判断vnode和oldVnode是否isDef（ 即非undefined且非null， 下面简称已定义）， 若vnode未定义且oldVnode已定义， 没有新的vnode就意味着要将组件销毁掉， 就会循环调用invokeDestroyHook函数将oldVnode销毁掉。
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

如果没有prevVnode（也就是第一次渲染）， 这时vm.$el如果为undefined则满足 `isUndef(oldVnode)`，会调用createElm函数； 如果vm.$el存在， 但其不满足 `sameVnode(oldVnode, vnode)`，同样会调用createElm函数。 也就是说如果是首次渲染，就会调用createElm函数创建新的DOM。

如果有prevVnode（也就是进行视图的更新）， 这时如果满足 `sameVnode(oldVnode, vnode)`（即vnode相同）， 则会调用patchVnode对vnode进行更新； 如果vnode不相同， 则会调用createElm函数创建新的DOM节点替换掉原来的DOM节点。

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

我们先来看下比较简单的当vnode和oldVnode只有其中一个有children时调用的addVnodes和removeVnodes函数。

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

在这里我们主要需要关注三个数组：oldCh、newCh和parentElm.children。oldCh就是oldVnode.children，newCh就是vnode.children，parentElm就是oldVnode.elm。

而oldStartIdx、oldEndIdx、newStartIdx和newEndIdx这四个是用于标志当前关注的vnode的头指针和尾指针。

简单来说，我们会将oldCh和newCh进行比较，将oldCh跟newCh差异的部分patch到parentElm中，最终得到一个根据newCh所对应的elm.children。接下来我们一步步分析这个函数到底是如何进行diff的。

1. 首先我们会进行一个循环，当满足 `oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx` 时继续进行循环。
1. 在循环中，先判断oldStartVnode跟oldEndVnode是否存在，不存在则指针跳到下一个。在后面会讲到为什么需要这一步。
1. 接下来会进行四个判断。
    1. 如果满足`sameVnode(oldStartVnode, newStartVnode)`，则递归调用patchVnode对两者进行比较，同时头指针往右走。因为我们最终想要得到的是newCh所对应的elm，而这个elm是oldVnode.elm，它的children一开始是根据oldCh生成的。那么当oldStartVnode跟newStartVnode相同时，意味着elm.children中这个位置的子节点已经是跟newCh所对应的。
    1. 如果满足`sameVnode(oldEndVnode, newEndVnode)`，同理，递归调用patchVnode对两者进行比较，同时尾指针往左走。
    1. 如果满足`sameVnode(oldStartVnode, newEndVnode)`，意味着newEndVnode跟oldStartVnode相同，这个时候递归调用patchVnode对两者进行比较后我们需要通过`nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))`，将oldStartVnode.elm移动到parentElm.children中newEndVnode所对应的位置，也就是oldEndVnode.elm后面。
    1. 如果满足`sameVnode(oldEndVnode, newStartVnode)`，同理，通过递归调用patchVnode对两者进行比较后通过`nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)`将oldEndVnode.elm移动到parentElm.children中newStartVnode所对应的位置，也就是oldStartVnode.elm前面。
1. 如果以上判断都不满足，我们就直接通过key去寻找oldCh中与newStartVnode相对应的vnode。
    1. 如果没找到对应的vnode，意味着这是一个新的节点，我们通过`createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)`创建一个新的DOM节点并插入到oldStartVnode.elm前面。
    1. 如果找到了oldCh中对应的vnode，我们用elmToMove将这个vnode保存起来，通过递归调用patchVnode对这个vnode跟newStartVnode进行对比，然后将oldCh中对应的vnode设为undefined，同时通过`nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm)`将elmToMove.elm移动到oldStartVnode.elm前面。可以看到，我们将这个节点设为了undefined，这样当指针移动到这里的时候发现是undefined就会继续移动，因为这个节点已经被复用了，这个就是上面第2步判断的作用。
1. 当不再满足`oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx`时，循环结束。这时候我们就要判断到底是`oldStartIdx > oldEndIdx`还是`newStartIdx > newEndIdx`。
    1. 如果`oldStartIdx > oldEndIdx`，因为只有当oldCh中的节点被复用时，oldCh的指针才会移动，当oldCh的头指针大于尾指针时，意味着oldCh已经没有节点可以被复用了，这样我们就需要直接将newCh中还未添加到parentElm.children的节点通过`addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)`添加到parentElm.children中。
    1. 如果`newStartIdx > newEndIdx`，意味着newCh中的所有节点都已经在parentElm.children中了，也就意味着OldCh中如果oldStartIdx到oldEndIdx之间（包括oldStartIdx和oldEndIdx）指针所指向的节点在newCh中没有对应的节点，也就是说剩下的都是多余的节点，所以我们需要通过`removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)`将多余的节点都移除。

经过这样的一个过程之后，parentElm.children就变成了与newCh相对应了。

总的来说，updateChildren的作用是根据newCh生成相应的parentElm.children，同时尽量复用其中的节点。所以对于每一个newCh的节点，会先在oldCh中找相应的节点，找到了就将其移动到parentElm.children中与newCh对应的位置，没找到就创建一个新的节点插入到对应的位置。最后将parentElm.children中多余的节点移除或者将newCh中还未添加到parentElm.children中的节点添加上去。

文字描述还是有点比较难理解，用图例来进一步解释。

首先，假设我们的oldCh有四个节点，用数字表示，分别为1、2、3、4，newCh五个节点，分别为5、2、6、3、1。由于parentElm.children是根据oldCh生成的，所以也有四个节点1、2、3、4。oldCh的头尾指针分别指向1和4，newCh的头尾指针分别指向5、1。

parentElm.children | 1 | 2 | 3 | 4 | -
--|--|--|--|--|--
oldCh指针           | ↓ |   |   | ↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           | ↑ |   |   |   | ↑

根据上面我们说到的updateChildren的判断过程，判断到oldCh的头节点和newCh的尾节点相同，于是就将parentElm.children中的oldCh头节点移动到oldCh尾节点后面。然后oldCh跟newCh的指针分别移动，于是就变成了下面这样。

parentElm.children | 2 | 3 | 4 | 1 | -
--|--|--|--|--|--
oldCh指针           |   | ↓ |   | ↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           | ↑ |   |   | ↑ |

继续进行循环判断，发现头尾的节点都没有相同的，这个时候我们就要去oldCh中根据key找与newCh头节点相同的节点。但是没有找到，所以我们会创建一个新的节点插入到parentElm.children中头节点前面，然后指针移动。结果如下。

parentElm.children | 5 | 2 | 3 | 4 | 1
--|--|--|--|--|--
oldCh指针           |   | ↓ |   | ↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           |   | ↑ |   | ↑ |

继续进行循环。发现头节点相同，无需移动，直接对头节点进行patch，指针移动。结果如下。

parentElm.children | 5 | 2 | 3 | 4 | 1
--|--|--|--|--|--
oldCh指针           |   |   | ↓ | ↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           |   |   | ↑ | ↑ |

继续进行循环。发现newCh尾节点和oldCh头节点相同，将parentElm.children中的3节点移动到parentElm.children的尾指针后面，指针移动。结果如下。

parentElm.children | 5 | 2 | 4 | 3 | 1
--|--|--|--|--|--
oldCh指针           |   |   |   | ↓↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           |   |   | ↑↑ |   |

现在两个头尾指针都相等了，但还是符合循环的条件，于是继续进行循环。由于两个节点不相同，于是会创建一个新的节点插入到parentElm.children的头指针前面，指针移动。结果如下。

parentElm.children | 5 | 2 | 6 | 4 | 3 | 1
--|--|--|--|--|--|--
oldCh指针           |   |   |   | ↓↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           |   |   | ↑ | ↑ |

这样之后`newStartIdx > newEndIdx`，循环结束。因为`newStartIdx > newEndIdx`,意味着parentElm.children中可能还有多余的节点，我们再调用`removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)`将多余的节点移除。结果如下。

parentElm.children | 5 | 2 | 6 | 3 | 1
--|--|--|--|--|--
oldCh指针           |   |   |   | ↓↓ |
oldCh               | 1 | 2 | 3 | 4 |
newCh               | 5 | 2 | 6 | 3 | 1
newCh指针           |   |   | ↑ | ↑ |

这样，我们就完成了整一个updateChildren的过程，parentElm.children已经变成了与newCh相对应了。整一个patch的递归完成后，vnode.elm就变成全新的elm了，视图也就更新完毕啦。