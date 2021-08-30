/*
刘帅 20150622
数据格式化包含：None无样式、Numeric数字、Currency货币、DateTime时间日期、String字符串、
SpecifyLength固定文本长度、Boolean布尔类型、Percent百分比
*/

var ValueFormater = new Object();

//*
//*
//* @param style 格式化类型(字符串类型(Style:DateTime;Format:"yyyy-MM-dd"))
//* @param noneText 默认值(Number或者String)
//* @param Value 需要格式化的内容(Number或者String)
//* @return 格式化结果

ValueFormater.Execute = function (style, noneText, Value) {
    if (document.WriterControl != null
        &&
        (document.WriterControl.Options.EnableValueFormat == false ||
        document.WriterControl.Options.EnableValueFormat == "false")) {
        return Value;
    }
    if (Value == null || Value.length == 0) {
        return noneText;
    }
    if (style == null || style.length == 0) {
        return Value;
    }
    //debugger;
    var result = ValueFormater.ParseAttributeString(style); //分析字符串
    if (result.style === undefined || result.format === undefined) {//数组长度必须为4
        return Value;
    }
    //数组四个值：Style,DateTime,Format,yyyy-MM-dd
    style = result.style.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
    var format = result.format.replace(/(^\s*)|(\s*$)/g, '');

    switch (style) {
        case "None":
            return Value.toString();
        case "Numeric":
            Value = ValueFormater.MyParseFloat(Value); //转换为数字
            return ValueFormater.NumberFormater(format, noneText, Value);
        case "Currency": //货币
            Value = ValueFormater.MyParseFloat(Value); //转换为数字
            return ValueFormater.CurrencyFormater(format, noneText, Value);
        case "DateTime": //时间日期
            return ValueFormater.DateTimeFormater(format, noneText, Value);
        case "String": //字符串
            return ValueFormater.StringFormater(format, noneText, Value);
        //case "SpecifyLength": //固定文本长度  
        //break;      
        case "Boolean": //布尔值
            return ValueFormater.BooleanFormater(format, noneText, Value);
        case "Percent": //百分比
            return ValueFormater.PercentFormater(format, noneText, Value);
    }
    return Value.toString();
};

/*解析字符串设置对象数据
* @param text 字符串类型(Style:"DateTime";Format:yyyy-MM-dd)
*/
ValueFormater.ParseAttributeString = function (text) {
    if (text == null || text == undefined || text == '') {
        return null;
    }
    text = text.replace(/(^\s*)|(\s*$)/g, ''); //去除前后空格
    var result = {
        style: undefined,
        format: undefined
    };



    while (text.length > 0) {
        var newName = ""; //键
        var newValue = ""; //值
        var index = text.indexOf(":");
        if (index > 0) {
            newName = text.substring(0, index);
            text = text.substring(index + 1);
            if (text.slice(0, 1) == "\'") {//值里面以单引号开头,slice效率比indexOf更高
                var index2 = text.indexOf("\'", 1);
                if (index2 < 0) {
                    index2 = text.indexOf(";");
                }
                if (index2 >= 0) {
                    newValue = text.substring(1, index2);
                    text = text.substring(index2 + 1);
                    if (text.slice(0, 1) == "\'") {
                        text = text.substring(1);
                    }
                }
                else {
                    newValue = text.substring(1);
                    text = "";
                }
            } //if
            else {//值里面不以单引号开头
                var index3 = text.indexOf(";");
                if (index3 >= 0) {
                    newValue = text.substring(0, index3);
                    text = text.substring(index3 + 1);
                }
                else {
                    newValue = text;
                    text = "";
                }
            }
        }
        else {
            newName = text.trim();
            text = "";
        }
        //debugger;
        //去除前后的引号
        newName = ValueFormater.LeftTrim(newName.replace(/(^\s*)|(\s*$)/g, ''));
        newName = ValueFormater.RightTrim(newName.replace(/(^\s*)|(\s*$)/g, ''));
        newValue = ValueFormater.LeftTrim(newValue.replace(/(^\s*)|(\s*$)/g, ''));
        newValue = ValueFormater.RightTrim(newValue.replace(/(^\s*)|(\s*$)/g, ''));

        //WYC20190508：改用JSON防止STYLE与FORMAT颠倒顺序导致出错
        if (newName.toLowerCase() === "style") {
            result.style = newValue;
        } else if (newName.toLowerCase() === "format") {
            result.format = newValue;
        }
    }
    return result;
};
//去除左边的引号字符
ValueFormater.LeftTrim = function (str) {
    var i; //去除前面的双引号
    for (i = 0; i < str.length; i++) {
        if (str.charAt(i) != "\"")
            break;
    }
    str = str.substring(i, str.length);

    var j; //去除前面的单引号
    for (j = 0; j < str.length; j++) {
        if (str.charAt(j) != "\'")
            break;
    }
    str = str.substring(j, str.length);
    return str;
};
//去除右边的引号字符
ValueFormater.RightTrim = function (str) {
    var i; //去除后面的双引号
    for (i = str.length - 1; i >= 0; i--) {
        if (str.charAt(i) != "\"")
            break;
    }
    str = str.substring(0, i + 1);

    var j; //去除后面的单引号
    for (j = str.length - 1; j >= 0; j--) {
        if (str.charAt(j) != "\'")
            break;
    }
    str = str.substring(0, j + 1);
    return str;
};

