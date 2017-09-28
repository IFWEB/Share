
exports.error = function (errType,errors) {
  return {
    code: errType.code,
    status: 'error',
    desc: errType.desc,
    errors:errors|| {}
  };
};

exports.success = function (obj) {
  return {
    code: 0,
    status: 'success',
    desc: 'request success',
    data: obj || {}
  };
};