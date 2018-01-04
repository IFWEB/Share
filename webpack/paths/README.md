## webpack中的各种路径总结

### context

官方文档对于context的解释说context是一个绝对路径的基础目录，用于解析entry和部分loader。

如果不配置context，webpack会将context默认为`process.cwd()`，`process.cwd()`就是我们当前脚本的运行目录。以newconsole项目为例，当我们在console目录下跑`node master -p 8000`，`process.cwd()`就是console目录的绝对路径，如果在console目录的上一级目录下跑`node ./console/master -p 8000`，那么`process.cwd()`就是console上一级目录的绝对路径。

这个context的作用到底是什么呢？因为entry是基于context路径进行查找的，当我们设置了一个context值时，就能够确定entry的基础目录，这样使得整个项目独立于cwd，不论我们在哪个目录跑脚本，都能够正确地查找到entry。

### output.path

ouput.path应该配置为一个绝对路径，打包文件会被输出到这个目录。output.path中可以使用`[hash]`模板，它会被代替为编译过程的hash值，当被打包的文件发生了改变时，就会重新打包到一个新的文件夹中。

### output.publicPath

publicPath会影响资源文件的路径，可以简单理解为`打包后的资源文件访问路径 = output.publicPath + loader或插件配置的路径`。需要注意的是publicpath要以'/'字符结尾，同时其他loader的路径配置不要以'/'字符开头。

比如说我们output.publicPath为'/'，处理图片的file-loader的outputPath为'img/'，这时打包完之后，html中对js的引用路径为`src="/app.bundle.js"`，而对于图片资源的引用路径为`background: url(/img/pic.png);`。

而如果output.publicPath为'/static/'，则打包完之后html中对js的引用路径为`src="/static/app.bundle.js"`，而对于图片资源的引用路径为`background: url(/static/img/pic.png);`。

这种以'/'字符开头的publicPath叫做相对于服务器（server-relative）的publicPath，用于开发环境，注意我们开启服务器时的publicPath要跟output.publicPath一致，否则会造成无法找到资源问题。

在生产环境中我们通常会用绝对URL（absolute URL）或相对于协议的URL（protocol-relative URL），如`//static.lcfarm.com/console-dist/`。这样的话所有的资源文件的引用路径都会加上static.lcfarm.com/console-dist/，从而所有资源文件都会从静态资源服务器static.lcfarm.com下访问。

设置output.publicPath会影响到所有的资源文件，包括js，css，图片等。如果我们只想将图片托管到cdn，那么我们在file-loader中设置publicPath就可以了。

### webpack-dev-server

#### contentBase

告诉服务器从哪里提供未经webpack处理的静态资源。

#### publicPath

这个publicPath就是打包后的资源文件在服务器中对外的根目录，比如说我们设置webpack-dev-server的publicPath为'public'，我们的资源文件就会被serve到`http://localhost:3000/public/`路径下。

![image](https://github.com/IFWEB/Share/blob/master/webpack/paths/assets/pic1.png)

上面说到开启服务器时的publicPath要跟output.publicPath一致，否则会造成无法找到资源文件的问题。

```javascript
//webpack.dev.conf.js
output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/static/"
},
//server.js
var server=new WebpackDevServer(compiler,{
  hot:true,
  publicPath:'/public/' 
});
```

对于上面的配置，打包后图片的引用路径为`/static/img/pic.png`，而在服务器上的图片路径为`/public/img/pic.png`，这样就没法正确找到资源文件，导致出错。所以在开发环境中，webpack-dev-server的publicPath应该与output.path保持一致。如果不设置的话，webpack-dev-server的publicPath默认会取outpu.publicPath为值。

### html-webpack-plugin

#### template

html-webpack-plugin获取html模板的路径，相对于output.context进行搜索（`this.options.template = this.getFullTemplatePath(this.options.template, compiler.context);`）。

#### filename

生成的html文件名，相对于output.path（`this.options.filename = path.relative(compiler.options.output.path, filename);`）。我们还可以通过filename设置子文件夹，如：filename:"assets/index.html"。