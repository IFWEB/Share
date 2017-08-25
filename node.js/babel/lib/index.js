"use strict";

var arr = [1, 2, 3, 4];

var arr1 = arr.map(function (item, indx, arr) {
  return item += 2;
}); // 箭头函数

var a = arr[0],
    b = arr[1],
    c = arr[2],
    d = arr[3]; // 解构赋值