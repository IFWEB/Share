## Webpack常用插件

### html-webpack-plugin

在生产环境中，我们通常会给文件名加一个hash值，但是这样我们的html中就没法引入打包之后的bundle，因为bundle的文件名每次编译之后都可能会变化。为了解决这个问题，我们可以使用html-webpack-plugin来根据我们的html模板（或pug、ejs等模板）生成引入了打包后的bundle的html文件。

```javascript
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpackConfig = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.[hash].js'
  },
  plugins: [new HtmlWebpackPlugin()]
};
```

像这样不使用任何配置我们可以使用html-webpack-plugin在output.path中生成一个index.html，它里面引用了打包后带hash值的bundle.js。如果有多个entry，则对于每一个生成的bundle都会进行引入。如果我们使用了ExtractTextPluginj将css分离出来的话，html-webpack-plugin也会将分离出来的css通过link标签引入。

我们也可以向html-webpack-plugin传一个配置对象进行配置。下面说一些比较常用的配置项：

1. filename：生成的html文件名，也可以在这里配置子文件夹（如：page/index.html）。需要注意的是，filename的路径是相对于output.path的，`this.options.filename = path.relative(compiler.options.output.path, filename)`。
1. template：用于生成html的模板路径，通过对template的配置可以选择使用什么loader来处理我们的html模板（详见：[docs](https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md)）。需要注意的是，template的路径是相对于context配置项的，`this.options.template = this.getFullTemplatePath(this.options.template, compiler.context)`。这个context就是webpack的一个参考目录，entry配置项也是相对于这个目录的。context的默认值为process.cwd()，也就是当前执行node命令时的目录。
1. inject：当值为true或'body'时，js文件会在body底部引入，如果为false或'head'，js文件会在head中引入。
1. cache：如果为true，则只有当模板文件发生改变时才会重新生成html。
1. chunks：一个数组，包含我们想要添加到生成的html文件中的chunks的名称。

### copy-webpack-plugin
用于将文件或文件夹复制到目标文件夹中。

```javascript
new CopyWebpackPlugin([{
    from: './src/public',
    to: '.dist'
}]);
```

像这样用最简单的配置就能将./src/public文件夹复制到./dist文件夹下。我们也可以传多个pattern对象（形如：`{ from: 'source', to: 'dest' }`）进行不同的复制操作，from和to属性可以是绝对路径或相对路径。当然，还有其他的配置项让我们能够进行更复杂的操作，完整配置详见[copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin)。

### happypack
webpack的loader在处理文件时是通过单线程来进行处理的，happypack能够通过node多线程来提高我们的构建速度。正常来说，我们是通过配置loader来让webpack知道该用什么loader来处理文件，使用happypack的话我们会让webpack使用happypack/loader来处理文件，同时将原来的loader配置传给happypack。

```javascript
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: 2 });

exports.module = {
    rules: [
        {
            test: /\.js$/,
            loader: 'happypack/loader?id=js'
        },
        {
            test: /\.css$/,
            loader: 'happypack/loader?id=css'
        }
    ]
};

exports.plugins = [
    new HappyPack({
        id: 'js',
        loaders: ['babel-loader'],
        threadPool: happyThreadPool
    }),
    new HappyPack({
        id: 'css',
        loaders: ['style-loader', 'css-loader'],
        threadPool: happyThreadPool
    })
];
```

像上面这样，我们就可以通过happypack来并行处理文件了，通过id可以指定不同的happypack对文件进行处理。当我们使用多个happypack时，我们可以让所有的happypack使用一个共享的线程池以提高效率。实测之后发现对打包速度并没有太大的提升(￣.￣)，可能是电脑只有双核的缘故。

### webpack-parallel-uglify-plugin
webpack自带的uglifyJS插件是串行地处理输出文件的，而且uglify的速度是非常慢的，所有会占用比较多的时间。webpack-parallel-uglify-plugin可以让我们并行地去处理输出文件，对于每一个cpu会启用一个线程进行处理。可以说效果是非常明显的，在我的双核电脑上打包时间缩短了三分之一。