//百分比转换
ValueFormater.PercentFormater = function (format, noneText, Value) {
    if (Value == null || Value == "") {
        return noneText;
    }
    var oldValue = Value; //转换不成功时返回原值
    Value = ValueFormater.MyParseFloat(Value); //转换为数字
    if ((isNaN(Value) == false) && isFinite(Value) == true) {
        var numberData = Value * 100;
        switch (format) {
            case "0":
                numberData = numberData.toFixed(0);
                return numberData.toString() + "%";
                break;
            case "1":
                numberData = numberData.toFixed(1);
                return numberData.toString() + "%";
                break;
            case "2":
                numberData = numberData.toFixed(2);
                return numberData.toString() + "%";
                break;
            case "3":
                numberData = numberData.toFixed(3);
                return numberData.toString() + "%";
                break;
            case "4":
                numberData = numberData.toFixed(4);
                return numberData.toString() + "%";
                break;
            default:
                format = ValueFormater.MyParseFloat(format); //转换为数字
                if ((isNaN(format) == false) && isFinite(format) == true) {
                    numberData = numberData.toFixed(format);
                    return numberData.toString() + "%";
                }
                return Value;
        }
    }
    return oldValue;
};

//布尔转换：(Yes,No),(True,False),(是,否),(真,假),(好,差),(男,女),(是,),(,否)
ValueFormater.BooleanFormater = function (format, noneText, Value) {
    if (format == null) {
        return Value;
    }
    //debugger;
    var index = format.indexOf(",");
    var trueStr = format;
    var falseStr = "";
    if (index >= 0) {
        trueStr = format.substring(0, index);
        falseStr = format.substring(index + 1);
    }
    else {
        return Value;
    }

    var bol = false;
    var flag = false;
    if (typeof (Value) == "boolean") {
        bol = new Boolean(Value);
    }
    else if (typeof (Value) == "string") {//逻辑：Boolean.TryParse((string)Value, out bol);
        Value = Value.toString().toLocaleLowerCase(); //转为小写
        if (Value == "true") {
            bol = true;
        }
        else if (Value == "false") {
            bol = false;
        }
        else {
            bol = false;
        }
    }
    else {
        bol = new Boolean(Value);
    }
    if (bol) {
        return trueStr;
    }
    else {
        return falseStr;
    }
};

