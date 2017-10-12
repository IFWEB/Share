/**
 * @author 陈桦
 * @date 2017-6-13
 * @description 数据库链接公用插件，封装几个常用的数据库操作，其他操作参考mongoose，
    查询详细接口查看：http://www.nodeclass.com/api/mongoose.html#query-js。
    封装的操作都是在Model上(model是建立在schema上的，mongoose.createConnection(...).model(tableName,schema))
    提供以下功能：
 	--重写mongoose数据库增删改查操作接口，提供统一的log记录入口和统一的异常报错处理
	--分页查询
    --最大最小值查询
    --mongoDB数据库连接池
    --注意，现不支持promise写法,这时需要使用mongoose提供的本来的方法，分别是remove_back，update_back，find_back。以查询为例，调用Db.model.find_back。
	
    附：mongoose 常用功能
    统计:Model.count(opt, fn)

 * @example
 	//用法和mongoose普通用法相同，只不过重写的方法支持更多属性
    var db = require("./database/utils"),
        Model = db.userInfo;
    Model.find({username: 'chua', fields: 'password'}, function(err, person){
        if (err) {
            return console.log(err);
        }
        console.log(person);
    })
	@example end

 * @commit opt对象和mongoose数据库操作的对象相同,自定以的参数下面会描述
 * @method insert(opt [,callback]) 数据库插入
 * @method remove(opt [,callback]) 数据库删除
        @param [opt.onlyOne] {Boolean} 是否只删除查找结果的第一个。true-只删除一个；false-全部删除 default:false
 * @method update(opt, change,  [,callback]) 数据库修改
        @param [opt.onlyOne] {Boolean} 是否只修改匹配到的第一个数据。true-只修改第一个；false-全部修改 default:false
 * @method find(opt [,callback]) 数据库查询
        @param [opt.fields] {String} 指定返回那些内容，使用空格分开 default:'',表示返回文档所有属性。
            eg:查询用户表格，只需要返回用户名和密码，fields: 'username password'
        @param [opt.onlyOne] {Boolean} 是否只查找第一个。true-返回第一个数据,是一个单一对象；false-返回所有查询结果，是一个数组 default:false
        @param [opt.max] {String} 查询该字段最大的一个,如果有值，则返回一个单一对象 default:''
        @param [opt.maxAll] {String} 查询该字段最大的项的集合,返回一个数组 default:''
        @param [opt.min] {String} 查询该字段最小的一个,如果有值，则返回一个单一对象 default:''
        @param [opt.minAll] {String} 查询该字段最小的项的集合,返回一个数组 default:''
        @param [opt.pageCur] {Number} 查询第pageCur页,从第1开始计数 default:1
        @param [opt.pageSize] {Number} 每页展示pageSize条 default:Number.POSITIVE_INFINITY
        @param [opt.sort] {Object} 排序规则对象，同mongoose
 * 
 */
var DB = require('./init.js');
//增删改查insert、remove、update、find
//注：被[]包含起来的项表示可选项，default表示默认值
var db = DB;
//重写find方法,使用自己的find方法
for (var i in DB) {
    db[i].insert = insert;
    //删除
    db[i].remove_back = db[i].remove;
    db[i].remove = remove;

    //修改
    db[i].update_back = db[i].update;
    db[i].update = update;

    db[i].find_back = db[i].find;
    db[i].find = find;
}

