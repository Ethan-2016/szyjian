
var DCStringUtils = new Object();

DCStringUtils.trim = function (s) {
    if (s == null) {
        return s;
    }
    return s.replace(/(^\s*)|(\s*$)/g, "");
};

// 字符串的格式化输出，实现类似C#中的string.Format()的功能。
DCStringUtils.Format = function (text, parameter) {
    if (typeof (text) != "string") {
        return "";
    }
    if (text == null || text.length == 0) {
        return "";
    }
    for (var iCount = 1; iCount < arguments.length; iCount++) {
        var v = arguments[iCount];
        var strV = "";
        if (typeof (v) != "undefined" && v != null) {
            strV = v.toString();
        }
        text = text.replace("{" + (iCount - 1) + "}", strV);
    }
    return text;
};

//
// 将数值转换为文本
//
DCStringUtils.XNumberToString = function (number, decimals) {
    if (isNaN(decimals)) {
        return Math.round(number).toString();
    }
    if (decimals <= 0) {
        number = Math.round(number);
        return number.toString();
    }
    //debugger ;
    var rate = Math.pow(10, decimals);
    number = Math.round(number * rate);
    var result = number.toString();

    result = result.substring(0, result.length - decimals)
            + "."
            + result.substring(result.length - decimals, result.length);
    if (this.StringStartsWith(result, "."))
        result = "0" + result;
    return result;
};

//
// 将文本解析成整数
//
DCStringUtils.MyParseInt=function (strText) {
    if (strText != null && strText.length > 0) {
        for (var index = 0; index < strText.length; index++) {
            if (strText.charCodeAt(index) != 48) {
                if (index > 0) {
                    return parseInt(strText.substring(index, strText.length));
                }
                else {
                    return parseInt(strText);
                }
            }
        }
    }
    return parseInt(strText);
};