//字符串格式化：trim，normalizespace，htmltext，（left,1），（right,1），lower，upper
ValueFormater.StringFormater = function (format, noneText, Value) {
    if (Value == null || Value == "") {
        return noneText;
    }
    var oldValue = Value; //转换不成功时返回原值
    Value = Value.toString();
    format = format.toString().toLocaleLowerCase(); //转换为小写字符串
    if (format == "trim") {
        Value = Value.replace(/^(\s|\u00A0)+/, '');
        for (var i = Value.length - 1; i >= 0; i--) {
            if (/\S/.test(Value.charAt(i))) {
                Value = Value.substring(0, i + 1);
                break;
            }
        }
        return Value;
    }
    else if (format == "lower") {
        return Value.toLocaleLowerCase();
    }
    else if (format == "upper") {
        return Value.toLocaleUpperCase();
    }
    //    else if (Value == "normalizespace") {
    //        
    //    }
    //    else if (Value == "htmltext") {
    //       
    //    }
    else if (format.indexOf("left,") == 0) {//左边开始截取       
        var substringArray = format.split(',');
        var strLengh = ValueFormater.MyParseFloat(substringArray[1]);
        return Value.substring(0, strLengh);
    }
    else if (format.indexOf("right,") == 0) {//右边开始截取        
        var substringArray = format.split(',');
        var strLengh = ValueFormater.MyParseFloat(substringArray[1].toString());
        return Value.slice(-strLengh);
    }
    return oldValue;
};

