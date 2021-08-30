
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
//
// 都昌表达式功能函数模块JS代码
// 编制 袁永福 2015-5-23
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
//
//已经完成：
//MyParseFloat将字符串转换为数值，ABS返回绝对值，ACOS返回指定弧度的反余弦值，ASIN返回指定弧度的反正弦值，ATAN返回指定弧度的反正切值,
//ATAN2返回指定弧度的正切值，AVERAGE返回算术平均值，CEILING获得最近的整数，COS返回指定弧度的COS值，COUNT返回参数的个数,
//EXP返回e的n次方，FLOOR返回向下舍入取整数，INT将数值向小取整为最接近的整数，LOG根据给定底数返回数字的对数,
//LOG10返回以10为底的对数，MAX返回最大值，MIN返回最小值，MOD返回两个数相除的余数，ODD将正（负）数向上（下）舍入到最接近的奇数,
//PI返回3.14159265358979，POW返回某数的乘幂，PRODUCT计算所有参数的乘积，RADIANS将角度转换为弧度,
//RAND返回一个介于0到1之间的随机数，ROUND进行四舍五入计算,ROUNDDOWN向下舍入数字, ROUNDUP向上舍入数字,
//SIGN为正数返回1，为零返回0，为负数返回-1 ,SIN返回指定角度的正弦值,SQRT返回数值的平方根, SUM计算所有数值的和,
//TAN返回指定角度的正切值, IF Boolean转换,FIND查找位置，LEN字符串长度，AGE年龄，AGEMONTH月龄，AGEWEEK周龄，AGEDAY日龄，AGEHOUR小时龄，
//CINT将数据转换为一个整数，CDOUBLE将数据转换为一个双精度浮点数
//未完成：LOOKUP, PARAMETER

var DCExpression = new Object();

//
// 将字符串转换为数值
//
DCExpression.MyParseFloat = function (text) {
    if (text == null) {
        return Number.NaN;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return Number.NaN;
        }
        if (text.charAt(0) == "!") {
            var elements = document.getElementsByName(text.substr(1));
            if (elements != null && elements.length > 0) {
                text = elements[0].value;
                if (text == null || text.length == 0) {
                    return Number.NaN;
                }
            }
            else {
                return Number.NaN;
            }
        }
        // 删除货币符号
        if (text.indexOf("￥") >= 0) {
            text = text.replace("￥", "");
        }
        if (text.indexOf("€") >= 0) {
            text = text.replace("€", "");
        }
        if (text.indexOf("$") >= 0) {
            text = text.replace("$", "");
        }
    }
    return parseFloat(text);
};

// <summary>
// 返回绝对值
// </summary>
// <param name="text">一个数值</param>
// <returns>返回绝对值，若参数为NAN则返回NAN</returns>
DCExpression.ABS = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.abs(dbl);
};

// <summary>
// 返回指定弧度的反余弦值
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>  
DCExpression.ACOS = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.acos(dbl);
};

// <summary>
// 返回指定弧度的反正弦值
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>    
DCExpression.ASIN = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.asin(dbl);
};

// <summary>
// 返回指定弧度的反正切值
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>         
DCExpression.ATAN = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.atan(dbl);
};

// <summary>
//  返回指定弧度的正切值
// </summary>
// <param name="y">点的 y 坐标</param>
// <param name="x">点的 x 坐标</param>
// <returns>若某个参数为NAN则返回NAN</returns>        
DCExpression.ATAN2 = function (y, x) {
    yy = this.MyParseFloat(y);
    xx = this.MyParseFloat(x);
    if (isNaN(yy) || isNaN(xx)) {
        return Number.NaN;
    }
    return Math.atan2(y, x);
};

// <summary>
// 返回算术平均值
// </summary>
// <returns>若某个参数为NAN则不参与计算,若所有参数都为NAN，则返回NAN</returns>
DCExpression.AVERAGE = function () {
    var total = 0;
    var count = 0;
    var iCount = 0;
    for (iCount = 0; iCount < arguments.length; iCount++) {
        var p = arguments[iCount];
        dbl = this.MyParseFloat(arguments[iCount]);
        if (isNaN(dbl) == false) {
            total = total + dbl;
            count = count + 1;
        }
    }
    if (count > 0) {
        return total / count;
    }
    return Number.NaN;
};

