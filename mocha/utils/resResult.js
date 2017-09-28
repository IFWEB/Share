var error = function (errType, error) {
  return {
    code: errType.code,
    message: errType.message,
    errors: error || {}
  };
};

var success = function (obj) {
  return {
    code: 0,
    message: 'request success',
    data: obj || {}
  };
};


module.exports = {
  error: error,
  success: success
}