/**      
* 对Date的扩展，将 Date 转化为指定格式的String      
* 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符      
* 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
* ("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423      
* ("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
* ("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
* ("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
* ("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18      
*/
ValueFormater.PatternDateTimeFormater = function (format, time) {
    //debugger;

    var numDate = time.getDate();
    var numHours = time.getHours();
    if (numHours == 24) {
        numDate = numDate + 1;
        numHours = 0; //24点，需要加1天
    }
    var strHours;
    if (numHours == 0) {
        strHours = 0;
    }
    else {
        strHours = (time.getHours() % 12 == 0 ? 12 : time.getHours() % 12).toString();
    }

    var o = {
        "M+": time.getMonth() + 1, //月份         
        "d+": numDate, //日         
        "h+": strHours, //小时         
        "H+": time.getHours(), //小时         
        "m+": time.getMinutes(), //分         
        "s+": time.getSeconds(), //秒         
        "q+": Math.floor((time.getMonth() + 3) / 3), //季度         
        "S": time.getMilliseconds() //毫秒         
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(format)) {
        format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[time.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return format;
};

////12小时时间日期格式
//ValueFormater.MyDateTimeFormater = function (format, time) {    
//    var o = {
//        "M+": time.getMonth() + 1, //month
//        "d+": time.getDate(), //day
//        "h+": time.getHours(), //hour
//        "m+": time.getMinutes(), //minute
//        "s+": time.getSeconds(), //second
//        "q+": Math.floor((time.getMonth() + 3) / 3), //quarter
//        "S": time.getMilliseconds() //millisecond
//    }
//    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
//(time.getFullYear() + "").substr(4 - RegExp.$1.length));
//    for (var k in o) if (new RegExp("(" + k + ")").test(format))
//        format = format.replace(RegExp.$1,
//RegExp.$1.length == 1 ? o[k] :
//("00" + o[k]).substr(("" + o[k]).length));
//    return format;
//};

//字符串为yyyy/MM/dd hh:mm:ss或者缺少时、分、秒，转换为时间日期
ValueFormater.strToDate = function (str) {
    //debugger;
    if (str.indexOf("/") == -1) {//只有时间
        str = new Date().toLocaleDateString() + "T" + str;//20200803 修复时间输入域输出格式无效问题
    }
    str = str.replace("T", " ");//处理yyyy-MM-ddThh:mm:ss的情况
    str = str.replace(/\s/, " ");//处理yyyy-MM-ddThh:mm:ss的情况
    var tempStrs = str.split(" "); //空格分隔
    var dateStrs = tempStrs[0].split("/"); //年月日分组
    var year = parseInt(dateStrs[0], 10);
    var month = parseInt(dateStrs[1], 10) - 1; //月份需要减一
    var day = parseInt(dateStrs[2], 10);

    var hour = "0"; //数组长度为1，缺少时分秒
    var minute = "0";
    var second = "0";

    if (tempStrs.length > 1) {
        var timeStrs = tempStrs[1].split(":"); //时分秒分组
        hour = parseInt(timeStrs[0], 10);

        if (timeStrs.length >= 2) {
            minute = parseInt(timeStrs[1], 10);
        }
        //xym 20201228 修复BS版本时间控件“yyyy年MM月dd日 HH时mm分ss秒”格式，选择日期带秒，光标离开输入域秒为00的问题
        if (timeStrs.length >= 3) {
            second = parseInt(timeStrs[2], 10);
        }
    }

    if (isNaN(year) == true
    || isNaN(month) == true
    || isNaN(day) == true
    || isNaN(hour) == true
    || isNaN(minute) == true
    || isNaN(second) == true) {
        return null; // 不能转换为时间
    }
    var date = new Date(year, month, day, hour, minute, second);
    return date;
};

//把字符串中的ASCII值为160的空格转换为ASCII值为32位的空格
ValueFormater.StringConvert = function (Value) {
    var resultStr = "";
    for (i = 0; i < Value.length; i++) {
        var asciicode = Value.charAt(i).charCodeAt(); //循环转为ASCII
        if (asciicode == 160) {
            asciicode = 32; //空格160转为32
        }
        resultStr = resultStr + String.fromCharCode(asciicode);
    }
    return resultStr;
};

//事件日期格式化：yyyy-MM-dd hh:mm:ss，yyyy-MM-dd，yyyy-MM-dd hh:mm:ss，hh:mm:ss，
//yyyy年MM月dd日，yyyy年MM月dd日 hh时mm分ss秒，d，D，f，F
ValueFormater.DateTimeFormater = function (format, noneText, Value) {
    if (Value == null || Value == "") {
        return noneText;
    }
    var oldValue = Value; //转换不成功时返回原值
    //debugger;
    if (typeof (Value) == "string") {
        //wyc20200902：追加处理
        Value = Value.replace("年", "-");
        Value = Value.replace("月", "-");
        Value = Value.replace("日", "-");
        Value = Value.replace("时", ":");
        Value = Value.replace("分", ":");
        Value = Value.replace("秒", ":");
        //////////////
        Value = ValueFormater.StringConvert(Value);

        Value = Value.replace(/(^\s*)|(\s*$)/g, ''); //去除可能的前后空格
        Value = Value.toString().replace(/-/g, "/")//传入的时间字符串为yyyy-MM-dd hh:mm:ss，全部转换为/
        //Value = new Date(Date.parse(Value)); //缺失秒的时候，出现错误，不使用这种
        Value = ValueFormater.strToDate(Value); //分隔字符串，转换为时间
        if (Value == null) {
            return oldValue;
        }
    }
    if (isNaN(Value.getTime()) == true) {//取毫秒，判断是否时间
        return oldValue;
    }
    switch (format) {
        case "yyyy-MM-dd hh:mm:ss":
            return ValueFormater.PatternDateTimeFormater("yyyy-MM-dd hh:mm:ss", Value);
            break;
        case "yyyy-MM-dd HH:mm:ss":
            return ValueFormater.PatternDateTimeFormater("yyyy-MM-dd HH:mm:ss", Value);
            break;
        case "yyyy-MM-dd":
            return ValueFormater.PatternDateTimeFormater("yyyy-MM-dd", Value);
            break;
        case "hh:mm:ss":
            return ValueFormater.PatternDateTimeFormater("HH:mm:ss", Value);
            break;
        case "yyyy年MM月dd日":
            return ValueFormater.PatternDateTimeFormater("yyyy年MM月dd日", Value);
            break;
        case "yyyy年MM月dd日 hh时mm分ss秒":
            return ValueFormater.PatternDateTimeFormater("yyyy年MM月dd日 hh时mm分ss秒", Value);
            break;
        case "yyyy年MM月dd日 HH时mm分ss秒":
            return ValueFormater.PatternDateTimeFormater("yyyy年MM月dd日 HH时mm分ss秒", Value);
            break;
        case "d":
            return ValueFormater.PatternDateTimeFormater("yyyy/MM/dd", Value);
            break;
        case "D":
            return ValueFormater.PatternDateTimeFormater("yyyy年MM月dd日", Value);
            break;
        case "f":
            return ValueFormater.PatternDateTimeFormater("yyyy年MM月dd日 hh时mm分", Value);
            break;
        case "F":
            return ValueFormater.PatternDateTimeFormater("yyyy年MM月dd日 hh:mm:ss", Value);
            break;
        default:
            //debugger;
            return ValueFormater.PatternDateTimeFormater(format, Value); //自定义时间日期格式字符串
    }
};

//货币格式化：00.00,大写中文,小写中文，#.00,c
ValueFormater.CurrencyFormater = function (format, noneText, Value) {
    if (!isNaN(parseFloat(Value)) && isFinite(Value)) {
        Value = Number(Value);
        switch (format) {
            case "00.00":
                return Value.toFixed(2); //2位小数
                break;
            case "#.00":
                return Value.toFixed(2); //2位小数
                break;
            case "大写中文":
                return ValueFormater.NumToUpChineseMoney(Value);
                break;
            case "小写中文":
                return ValueFormater.NumToSysbolMoney(Value, ''); //1,234,567.45
                break;
            case "c":
                return ValueFormater.NumToSysbolMoney(Value, '￥'); //￥1,234,567.45
                break;
        }
    }
    return Value;
};

//数字转化为中文大写金额，小数位精确到四位
ValueFormater.NumToUpChineseMoney = function (money) {
    var cnNums = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); //汉字的数字
    var cnIntRadice = new Array("", "拾", "佰", "仟"); //基本单位
    var cnIntUnits = new Array("", "万", "亿", "兆"); //对应整数部分扩展单位
    var cnDecUnits = new Array("角", "分", "毫", "厘"); //对应小数部分单位
    var cnInteger = "整"; //整数金额时后面跟的字符
    var cnIntLast = "元"; //整型完以后的单位
    var maxNum = 999999999999999.9999; //最大处理的数字
    var IntegerNum; //金额整数部分
    var DecimalNum; //金额小数部分
    var ChineseStr = ""; //输出的中文金额字符串
    var parts; //分离金额后用的数组，预定义
    if (money == "") {
        return "";
    }
    money = parseFloat(money);
    if (money >= maxNum) {
        console.log('超出最大处理数字,最大数字为999999999999999.9999');
        return "";
    }
    if (money == 0) {
        ChineseStr = cnNums[0] + cnIntLast + cnInteger;
        return ChineseStr;
    }
    money = money.toString(); //转换为字符串
    if (money.indexOf(".") == -1) {
        IntegerNum = money;
        DecimalNum = '';
    } else {
        parts = money.split(".");
        IntegerNum = parts[0];
        DecimalNum = parts[1].substr(0, 4);
    }
    if (parseInt(IntegerNum, 10) > 0) { //获取整型部分转换
        var zeroCount = 0;
        var IntLen = IntegerNum.length;
        for (var i = 0; i < IntLen; i++) {
            var n = IntegerNum.substr(i, 1);
            var p = IntLen - i - 1;
            var q = p / 4;
            var m = p % 4;
            if (n == "0") {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    ChineseStr += cnNums[0];
                }
                zeroCount = 0; //归零
                ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            if (m == 0 && zeroCount < 4) {
                ChineseStr += cnIntUnits[q];
            }
        }
        ChineseStr += cnIntLast;
        //整型部分处理完毕
    }
    if (DecimalNum != '') { //小数部分
        var decLen = DecimalNum.length;
        for (var i = 0; i < decLen; i++) {
            var n = DecimalNum.substr(i, 1);
            if (n != '0') {
                ChineseStr += cnNums[Number(n)] + cnDecUnits[i];
            }
        }
    }
    if (ChineseStr == '') {
        ChineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (DecimalNum == '') {
        ChineseStr += cnInteger;
    }
    return ChineseStr;
};

//数字转换为￥1,234,567.45人民币形式
ValueFormater.NumToSysbolMoney = function (Value, symbol) {
    Value = Value.toString().replace(/\$|\,/g, '');
    if (isNaN(Value))
        num = "0";
    sign = (Value == (Value = Math.abs(Value)));
    Value = Math.floor(Value * 100 + 0.50000000001);
    cents = Value % 100;
    Value = Math.floor(Value / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((Value.length - (1 + i)) / 3); i++)
        Value = Value.substring(0, Value.length - (4 * i + 3)) + ',' + Value.substring(Value.length - (4 * i + 3));
    if (symbol == null || symbol == "") {
        return (((sign) ? '' : '-') + Value + '.' + cents);
    }
    else {
        symbol = symbol.toString();
        return symbol + (((sign) ? '' : '-') + Value + '.' + cents);
    }
};

//数字格式化：0.00,#.00,c,e,f,g,r,FormatedSize
ValueFormater.NumberFormater = function (format, noneText, Value) {
    if (!isNaN(parseFloat(Value)) && isFinite(Value)) {
        Value = Number(Value);
        //debugger;
        switch (format) {
            case "0.00":
                return Value.toFixed(2); //2位小数
                break;
            case "0.":
                return Value.toFixed(0); //2位小数
                break;
            case "0":
                return Value.toFixed(0); //2位小数
                break;
            case "#.00":
                return Value.toFixed(2); //2位小数
                break;
            case "c": //￥1,234,567.45人民币形式
                return ValueFormater.NumToSysbolMoney(Value, '￥');
                break;
            case "e":
                return Value.toExponential(2); //按科学计数法格式返回，参数表示小数点后保留的位数。
                break;
            //case "f":  
            //    break;  
            //case "g":  
            //    break;  
            //case "r":  
            //    break;  
            //case "FormatedSize":  
            //    break;  
            default:
                return Value;
                break;
        }
    }
    return noneText;
};

// 将字符串转换为数值
ValueFormater.MyParseFloat = function (text) {
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
        if (text.indexOf(",") >= 0) {
            text = text.replace(",", "");
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
ValueFormater.MyDebug = function () {
    //None无样式、Numeric数字、Currency货币、DateTime时间日期、String字符串、
    //SpecifyLength固定文本长度、Boolean布尔类型、Percent百分比
    //debugger;
    //无样式
    //alert(ValueFormater.Execute(" Style: None; Format: yyyy年MM月dd日 HH时mm分ss秒", "nonetext", "asasasasasasq22424"));

    //时间测试
    //var Value = "2014/1/1 23:中文:22"; //转换为时间的字符串只能使用/，时间缺少秒
    //var Value = "2014/1/1 24:45:22"; 
    //var Value = "12:60:22";
    //Value = new Date(Date.parse(Value));
    //alert(ValueFormater.Execute(" Style: DateTime; Format: yyyy年MM月dd日 HH时mm分ss秒", "nonetext", Value));
    var strHeader = "2014/4/1";
    var charCode = String.fromCharCode(160);
    var strEnder = "24:60:22";
    Value = strHeader + charCode + strEnder;
    //Value = "2014/4/1 24:60:22";
    //Value = new Date(Date.parse(Value));
    //alert(ValueFormater.Execute(" Style: DateTime; Format: yyyy年MM月dd日 HH时mm分", "nonetext", Value));
    alert(ValueFormater.Execute(" Style: DateTime; Format: yyyy年MM月dd日 hh时mm分", "nonetext", Value));
    //    var value = 0;
    //    var num = value % 12 == 0 ? 12 : value % 12; //小时     
    //    alert(num);


    //数字测试：0.00,#.00,c,e,f,g,r,FormatedSize
    //var Value = "2323.32213";
    //alert(ValueFormater.Execute(" Style: Numeric; Format: #.00", "nonetext", Value));

    //货币格式化：00.00,大写中文,小写中文，#.00,c
    //var Value = "2323.32213";
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Currency; Format: \"\"\"大写中文\"", "nonetext", Value));
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Currency; Format: \"\"\"小写中文\"", "nonetext", Value));
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Currency; Format: \"\"\"#.00\"", "nonetext", Value));

    //字符串测试trim，normalizespace，htmltext，（left,1），（right,1），lower，upper
    //var Value = "电子病历编辑器\"电\"子\"病\"历\"编\"辑\"器\"";
    //alert(ValueFormater.Execute(" Style: \"\"\"\"String; Format: \"\"\"left,8\"", "nonetext", Value));
    //alert(ValueFormater.Execute(" Style: \"\"\"\"String; Format: \"\"\"RIGHT,8\"", "nonetext", Value));

    //布尔测试(Yes,No),(True,False),(是,否),(真,假),(好,差),(男,女),(是,),(,否)
    //var Value = "电子病历编辑器\"电\"子\"病\"历\"编\"辑\"器\"";
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Boolean; Format: \"\"\"man,woman\"", "nonetext", true));
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Boolean; Format: \"\"\"man\"", "nonetext", Value));

    //百分比测试
    //var Value = "123456.789012345";
    //var Value = "asdfghj.qwertyu";
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Percent; Format: \"\"\"5\"", "nonetext", Value));
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Percent; Format: \"\"\"a\"", "nonetext", Value));
    //alert(ValueFormater.Execute(" Style: \"\"\"\"Percent; Format: \"\"\"5\"", "nonetext", Value));
};

