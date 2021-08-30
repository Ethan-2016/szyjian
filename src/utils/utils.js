let utils = {};

utils.padString = function(num, n) {
    var len = num.toString().length;
    while(len < n) {
      num = "0" + num;
      len++;
    }
    return num;
}

export default utils;