// <summary>
// 获得最近的整数
// </summary>
// <param name="a">一个数值</param>
// <returns>返回最接近 a 的整数。如果 a 的小数部分正好处于两个整数中间，
// 其中一个整数为偶数，另一个整数为奇数，则返回偶数。若参数为NAN则返回NAN
// </returns>
DCExpression.CEILING = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    c = Math.ceil(dbl);
    f = Math.floor(dbl);
    m = (c + f) / 2;
    if (m > dbl) {
        return c;
    }
    else if (m == dbl) {
        if (c % 2 == 0) {
            return c;
        }
        else {
            return f;
        }
    }
    else {
        return f;
    }
};

// <summary>
// 返回指定弧度的COS值
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.COS = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.cos(dbl);
};

// <summary>
// 返回参数的个数
// </summary>
// <returns>若某个参数为NAN则不参与计算</returns>
DCExpression.COUNT = function () {
    var count = 0;
    var iCount = 0;
    for (iCount = 0; iCount < arguments.length; iCount++) {
        var p = arguments[iCount];
        dbl = this.MyParseFloat(arguments[iCount]);
        if (isNaN(dbl) == false) {
            count = count + 1;
        }
    }
    return count;
};

// <summary>
// 返回e的n次方
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.EXP = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.exp(dbl);
};

// <summary>
// 返回向下舍入取整数
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.FLOOR = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.floor(dbl);
};

// <summary>
// 将数值向小取整为最接近的整数
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.INT = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.floor(dbl);
};

// <summary>
// 根据给定底数返回数字的对数
// </summary>
// <param name="b">要查找其对数的数字</param>
// <param name="a">对数的底</param>
// <returns>若某个参数为NAN则返回NAN</returns>
DCExpression.LOG = function (b, a) {
    bb = this.MyParseFloat(bb);
    aa = this.MyParseFloat(a);
    if (isNaN(bb) || isNaN(aa)) {
        return Number.NaN;
    }
    else {
        var tmp = (Math.log(bb)) / (Math.log(aa))
        return Math.round(1000000 * tmp) / 1000000;
    }
};

// <summary>
// 返回以10为底的对数
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.LOG10 = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    else {
        var tmp = (Math.log(bb)) / (Math.log(10))
        return Math.round(1000000 * tmp) / 1000000;
    }
};

// <summary>
// 返回最大值
// </summary>
// <returns>若某个参数为NAN则不参与计算</returns>
DCExpression.MAX = function () {
    //debugger ;
    var result = Number.NaN;
    var count = 0;
    var iCount = 0;
    for (iCount = 0; iCount < arguments.length; iCount++) {
        var v = arguments[iCount];
        dbl = this.MyParseFloat(arguments[iCount]);
        if (isNaN(result)) {
            result = dbl;
        }
        else if (isNaN(dbl) == false) {
            if (result < dbl) {
                result = dbl;
            }
        }
    }
    return result;
};

// <summary>
// 返回最小值
// </summary>
// <returns>若某个参数为NAN则不参与计算</returns>        
DCExpression.MIN = function () {
    var result = Number.NaN;
    var count = 0;
    var iCount = 0;
    for (iCount = 0; iCount < arguments.length; iCount++) {
        var v = arguments[iCount];
        dbl = this.MyParseFloat(arguments[iCount]);
        if (isNaN(result)) {
            result = dbl;
        }
        else if (isNaN(dbl) == false) {
            if (result > dbl) {
                result = dbl;
            }
        }
    }
    return result;
};

// <summary>
// 返回两个数相除的余数
// </summary>
// <param name="number">被除数</param>
// <param name="divisor">除数</param>
// <returns>若某个参数为NAN则返回NAN</returns>
DCExpression.MOD = function (a, b) {
    aa = this.MyParseFloat(a);
    bb = this.MyParseFloat(bb);
    if (isNaN(aa) || isNaN(bb)) {
        return Number.NaN;
    }
    return aa % bb;
};

// <summary>
// 将正（负）数向上（下）舍入到最接近的奇数
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.ODD = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    else {
        tmp = Math.ceil(Math.abs(dbl));
        if (tmp % 2 == 0) {
            tmp++;
        }
        if (dbl < 0) {
            return 0 - tmp;
        }
        else {
            return tmp;
        }
    }
};

// <summary>
// 返回3.14159265358979
// </summary>
DCExpression.PI = 3.14159265358979;

// <summary>
// 返回某数的乘幂
// </summary>
// <param name="a">基数</param>
// <param name="b">幂数</param>
// <returns>若某个参数为NAN则返回NAN</returns>
DCExpression.POW = function (a, b) {
    aa = this.MyParseFloat(a);
    bb = this.MyParseFloat(ba);
    if (isNaN(aa) || isNaN(bb)) {
        return Number.NaN;
    }
    return Math.pow(aa, bb);
};