//ValueFormater.MyDebug();

//伍贻超20180110：将类似"Value1=某值1;Value2=某值2;Value3=某值3"这类格式转换成类似{"Value1":"某值1","Value2":"某值2","Value3":"某值3"}的JSON字符串，用于医学表达式的工具函数
//需要使用JSON.parse()函数将此接口返回的值转换成JSON对象供医学表达式使用，要求传入的参数格式必须正确，函数内没有校验
ValueFormater.ConvertKeyValueStrToJsonStr = function (kvText) {
    var jsonStr = "";
    kvText = kvText.split('\"').join('');
    var groups = kvText.split(';');
    if (groups.length >= 1 && groups[0] != "") {
        jsonStr = jsonStr + "{";
        for (var i = 0; i < groups.length; i++) {
            var keyvalue = groups[i].split(':');
            var name = keyvalue[0];
            var value = keyvalue[1];

            jsonStr = jsonStr + "\"" + name + "\":" + "\"" + value + "\"";
            if (i != groups.length - 1) {
                jsonStr = jsonStr + ",";
            }
        }
        jsonStr = jsonStr + "}";
    }
    //var json = JSON.parse(jsonStr);
    return jsonStr;
};

//将类似{"Value1":"某值1", "Value2":"某值2", "Value3":"某值3" }格式的JSON字符串转换成类似"Value1=某值;Value2=某值;Value3=某值"的普通字符串，用于医学表达式的工具函数
//需要使用JSON.stringify()函数将JSON对象转换成JSON字符串，然后再作为参数传入此函数
ValueFormater.ConvertJsonStrToKeyValueStr = function (jsonStr) {
    var result = jsonStr.split('{').join('');
    result = result.split('}').join('');
    result = result.split('\"').join('');
    //result = result.split(':').join('=');
    result = result.split(',').join(';');
    return result;
};