```javascript
//webpack-parallel-uglify-plugin配置
new ParallelUglifyPlugin({
    uglifyJS: {
        output: {
            comments: false
        },
        compress: {
            warnings: false
        }
    }
})
```

### DllPlugin/DllReferencePlugin
DllPlugin借鉴了windows中dll（动态链接库）的概念，它可以对一些第三方的模块进行打包形成dll，这样我们就不需要再重复地对这些模块进行打包而是直接引用打包后的dll包，因为这些第三方模块都是不会改变的，这样我们就可以省去之前打包这些第三方模块的时间。打包之后会生成一个js文件和一个manifest.json文件，它包含了模块到模块id的一个映射。我们需要将这个生成的manifest.json传给DllReferencePlugin，同时在页面引入生成的js文件，这样就能正确地使用dll了。

```javascript
//webpack.dll.conf.js
var path = require("path");
var webpack = require("webpack");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    resolve: {
        extensions: [".js"],
        alias:{
            'vue':'vue/dist/vue.esm.js'
        }
    },
    context: path.resolve(__dirname, "../src"),
    entry: {
        vendor: ["./public/bad.js", "./public/jquery.min.js", "./public/bootstrap/js/bootstrap.min.js",'moment','element-ui','vue']
    },
    output: {
        path: path.join(__dirname, ""),
        filename: "[name].dll.js",
        library: "[name]_[hash]"
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "[name]-manifest.json"),
            name: "[name]_[hash]" //要跟output.library相同
        }),
        //去掉moment的本地化文件
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale/, /(zh-cn)\.js/),
        new BundleAnalyzerPlugin()
    ]
};
```

运行webpack --config webpack.dll.conf.js命令生成dll和manifest

```javascript
//webpack.dev.conf.js
new webpack.DllReferencePlugin({
    context: __dirname,
    manifest: require("./vendor-manifest.json")
}),
new AddAssetHtmlPlugin({
    filepath: path.resolve(__dirname, 'vendor.dll.js'),
    includeSourcemap: false
})
```

然后在webpack配置文件中添加DllReferencePlugin插件，将manifest传给DllReferencePlugin插件。最后通过add-asset-html-webpack-plugin将vendor.dll.js插入到html中。然而使用后打包速度并没有提高多少，而且会报`$ is not defined`错误。在开发环境我们有了HMR增量打包速度非常快，一秒之内就能完成，而生产环境的速度也没有特别慢，其实也不太需要使用这个插件。

### server与HotModuleReplacement
我们知道使用webpack-dev-server可以开启一个简单的web服务器，但是如果我们需要实现更多的需求，可以使用express配合webpack-dev-middleware来开启服务器。

```javascript
//使用webpack-dev-server开启服务器
const webpack=require('webpack');
const WebpackDevServer=require('webpack-dev-server');
const config=require('./webpack.dev.js');
const compiler=webpack(config);

var server=new WebpackDevServer(compiler,{
  hot:true,
  publicPath:'/static/'
});

server.listen(3000, "0.0.0.0");
```

```javascript
//使用express开启服务器
const webpack=require('webpack');
const express=require('express');
const WebpackDevMiddleware=require('webpack-dev-middleware');
const WebpackHotMiddleware=require('webpack-hot-middleware');
const app=express();
const config=require('./webpack.dev.js');
const compiler=webpack(config);

app.use(WebpackDevMiddleware(compiler,{
    publicPath:config.output.publicPath
}));

app.use(WebpackHotMiddleware(compiler))

app.listen(3000, function() {
  console.log("Example app listening on port 3000!\n");
});
```

如上，通过webpack-dev-server或者webpack-dev-middleware配合express开启服务器都比较简单。webpack-dev-server配置hot为true然后在webpack配置中加上HotModuleReplacementPlugin就能开启HotModuleReplacement（模块热重载）了。express开启热重载会稍微麻烦一些，首先我们要将webpack-dev-middleware中间件传给express，然后在webpack配置中给每个需要开启HMR的entry加上`webpack-hot-middleware/client?path=/__webpack_hmr`，没有加上这个client的entry是不会有热重载的。这个client会连接到server，当重新打包时，它会告诉server去进行更新。