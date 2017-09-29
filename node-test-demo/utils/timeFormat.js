/**
 * Created by luojian on 2017/3/10.
 */
var timeForme = function (inTime) {
  if (!inTime) return '';

  var date=new Date(inTime)
  var now = new Date();

  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var date = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();


  if (date - now < 3600000) {
    return Math.round((date - now ) / 60000) + '分钟前';
  }

  if (date - now < 3600000*24) {
    return Math.round((date - now ) / 3600000) + '小时前';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return month + '月' + date + '日';
  }

  else {
    return date.getFullYear() + '年' + month + '月' + date + '日';
  }

};

module.exports = timeForme;