//伍贻超20190325：将类似"Value1=某值1;Value2=某值2;Value3=某值3"这类格式转换成字符串数组，用于医学表达式的工具函数
//value1直接保存到数组下标为1的项上,保证array[1]的值为某值1
ValueFormater.ConvertKeyValueStrToArray = function (kvText) {
    var strings = new Array();
    var jsonStr = "";
    kvText = kvText.split('\"').join('');
    var groups = kvText.split(';');
    if (groups.length >= 1 && groups[0] !== "") {
        for (var i = 0; i < groups.length; i++) {
            var keyvalue = groups[i].split(':');
            var name = keyvalue[0];//取ValueN
            var num = parseInt(name.replace("Value", ""));//解析N
            var value = keyvalue[1];//取值
            strings[num] = value;
        }
    }
    return strings;
};

//将医学表达式页面中保存出来的字符串数组转换成类似"Value1=某值;Value2=某值;Value3=某值"的普通字符串，用于医学表达式的工具函数
//其中Value1中的1就代表数组的下标，若值为空则不处理
ValueFormater.ConvertArrayToKeyValueStr = function (strings) {
    var result = "";
    if (strings !== null && strings.length > 0) {
        for (var i = 0; i < strings.length; i++) {
            if (strings[i] !== null && strings[i] !== undefined) {
                if (i === strings.length - 1) {
                    result = result + "Value" + i.toString() + ":" + strings[i];
                } else {
                    result = result + "Value" + i.toString() + ":" + strings[i] + ";";
                }
            }
        }
    }   
    return result;
};