// <summary>
// 计算所有参数的乘积
// </summary>
// <returns>若某个参数为NAN则不参与计算</returns>        
DCExpression.PRODUCT = function () {
    //debugger ;
    var total = Number.NaN;
    var iCount = 0;
    for (iCount = 0; iCount < arguments.length; iCount++) {
        dbl = this.MyParseFloat(arguments[iCount]);
        if (isNaN(dbl) == false) {
            if (isNaN(total)) {
                total = dbl;
            }
            else {
                total = total * dbl;
            }
        }
    }
    return total;
};

// <summary>
// 将角度转换为弧度
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.RADIANS = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return (Math.PI / 180) * dbl;
};

// <summary>
// 返回一个介于0到1之间的随机数
// </summary>
// <returns>随机数</returns>
DCExpression.RAND = function () {
    return Math.random();
};

// <summary>
// 进行四舍五入计算
// </summary>
// <param name="a">一个数值</param>
// <returns>最接近 a 的整数。如果 a 的小数部分正好处于两个整数中间，
// 其中一个整数为偶数，另一个整数为奇数，则返回偶数.
// 若参数为NAN则返回NAN</returns>
DCExpression.ROUND = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    else {
        f = Math.floor(dbl);
        c = Math.ceil(dbl);
        tmp = f + 0.5;
        if (tmp > dbl) {
            return f;
        }
        else if (tmp < dbl) {
            return c;
        }
        else
        {
            if (f % 2 == 0) {
                return f;
            }
            else {
                return c;
            }
        }
    }
};

// <summary>
// 向下舍入数字
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.ROUNDDOWN = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.floor(dbl);
};

// <summary>
// 向上舍入数字
// </summary>
// <param name="a">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.ROUNDUP = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.ceil(dbl);
};

// <summary>
// 为正数返回1，为零返回0，为负数返回-1 
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.SIGN = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    else {
        if (dbl > 0) {
            return 1;
        }
        else if (dbl == 0) {
            return 0;
        }
        else {
            return -1;
        }
    }
};

// <summary>
// 返回指定角度的正弦值
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.SIN = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.sin(dbl);
};

// <summary>
// 返回数值的平方根
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.SQRT = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.sqrt(dbl);
};

// <summary>
// 计算所有数值的和
// </summary>
// <returns>若某个参数为NAN则不参与计算</returns>        
DCExpression.SUM = function () {
    var total = Number.NaN;
    var iCount = 0;
    for (iCount = 0; iCount < arguments.length; iCount++) {
        dbl = this.MyParseFloat(arguments[iCount]);
        if (isNaN(dbl) == false) {
            if (isNaN(total)) {
                total = dbl;
            }
            else {
                total = total + dbl;
            }
        }
    }
    return total;
};

// <summary>
// 返回指定角度的正切值
// </summary>
// <param name="text">一个数值</param>
// <returns>若参数为NAN则返回NAN</returns>
DCExpression.TAN = function (text) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return Number.NaN;
    }
    return Math.tan(dbl);
};

// <summary>
// 刘帅20150525添加：Boolean转换
// 如果逻辑对象无初始值或者其值为 0、-0、null、""、false、undefined 或者 NaN，那么对象的值为 false。
// 否则，其值为 true（即使变量为字符串 "false" 时）！
// </summary>
// <param name="text">字符串</param>
// <returns>根据结果返回a或b</returns>
DCExpression.IF = function (text, a, b) {
    if (text == null) {
        return b; //false
    }
    var Result;
    if (typeof (text) == "string") {
        if (text.length == 0) {
            Result = new Boolean(""); //false
        }
        else {
            Result = new Boolean("true"); //new Boolean("true")和new Boolean("false")相同结果，都是true
        }
    }
    else {
        Result = new Boolean(text);
    }
    if (Result == true) {
        return a;
    }
    else {
        return b;
    }
};

// <summary>
// 刘帅20150525添加：用于在第二个文本串中定位第一个文本串
// 并返回第一个文本串在第二个字符串位置的值，该值从第二个文本串的第一个字符算起。从0开始。
// </summary>
// <param name="text">被查找的字符串</param>
// <param name="stringValue">查找的范围</param>
// <returns>返回第一个文本串在第二个字符串位置的值</returns>
DCExpression.FIND = function (text, stringValue) {
    if (text == null) {
        return -1;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return -1;
        }
    }
    if (typeof (stringValue) == "string") {
        if (stringValue.length == 0) {
            return -1;
        }
    }
    return stringValue.indexOf(text);
}; 

