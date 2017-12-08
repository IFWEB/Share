## CommonsChunkPlugin是什么

CommonsChunkPlugin是一个用于将多个入口chunk中的公共模块提取出来形成一个独立chunk（以下称common chunk）的插件。这样就能通过在一开始加载一次这个公共chunk，以缓存起来供后续使用，使每次加载的入口chunk变小。

## CommonsChunkPlugin的选项

1. name/names：这个是common chunk的名称，如果是一个已经存在的入口chunk的名称，则可以将该chunk作为一个common chunk去包含其他公共模块。如果是names选项则相当于对每个name调用一次CommonChunkPlugin。
1. filename：这个是common chunk的文件名。
1. minChunks：公共模块要打包到common chunk中需要至少多少个入口chunk共同进行了引用。比如说我们现在有三个入口chunk：index、iconfont、login，三个入口chunk都引用了vue.js，index和login引用了vue-router.js。如果minChunks设为3的话，就只有vue.js会被打包到common chunk中，如果minChunks设为2的话，则vue.js和vue-router.js都会被打包到common chunk中。同时如果minChunks设为'Infinity'，则没有公共模块会被打包到common chunk中。
1. chunks：需要提取公共模块的入口chunk，如果忽略该选项，则所有入口chunk都会被选择。
1. children：如果设为true，则所有被选择的入口chunk的子chunk也会被选择。子chunk中的公共模块会被打包到父chunk中，这样可以减少子chunk中的重复代码。
1. async：如果设为true，子chunk中的公共模块不会被打包到父chunk中，而是会被打包到一个异步的common chunk中，和入口chunk并行加载。
1. minSize：common chunk要到达minSize的大小才会被创建，小于minSize则无法创建。

## CommonsChunkPlugin的配置

在我们还没有使用CommonsChunkPlugin时，入口chunk是这样的：

![image](https://github.com/IFWEB/Share/blob/master/webpack/CommonsChunkPlugin/assets/pic1.jpg)