//
// 将文本解析成日期数据
//
DCStringUtils.XParseDateTime=function (strValue) {
    if (strValue == null || strValue.length == 0)
        return null;

    var year = 1970;
    var month = 0;
    var day = 1;
    var hour = 0;
    var min = 0;
    var sec = 0;

    var match = false;

    var result = null;

    var strSearch = strValue.match(/\d{14}/);
    //alert( strSearch );
    if (strSearch != null) {
        // etc. 20090323024319
        strSearch = strSearch.toString();
        year = this.MyParseInt(strSearch.substring(0, 4));
        month = this.MyParseInt(strSearch.substring(4, 6));
        day = this.MyParseInt(strSearch.substring(6, 8));
        hour = this.MyParseInt(strSearch.substring(8, 10));
        min = this.MyParseInt(strSearch.substring(10, 12));
        sec = this.MyParseInt(strSearch.substring(12, 14));
        match = true;
    }
    else if ((strSearch = strValue.match(/\d{8}/)) != null) {
        // etc. 20090323
        strSearch = strSearch.toString();
        year = this.MyParseInt(strSearch.substring(0, 4));
        month = this.MyParseInt(strSearch.substring(4, 6));
        day = this.MyParseInt(strSearch.substring(6, 8));
        hour = 0;
        min = 0;
        sec = 0;
        match = true;
    }
    else {
        strSearch = strValue.match(/\d{2,4}-\d{1,2}-\d{1,2}/);
        if (strSearch != null) {
            // etc. 2009-3-23
            var array = strSearch.toString().split("-");
            year = this.MyParseInt(array[0]);
            month = this.MyParseInt(array[1]);
            day = this.MyParseInt(array[2]);
            match = true;
        }
        strSearch = strValue.match(/\d{2,4}年\d{1,2}月\d{1,2}日/);
        if (strSearch != null) {
            // etc. 2009年3月23日 .
            strSearch = strSearch.toString();
            strSearch = strSearch.replace("年", "-");
            strSearch = strSearch.replace("月", "-");
            strSearch = strSearch.replace("日", "");
            var array = strSearch.split("-");
            year = this.MyParseInt(array[0]);
            month = this.MyParseInt(array[1]);
            day = this.MyParseInt(array[2]);
            match = true;
        }
        strSearch = strValue.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
        if (strSearch != null) {
            // etc. 3/23/2009
            var array = strSearch.toString().split("/");
            month = this.MyParseInt(array[0]);
            day = this.MyParseInt(array[1]);
            year = this.MyParseInt(array[2]);
            match = true;
        }

        strSearch = strValue.match(/\d{1,2}:\d{1,2}:\d{1,2}/);
        if (strSearch != null) {
            // etc. 12:43:12
            var array = strSearch.toString().split(":");
            hour = this.MyParseInt(array[0]);
            min = this.MyParseInt(array[1]);
            sec = this.MyParseInt(array[2]);
            match = true;
        }
        strSearch = strValue.match(/\d{1,2}时\d{1,2}分\d{1,2}秒/);
        if (strSearch != null) {
            // etc.12时43分12秒 .
            strSearch = strSearch.toString();
            strSearch = strSearch.replace("时", ":");
            strSearch = strSearch.replace("分", ":");
            strSearch = strSearch.replace("秒", "");
            var array = strSearch.split(":");
            hour = this.MyParseInt(array[0]);
            min = this.MyParseInt(array[1]);
            sec = this.MyParseInt(array[2]);
            match = true;
        }
    }
    if (match) {
        if (year >= 100 && year < 1000) {
            year = year % 100;
            alert(year);
        }
        if (year < 100) {
            year = 1900 + year;
        }

        if (month > 12) {
            month = 12;
        }
        else if (month < 1) {
            month = 1;
        }

        if (day > 31) {
            day = 31;
        }
        else if (day < 1) {
            day = 1;
        }

        if (hour > 23) {
            hour = 23;
        }
        else if (hour < 0) {
            hour = 0;
        }

        if (min > 59) {
            min = 59;
        }
        else if (min < 0) {
            min = 0;
        }

        if (sec > 59) {
            sec = 59;
        }
        else if (sec < 0) {
            sec = 0;
        }
        result = new Date(year, month - 1, day, hour, min, sec);
    }
    else {
        var num = Date.parse(strValue);
        if (isNaN(num) == false)
            result = new Date(num);
    }
    //alert( result );
    return result;
};

//
// 将文本转换为固定长度的文本,不足长度则在前面补字符0
//
DCStringUtils.ToFixedLengthString= function (number, length) {
    var str = number.toString();
    if (str.length > length) {
        return str.substring(str.length - length, str.length - 1);
    }
    else if (str.length < length) {
        for (var iCount = str.length; iCount < length; iCount++) {
            str = "0" + str;
        }
    }
    return str;
};