// <summary>
// 刘帅20150525添加：字符串长度
// IE会把一个字符串认作一个字符
// </summary>
// <param name="text">字符串</param>
// <returns>返回长度</returns>
DCExpression.LEN = function (text) {
    if (text == null) {
        return 0;
    }
    return text.toString().length;
}; 

// <summary>
// 刘帅20150525添加：计算小时龄
// </summary>
// <param name="text">日期</param>
// <returns>返回小时差</returns>
DCExpression.AGEHOUR = function (text) {
    if (text == null) {
        return 0;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return 0;
        }
    }
    var brithday = new Date(Date.parse(text.replace(/-/g, "/"))).getTime(); //转换为日期格式,再取毫秒数
    var nowDate = new Date().getTime();
    var divNum = 1000 * 60 * 60;
    return this.CINT((nowDate - brithday) / divNum); //不计算余数    
}; 

// <summary>
// 刘帅20150523添加：计算日期龄
// </summary>
// <param name="text">日期</param>
// <returns>返回日期差</returns>
DCExpression.AGEDAY = function (text) {
    if (text == null) {
        return 0;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return 0;
        }
    }
    var brithday = new Date(Date.parse(text.replace(/-/g, "/"))).getTime(); //转换为日期格式,再取毫秒数
    var nowDate = new Date().getTime();
    var divNum = 1000 * 60 * 60 * 24 ;
    return this.CINT((nowDate - brithday) / divNum); //不计算余数    
}; 

// <summary>
// 刘帅20150523添加：计算周龄
// </summary>
// <param name="text">日期</param>
// <returns>返回周差</returns>
DCExpression.AGEWEEK = function (text) {
    if (text == null) {
        return 0;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return 0;
        }
    }
    var brithday = new Date(Date.parse(text.replace(/-/g, "/"))).getTime(); //转换为日期格式,再取毫秒数
    var nowDate = new Date().getTime();
    var divNum = 1000 * 60 * 60 * 24 * 7;
    return this.CINT((nowDate - brithday) / divNum); //不计算余数    
};   

// <summary>
// 刘帅20150523添加：计算月龄
// </summary>
// <param name="text">日期</param>
// <returns>返回月差</returns>
DCExpression.AGEMONTH = function (text) {
    if (text == null) {
        return 0;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return 0;
        }
    }
    var brithday = new Date(Date.parse(text.replace(/-/g, "/"))); //转换为日期格式
    var nowDate = new Date();

    var year1 = brithday.getFullYear();
    var year2 = nowDate.getFullYear();
    var month1 = brithday.getMonth();
    var month2 = nowDate.getMonth();

    return (year2 - year1) * 12 + (month2 - month1);
};   

// <summary>
// 刘帅20150523添加：计算年龄
// </summary>
// <param name="text">日期</param>
// <returns>返回年龄差</returns>
DCExpression.AGE = function (text) {
    if (text == null) {
        return 0;
    }
    if (typeof (text) == "string") {
        if (text.length == 0) {
            return 0;
        }
    }
    var brithday = new Date(Date.parse(text.replace(/-/g, "/"))); //转换为日期格式
    var nowDate = new Date();
    return nowDate.getFullYear() - brithday.getFullYear();
};   
           
// <summary>
// 刘帅20150523添加：将数据转换为一个整数
// parseInt("1g")=1，parseInt("g1")=NaN
// </summary>
// <param name="text">要转换的数据</param>
// <param name="defaultValue">默认值</param>
// <returns>若参数为NAN则返回默认值</returns>
DCExpression.CINT = function (text,defaultValue) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return defaultValue;
    }
    return parseInt(dbl);
};

// <summary>
// 刘帅20150523添加：将数据转换为一个双精度浮点数
// </summary>
// <param name="text">要转换的数据</param>
// <param name="defaultValue">默认值</param>
// <returns>若参数为NAN则返回默认值</returns>
DCExpression.CDOUBLE = function (text,defaultValue) {
    dbl = this.MyParseFloat(text);
    if (isNaN(dbl)) {
        return defaultValue;
    }
    return parseFloat(dbl);
}; 

