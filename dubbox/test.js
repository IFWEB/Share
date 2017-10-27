const nzd = require('./node-zookeeper-dubbox/index.js');
//转换类型使用的例子：https://github.com/node-modules/js-to-java
const java = require('js-to-java');
const app = require('express')();
const opt = {
  application: {
    name: 'nongfadai-dubbo-provider'
  },
  register: '10.1.60.23:2181',
  dubboVer: '2.8.4',
  root: 'dubbo',
  dependencies: {
    IBankService: {
      interface: 'com.njq.nongfadai.service.IBankService',
      version: '1.0.0',
      timeout: 30000
    },
    IAssetAccountService: {
      interface: 'com.njq.nongfadai.service.IAssetAccountService',
      version: '1.0.0',
      timeout: 30000
    },
    IBigDataService: {
      interface: 'com.njq.nongfadai.service.IBigDataService',
      version: '1.0.0',
      timeout: 30000
    },
    IMediaNoticeService: {
      interface: 'com.njq.nongfadai.service.IMediaNoticeService',
      version: '1.0.0',
      timeout: 30000
    }
  }
};

opt.java = require('js-to-java');

const Dubbo = new nzd(opt);

//无参数的例子
app.get('/IBankService/getAvailableQuickPayBankMap', (req, res) => {
  Dubbo.IBankService.getAvailableQuickPayBankMap()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.send(err);
    });
});

//参数为init的例子
app.get('/IAssetAccountService/getZhye', (req, res) => {
  var arg= java.int(2);
  Dubbo.IAssetAccountService.getZhye(arg)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.send(err);
    });
});

//参数有字符串的
app.get('/IBigDataService/getUserInvestRank', (req, res) => {
  var arg1= java.Integer(2),
    arg2 = java.String('1');
  Dubbo.IBigDataService.getUserInvestRank(arg1, arg2)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.send(err);
    });
});

//参数是对象的
app.get('/IMediaNoticeService/getIndexMediaReport', (req, res) => {
  var arg= java('com.njq.nongfadai.page.Pagination', { 
      pageNo : 1,//java.int(1),  
      pageSize : 10//java.int(10)
    });

  var m = java.revert(arg);
  Dubbo.IMediaNoticeService.getIndexMediaReport(arg)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.send(err);
    });
});

app.listen(9090);