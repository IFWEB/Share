### Swagger使用手册
Swagger主要分为三部分：
- Swagger-Edit  
  在线编辑OAS(OpenAPI Specification)
- Swagger-Codegen 
  编辑好OAS后，生成各种语言的服务器端代码
- Swagger UI 
  导入OPA文件即可进行API请求交互

在这里只使用到了Swagger UI,以及swagger-jsdoc库（将文件中的注释转为OAS文件）

安装及使用：
1. 全局安装swagger-jsdoc
```
$ npm install swagger-jsdoc -g
```
2. 下载Swagger UI 地址：https://github.com/swagger-api/swagger-ui，件里面的dist文件取出，作为静态文件使用，用node建立服务：
 ![image](./images/1.png)
 ![image](./images/2.png)

3. 定义swaggerDef.js文件
 ![image](./images/3.png)
4. 将文件中的注释转为OAS文件,注释需遵循[OpenAPI Specification 3.0](https://github.com/OAI/OpenAPI-Specification)规范，并加一个@swagger头

注释例子：
 ![image](./images/4.png)

运行命令生成OAS问价，文件名api-docs.json
```
swagger-jsdoc -d ./api-docs/swaggerDef.js  routes/*.js -o ./api-docs/api-docs.json -w
```

生成的文件如下：
![image](./images/5.png)

5. api-docs.json作为静态文件返回：
![image](./images/6.png)

7. 更改Swagger UI 中的index.html文件
![image](./images/7.png)

8. 开启node.js服务
```
$ node app.js
```
访问http://localhost:4000/swagger/index.html即可