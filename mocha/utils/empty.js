exports.check = function (obj) {

  if (typeof obj === 'undefined' || obj === null || obj === [] || obj=== {} || obj==='' || obj===0 || obj===false) {
    return false
  }

  return true
}

