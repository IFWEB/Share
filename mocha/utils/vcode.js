/**
 * 随机验证码
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
var vcode = function (codeLength) {
  var code = "", 
      codeLength = codeLength || 4;
  var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
  for (var i = 0; i < codeLength; i++) {
    var index = Math.floor(Math.random() * 10);
    code += random[index];
  }
  return code;
}

module.exports=vcode;