## CommonsChunkPlugin

CommonsChunkPlugin是一个用于将多个入口chunk中的公共模块提取出来形成一个独立chunk（以下称common chunk）的插件。这样就能通过在一开始加载一次这个公共chunk，以缓存起来供后续使用，使每次加载的入口chunk变小。

## CommonsChunkPlugin的选项

1. `name/names`：这个是common chunk的名称，如果是一个已经存在的入口chunk的名称，则可以将该chunk作为一个common chunk去包含其他公共模块。如果是names选项则相当于对每个name调用一次CommonChunkPlugin。
1. `filename`：这个是common chunk的文件名。
1. `minChunks`：公共模块要打包到common chunk中需要至少多少个入口chunk共同进行了引用。比如说我们现在有三个入口chunk：index、iconfont、login，三个入口chunk都引用了vue.js，index和login引用了vue-router.js。如果minChunks设为3的话，就只有vue.js会被打包到common chunk中，如果minChunks设为2的话，则vue.js和vue-router.js都会被打包到common chunk中。同时如果minChunks设为'Infinity'，则没有公共模块会被打包到common chunk中。如果忽略的话则所有被选择的trunk都共同引用的模块才会被打包。
1. `chunks`：需要提取公共模块的入口chunk，如果忽略该选项，则所有入口chunk都会被选择。
1. `children`：如果设为true，则所有被选择的入口chunk的子chunk也会被选择。子chunk中的公共模块会被打包到父chunk中，这样可以减少子chunk中的重复代码。
1. `async`：如果设为true，子chunk中的公共模块不会被打包到父chunk中，而是会被打包到一个异步的common chunk中，和入口chunk并行加载。
1. `minSize`：common chunk要到达minSize的大小才会被创建，小于minSize则无法创建。

## CommonsChunkPlugin的配置

在我们还没有使用CommonsChunkPlugin时，入口chunk是这样的：

![image](https://github.com/IFWEB/Share/blob/master/webpack/CommonsChunkPlugin/assets/pic1.jpg)

可以看到，三个入口chunk都将vue、vuex、vue-router等公共模块打包到了各自的包，这样我们每次请求这些入口chunk，就相当于重复加载了这些公共模块,导致加载速度变慢。

## name选项的配置

### name选项不为入口trunk
我们试着将这些第三方模块（包括非公共模块）提取到一个common chunk中。将name选项设为common，这样公共模块就会被打包到一个新的名为common的trunk中。

```javascript
new webpack.optimize.CommonsChunkPlugin({
    name:'common'
})
```

![image](https://github.com/IFWEB/Share/blob/master/webpack/CommonsChunkPlugin/assets/pic4.jpg)

可以看到，三个入口chunk公用的一些模块都被打包到名为common的chunk中。

### name选项为入口trunk

首先我们添加一个入口chunk：

```javascript
entries['vendor'] = ['src/public/bad.js', 'src/public/jquery.min.js', 'src/public/bootstrap/js/bootstrap.min.js', 'moment','element-ui'];
```

这个入口chunk vendor中包含了一些第三方的模块。
然后调用CommonsChunkPlugin：

```javascript
new webpack.optimize.CommonsChunkPlugin({
    name:'vendor'
})
```

然后我们发现一个名为vendor的包，它里面包含了vendor入口的element-ui、moment等模块，还包含了vendor入口中没有的vue、vuex等公共模块。

![image](https://github.com/IFWEB/Share/blob/master/webpack/CommonsChunkPlugin/assets/pic2.jpg)

由于我们没有配置minChunks选项，也就意味着所有三个入口trunk都引用的公共模块才会被打包进vendor包中。

### minChunks的配置

我们再进行一下配置minChunks选项：

```javascript
new webpack.optimize.CommonsChunkPlugin({
    name:'vendor',
    minChunks:2//两个以上被选择的trunk共同引用的模块才会被打包到vendor包中
})
```

![image](https://github.com/IFWEB/Share/blob/master/webpack/CommonsChunkPlugin/assets/pic3.jpg)

这样之后可以发现index和login入口trunk所共用而iconfont没有的一些引用文件也被打包进了vendor包中。

如果我们将minChunks选项设为'Infinity'的话，公共模块就算被所有入口trunk都引用了，也不会被打包到vendor包中，vendor包中只会包含vendor入口chunk。
