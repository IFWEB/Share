var fs = require('fs'),
    path = require('path');

function log(data) {
    if (!global.wsLog) {
        console.log(data);
        return;
    }

    global.wsLog.send(data);
};

/*
@description 将查询数据进行分页包裹
@param param {Object} 分页请求参数,
@param DBmodel {model} eg:DBmodel.find()
@param callback {function} 分页查询数据返回后调用
callback的传参格式是
{
    pageNum: 1,//当前是第几页
    pageSize: 10,//当前页真实有10条数据，注意pageSize的值可能小于请求参数中的10条
    pages: 0,//总共268页
    totalRecords: 0,//总共有3206条数据
    data:[]//这里保存查询结果
}
*/
function paging(param, DBmodel, callback) {
    //后面会删除param中的两个属性，避免外部param更改需要拷贝一份
    var newParam = Object.assign({}, param),
        currentPage = newParam.currentPage,
        pageSize = newParam.pageSize,
        pObj = {
            pageNum: Number(currentPage), //当前是第几页
            pageSize: Number(pageSize), //当前页真实有10条数据，注意pageSize的值可能小于请求参数中的10条
            pages: 0, //总共268页
            totalRecords: 0, //总共有3206条数据
            data: [] //这里保存查询结果
        };
    delete newParam.currentPage;
    delete newParam.pageSize;

    //查询总数量
    DBmodel.find_back().count()
        .then(function(count) {
            pObj.totalRecords = count;
            pObj.pages = Math.ceil(count / pageSize);
            if (count > 0) {
                var query = Object.assign(newParam, {
                    pageCur: currentPage,
                    pageSize: pageSize,
                    sort: newParam.sort
                });
                // 查询首页表格
                DBmodel.find(query, function(err, data) {
                    if (err) {
                        console.log(err);
                    }
                    pObj.data = data || [];
                    pObj.pageSize = pObj.data.length;
                    callback(pObj);
                });
            } else {
                callback(pObj);
            }
        });
}

/*
根据user, id, number组装logname,在websocket时使用
*/
function makeLogname(user, id, number){
    return [user, id, number].join('_');
}
/*
返回数据的真实类型,包括"boolean","number","string","function","array","date","error","symbol","regexp","undefined","null"
*/
function type(param){
    let str = Object.prototype.toString.call(param),
        reg = /\[object (\w+)\]/;
    return reg.exec(str)[1].toLowerCase();
}
module.exports = {
    log: log,
    paging: paging,
    makeLogname: makeLogname,
    //返回数据的真实类型
    type: type
};