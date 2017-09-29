var check = function(obj) {

    if (typeof obj === 'undefined' || obj === null || obj === '' || obj === 0 || obj === false) {
        return false;
    } else if (obj instanceof Array && obj.length === 0) {
        return false;
    } else if (obj instanceof Object && Object.keys(obj).length === 0) {
        return false;
    }
    return true
}

var empty = {
    check: check
}

module.exports = empty;