// <summary>
// 伍贻超20180425添加：新增对LOOKUP表达式公式的支持
// </summary>
// <returns></returns>        
DCExpression.LOOKUP = function () {
    if (arguments.length < 3) {
        return null;
    }
    
    var srcValue = this.MyParseFloat(arguments[0]);
    if (srcValue == Number.NaN) {
        return null;
    }
    var result = null;
    //for (var i = 1; i <= arguments.length; i = i + 2) {
    //    var minValue = this.MyParseFloat(arguments[i]);
    //    //var maxValue = this.MyParseFloat(arguments[i + 2]);
    //    if (minValue == Number.NaN || srcValue < minValue) {
    //        return result;
    //    } else if (i + 2 <= arguments.length && srcValue < arguments[i + 2]) {
    //        result = arguments[i + 1];
    //    }
    //}
    //BSDCWRIT-50 hulijun 20201209
    for (var i = 2; i < arguments.length; i = i + 2) {
        var minValue = this.MyParseFloat(arguments[i - 1]);
        var maxValue = null;
        if (i + 1 < arguments.length) {
            maxValue = this.MyParseFloat(arguments[i + 1]);
        }

        if (maxValue && srcValue >= minValue && srcValue < maxValue) {
            result = arguments[i];
            break;
        } else if (!maxValue && srcValue >= minValue) {
            result = arguments[i];
            break;
        }
    }
    return result;
};


// <summary>
// 伍贻超20190527添加：前端新增用于计算天数时间差的函数
// </summary>
// <returns></returns>        
DCExpression.DAYDIFF = function () {
    //强制只接受两个参数，用前一个减去后一个
    if (arguments.length !== 2) {
        return null;
    }
    var dateStr = ValueFormater.StringConvert(arguments[0]);
    dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    dateStr = dateStr.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
    var dateone = ValueFormater.strToDate(dateStr); //分隔字符串，转换为时间

    dateStr = ValueFormater.StringConvert(arguments[1]);
    dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    dateStr = dateStr.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
    var datetwo = ValueFormater.strToDate(dateStr); //分隔字符串，转换为时间

    if (dateone !== null && datetwo !== null && typeof (dateone.getTime) === "function" && typeof (datetwo.getTime) === "function") {
        var ms = datetwo.getTime() - dateone.getTime();
        var daydiff = Math.floor(ms / (1000 * 3600 * 24));
        return daydiff;
    } else {
        return null;
    }
};

// <summary>
// 伍贻超20190527添加：前端新增用于计算小时时间差的函数
// </summary>
// <returns></returns>        
DCExpression.HOURDIFF = function () {
    //强制只接受两个参数，用前一个减去后一个
    if (arguments.length !== 2) {
        return null;
    }
    var dateStr = ValueFormater.StringConvert(arguments[0]);
    dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    dateStr = dateStr.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
    var dateone = ValueFormater.strToDate(dateStr); //分隔字符串，转换为时间

    dateStr = ValueFormater.StringConvert(arguments[1]);
    dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    dateStr = dateStr.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
    var datetwo = ValueFormater.strToDate(dateStr); //分隔字符串，转换为时间

    if (dateone !== null && datetwo !== null && typeof (dateone.getTime) === "function" && typeof (datetwo.getTime) === "function") {
        var ms = datetwo.getTime() - dateone.getTime();
        var daydiff = Math.floor(ms / (1000 * 3600));
        return daydiff;
    } else {
        return null;
    }   
};

// <summary>
// 伍贻超20190527添加：前端新增用于计算分钟时间差的函数
// </summary>
// <returns></returns>        
DCExpression.MINUTEDIFF = function () {
    //强制只接受两个参数，用前一个减去后一个
    if (arguments.length !== 2) {
        return null;
    }
    var dateStr = ValueFormater.StringConvert(arguments[0]);
    dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    dateStr = dateStr.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
    var dateone = ValueFormater.strToDate(dateStr); //分隔字符串，转换为时间

    dateStr = ValueFormater.StringConvert(arguments[1]);
    dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    dateStr = dateStr.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
    var datetwo = ValueFormater.strToDate(dateStr); //分隔字符串，转换为时间

    if ( dateone !== null && datetwo !== null && typeof (dateone.getTime) === "function" && typeof (datetwo.getTime) === "function") {
        var ms = datetwo.getTime() - dateone.getTime();
        var daydiff = Math.floor(ms / (1000 * 60));
        return daydiff;
    } else {
        return null;
    }
};

// <summary>
// 伍贻超20190618添加：前端新增用于计算多选框或多选下拉项的值求和计算
// </summary>
// <returns></returns>        
DCExpression.SUMINNERVALUE = function () {
    //强制只接受一个参数
    if (arguments.length !== 1) {
        return null;
    }
    //console.log(arguments[0]);
    var parameters = arguments[0].toString().split(',');
    if (parameters !== null && parameters.length > 0) {
        var result = 0;
        for (var i = 0; i < parameters.length; i++) {
            var j = parseFloat(parameters[i]);
            if (isNaN(j) === false) {
                result = result + j;
            }
        }
        return result;
    } else {
        return null;
    }
};