//
// 格式化输出日期数据
//
DCStringUtils.FormatDateTime=function (dtmValue, vFormat) {
    if (dtmValue == null)
        return "";
    if (vFormat == "d") {
        vFormat = "yyyy-MM-dd";
    }
    else if (vFormat == "D") {
        vFormat = "yyyy年MM月dd日";
    }
    else if (vFormat == "f") {
        vFormat = "yyyy年MM月dd日 HH:mm";
    }
    else if (vFormat == "F") {
        vFormat = "yyyy年MM月dd日 HH:mm:ss";
    }
    else if (vFormat == "M") {
        vFormat = "MM月dd日";
    }
    else if (vFormat == "m") {
        vFormat = "MM-dd";
    }
    else if (vFormat == "t") {
        vFormat = "HH:mm";
    }
    else if (vFormat == "T") {
        vFormat = "HH:mm:ss";
    }
    else if (vFormat == "U") {
        vFormat = "yyyy年MM月dd日 HH:mm:ss";
    }

    var patterns = "yMdHhmst";
    var result = "";
    for (var index = 0; index < vFormat.length; index++) {
        var c = vFormat.charAt(index);
        if (patterns.indexOf(c) < 0) {
            result = result + c;
            continue;
        }
        var matchs = vFormat.length - index;
        //if( index == vFormat.length - 1 )
        {
            for (var index2 = index; index2 < vFormat.length; index2++) {
                var c2 = vFormat.charAt(index2);
                if (c2 != c) {
                    matchs = index2 - index;
                    break;
                }
            }
        }
        index = index + matchs - 1;
        if (c == "y") {
            var year = dtmValue.getFullYear();
            if (matchs == 1) {
                // y
                result = result + year.toString();
            }
            else {
                result = result + this.ToFixedLengthString(year, matchs);
            }
        }
        else if (c == "M") {
            var month = dtmValue.getMonth();
            // format Month 
            if (matchs == 4) {
                // MMMM
                var BigMonthNames = new Array(
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December");
                result = result + BigMonthNames[month];
            }
            else if (matchs == 3) {
                // MMM
                var SmallMonthNames = new Array(
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec");
                result = result + SmallMonthNames[month];
            }
            else if (matchs == 1) {
                month++;
                // M
                result = result + month.toString();
            }
            else {
                month++;
                result = result + this.ToFixedLengthString(month, matchs);
            }
        }
        else if (c == "d") {
            var day = dtmValue.getDay();
            if (matchs == 4) {
                // dddd
                var BigDayNames = new Array(
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday");
                result = result + BigDayNames[day];
            }
            else if (matchs == 3) {
                // ddd
                var SmallDayNames = new Array(
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat");
                result = result + SmallDayNames[day];
            }
            else if (matchs == 1) {
                // d
                result = result + dtmValue.getDate().toString();
            }
            else {
                result = result + this.ToFixedLengthString(dtmValue.getDate(), matchs);
            }
        }
        else if (c == "h") {
            var hour = dtmValue.getHours();
            hour = hour % 12;
            if (hour == 0)
                hour = 12;
            if (matchs == 1) {
                result = result = hour.toString();
            }
            else {
                result = result + this.ToFixedLengthString(hour, matchs);
            }
        }
        else if (c == "H") {
            //debugger ;
            var hour = dtmValue.getHours();
            if (matchs == 1) {
                result = result = hour.toString();
            }
            else {
                result = result + this.ToFixedLengthString(hour, matchs);
            }
        }
        else if (c == "m") {
            var min = dtmValue.getMinutes();
            if (matchs == 1) {
                result = result + min.toString();
            }
            else {
                result = result + this.ToFixedLengthString(min, matchs);
            }
        }
        else if (c == "s") {
            var sec = dtmValue.getSeconds();
            if (matchs == 1) {
                result = result + sec.toString();
            }
            else {
                result = result + this.ToFixedLengthString(sec, matchs);
            }
        }
        else if (c == "t") {
            var hour = dtmValue.getHours();
            if (matchs == 1) {
                if (hour < 12) {
                    result = result + "上";
                }
                else {
                    result = result + "下";
                }
            }
            else {
                if (hour < 12) {
                    result = result + "上午";
                }
                else {
                    result = result + "下午";
                }
            }
        } //else

    } //for
    return result;
};

//
// 将数值转换为中文大写文本
//
DCStringUtils.ToBigChineseNumber=function (number) {
    var numList = "零壹贰叁肆伍陆柒捌玖";
    var rmbList = "分角圆拾佰仟万拾佰仟亿拾佰仟万";
    var tempOutString = "";
    var flag = false;
    if (number < 0) {
        flag = true;
        number = -number;
    }

    if (number > 9999999999999.99)
        return "数值超出范围";
    //debugger ;

    //将小数转化为整数字符串 
    var tempNumber = Math.round(number * 100);
    var tempNumberString = tempNumber.toString();
    var tempNmberLength = tempNumberString.length;
    var i = 0;
    while (i < tempNmberLength) {
        var oneNumber = parseInt(tempNumberString.charAt(i));
        var oneNumberChar = numList.charAt(oneNumber);
        var oneNumberUnit = rmbList.charAt(tempNmberLength - i - 1);
        if (oneNumberChar != "零") {
            tempOutString += oneNumberChar + oneNumberUnit;
        }
        else {
            if (oneNumberUnit == "亿"
				|| oneNumberUnit == "万"
				|| oneNumberUnit == "圆"
				|| oneNumberUnit == "零") {
                while (this.StringEndsWith(tempOutString, "零")) {
                    //debugger ;
                    tempOutString = tempOutString.substr(0, tempOutString.length - 1);
                }
            }
            if (oneNumberUnit == "亿"
				|| (oneNumberUnit == "万" && !this.StringEndsWith(tempOutString, "亿"))
				|| oneNumberUnit == "圆") {
                tempOutString += oneNumberUnit;
            }
            else {
                var tempEnd = this.StringEndsWith(tempOutString, "亿");
                var zeroEnd = this.StringEndsWith(tempOutString, "零");
                if (tempOutString.length > 1) {
                    var zeroStart = this.StringStartsWith(
						tempOutString.substr(tempOutString.length - 2, 2), "零");
                    if (!zeroEnd && (zeroStart || !tempEnd))
                        tempOutString += oneNumberChar;
                }
                else {
                    if (!zeroEnd && !tempEnd)
                        tempOutString += oneNumberChar;
                }
            }
        }
        i += 1;
    }

    while (this.StringEndsWith(tempOutString, "零")) {
        tempOutString = tempOutString.substr(0, tempOutString.length - 1);
    }

    while (this.StringEndsWith(tempOutString, "圆")) {
        tempOutString = tempOutString + "整";
    }

    if (flag)
        tempOutString = "负" + tempOutString;

    return tempOutString;
};

//
// 删除文本两边的空白字符
//
DCStringUtils.TrimString = function (str) {
    if (str == null)
        return str;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c != 32 && c != 8 && c != 10 && c != 13) {
            break;
        }
    }
    for (var j = str.length; j > 0; j--) {
        var c = str.charCodeAt(j);
        if (c != 32 && c != 8 && c != 10 && c != 13) {
            break;
        }
    }
    if (i > j) return "";
    return str.substring(i, j);
};

//
// 判断文本是否是以指定的文本开头
//
DCStringUtils.startsWith = function (strText, strStart) {
    if (strText == null || strText.length == 0) {
        return false;
    }
    if (strStart == null || strStart.length == 0) {
        return true;
    }
    if (strText.length >= strStart.length) {
        var strText2 = strText.substr(0, strStart.length);
        return strText2 == strStart;
    }
    return false;
};

//
// 判断文本是否是以指定的文本结尾
//
DCStringUtils.endsWith = function (strText, strEnd) {
    if (strText == null || strText.length == 0) {
        return false;
    }
    if (strEnd == null || strEnd.length == 0) {
        return true;
    }
    if (strText.length >= strEnd.length) {
        var txt = strText.substr(strText.length - strEnd.length, strEnd.length);
        return txt == strEnd;
    }
    //alert( strText + " " + strEnd );
    return false;
};

//
// 过滤文本中的无效字符，只保留有效字符
//
DCStringUtils.FilterValue = function (text, chars) {
    var result = "";
    for (var index = 0; index < text.length; index++) {
        var c = text.charAt(index);
        if (chars.indexOf(c) >= 0) {
            result = result + c;
        }
    }
    return result;
};

//
// 为整数格式过滤用户输入的字符
//
DCStringUtils.FilterInputCharForInteger = function (e) {
    return this.FilterInputChar(e, "0123456789-,%");
};

//
// 为数值格式过滤用户输入的字符
//
DCStringUtils.FilterInputCharForNumeric = function (e) {
    return this.FilterInputChar(e, "0123456789-,.%");
};

//
// 过滤用户输入的字符
//
DCStringUtils.FilterInputChar = function (e, chars) {
    var keycode = window.event ? e.keyCode : e.which;
    //debugger;
    //    alert( keycode );
    if (keycode == 0) {
        return true;
    }
    for (var index = 0; index < chars.length; index++) {
        if (chars.charCodeAt(index) == keycode) {
            return true;
        }
    }
    if (this.isIE) {
        e.returnValue = false;
    }
    else {
        e.preventDefault();
    }
    return false;
};