function insert(opt, callback) {
    //this就是调用的model
    var entity = new this(opt),
        self = this;
    entity.save(function(err) {
        if (err) {
            console.log('添加一条' + self.modelName + '数据失败,错误信息:' + err);
            return;
        }
        callback && callback(err, {});
    });
    return this;
}
/*
@description 删除是一个很谨慎的操作，不提供删除最大和最小这种匹配，通过完全匹配来处理
@param [opt.onlyOne] {Boolean} 是否只删除查找结果的第一个。true-只删除一个；false-全部删除 default:false
*/
function remove(opt, callback) {
    var self = this,
        results,
        onlyOne = opt.onlyOne,
        method = opt.onlyOne ? 'findOneAndRemove' : 'remove_back';
    delete opt.onlyOne;
    results = self[method](opt, function(err) {
        if (err) {
            console.log('删除' + self.modelName + '数据失败,错误信息:' + err);
        }
        callback && callback(err);
    });
    return this;
}
/*
@param [opt.onlyOne] {Boolean} 是否只修改匹配到的第一个数据。true-只修改第一个；false-全部修改 default:false
*/
function update(opt, change, callback) {
    var self = this,
        results,
        onlyOne = opt.onlyOne,
        method = opt.onlyOne ? 'findOneAndUpdate' : 'updateMany';
    delete opt.onlyOne;
    results = self[method](opt, change, function(err) {
        if (err) {
            console.log('更改' + self.modelName + '数据失败,错误信息:' + err);
        }
        callback && callback(err);
    });
    return this;
}
/*
 @param [opt.fields] {String} 指定返回那些内容，使用空格分开 default:'',表示返回文档所有属性。
    eg:查询用户表格，只需要返回用户名和密码，fields: 'username password'
 @param [opt.onlyOne] {Boolean} 是否只查找第一个。true-返回第一个数据,是一个单一对象；false-返回所有查询结果，是一个数组 default:false
 @param [opt.max] {String} 查询该字段最大的一个,如果有值，则返回一个单一对象 default:''
 @param [opt.maxAll] {String} 查询该字段最大的项的集合,返回一个数组 default:''
 @param [opt.min] {String} 查询该字段最小的一个,如果有值，则返回一个单一对象 default:''
 @param [opt.minAll] {String} 查询该字段最小的项的集合,返回一个数组 default:''
 @param [opt.pageCur] {Number} 查询第pageCur页,从第1开始计数 default:1
 @param [opt.pageSize] {Number} 每页展示pageSize条 default:Number.POSITIVE_INFINITY
 @param [opt.sort] {Object} 排序规则对象，同mongoose
*/
function find(opt, callback) {
    var self = this,
        results,
        sort = opt.sort,
        //查询方法
        onlyOne = opt.onlyOne,
        method = opt.onlyOne ? 'findOne' : 'find_back',
        fields = opt.fields ? opt.fields : '',
        max = opt.max,
        maxAll = opt.maxAll,
        min = opt.min,
        minAll = opt.minAll,
        pageCur = Number(opt.pageCur),
        pageSize = Number(opt.pageSize);
    delete opt.sort;
    delete opt.onlyOne;
    delete opt.fields;
    delete opt.max;
    delete opt.min;
    delete opt.maxAll;
    delete opt.minAll;
    delete opt.pageCur;
    delete opt.pageSize;
    //二次查询
    function secondSearch(data) {
        if (maxAll) {
            opt[maxAll] = data[maxAll];
        } else if (minAll) {
            opt[minAll] = data[minAll];
        }
        results = self[method](opt, fields, function(err, data) {
            if (err) {
                console.log('二次查询' + self.modelName + '数据失败,错误信息:' + err);
            }
            callback && callback(err, data);
        });
    }
    //this就是调用的model
    //查询最大最小集合需要查询两次，第一次查询不要限制fileds
    results = self[method](opt, (maxAll || minAll) ? '' : fields, function(err, data) {
        if (err) {
            console.log('查询' + self.modelName + '数据失败,错误信息:' + err);
        }
        //如果只取最大最小值，则返回一个单一对象
        if ((max || min || maxAll || minAll) && !onlyOne) {
            data = data[0];
        }
        //查询最大最小集合，需要二次查找
        if (maxAll || minAll) {
            secondSearch(data);
        } else {
            callback && callback(err, data);
        }
    });
    //查询最大的一个
    if (max || maxAll) {
        sort = {};
        sort[max || maxAll] = -1;
        results.sort(sort).limit(1);
        //查询最小的一个
    } else if (min || minAll) {
        sort = {};
        sort[min || minAll] = 1;
        results.sort(sort).limit(1);
    } else {
        var m;
        if (sort) {
            m = results.sort(sort);
        } else {
            m = results;
        }
        //分页查询
        if (pageCur && pageSize) {
            m.skip((pageCur - 1) * pageSize).limit(pageSize);
        }
    }

    return this;
}
module.exports = db;