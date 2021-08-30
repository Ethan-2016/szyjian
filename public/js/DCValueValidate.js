// DCWriter 的WEB控件使用的JS代码 , WLJ 2015-6-5
// 
//
//DCValueValidate函数，用于进行数据校验。
//DCValueValidate函数有两个参数，第一个参数为待校验的文本，第二个为校验设置，
//校验不通过返回校验的结果提示信息字符串，如果校验通过则返回null。
//
function DCValueValidate(valueWaitingForValidate, valueValidateStyleString) {

    //表示进行排除关键字判断的返回参数的结果
    var refexclude = null;

    //
    //对日期对象Date进行扩展，将Date转化为指定的字符串String
    //月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q)可以用1-2个占位符
    //年(y)可以用1-4个占位符，毫秒(S)只能用一个占位符（是1-3位数字）
    //例如 ：(new Date()).Format("yyyy-MM-dd HH:mm:ss.S")      ==> 2015-6-10 10:22:8.88
    //
    Date.prototype.Format = function(fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份 
            "d+": this.getDate(),                    //日 
            "H+": this.getHours(),                   //小时 
            "m+": this.getMinutes(),                 //分 
            "s+": this.getSeconds(),                 //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds()             //毫秒 
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    function trim() {
        return this.replace(/^\s+|\s+$/g, '');
    }

    function trimEnd() {
        return this.replace(/\s+$/, '');
    }

    function trimStart() {
        return this.replace(/^\s+/, '');
    }

    //
    //值类型枚举
    //
    var ValueTypeStyle = {
        // 文本
        Text: "Text",
        // 整数
        Integer: "Integer",
        // 数值
        Numeric: "Numeric",
        // 日期
        Date: "Date",
        // 时间
        Time: "Time",
        // 日期时间
        DateTime: "DateTime",
        // 正则表达式
        RegExpress: "RegExpress"
    }

    //
    // 根据文本编码格式获得字节数
    // 参数 待编码的字符串str   编码方式 charset utf-8, utf-16   返回值 total
    //
    function GetByteCount(str, charset) {
        var total = 0, charCode;
        charset = charset != null ? charset.toLowerCase() : '';
        switch (charset) {
            case "utf-16":
                for (var i = 0; i < str.length; i++) {
                    charCode = str.charCodeAt(i);
                    if (charCode <= 0xffff) {
                        total += 2;
                    }
                    else {
                        total += 4;
                    }
                }
                break;
            case "utf-8":
                for (var i = 0; i < str.length; i++) {
                    charCode = str.charCodeAt(i);
                    if (charCode <= 0x007f) {
                        total += 1;
                    }
                    else if (charCode <= 0x07ff) {
                        total += 2;
                    }
                    else if (charCode <= 0xffff) {
                        total += 3;
                    }
                    else {
                        total += 4;
                    }
                }
                break;
            default:
                for (var i = 0; i < str.length; i++) {
                    charCode = str.charCodeAt(i);
                    if (charCode < 0x0100) {
                        total += 1;
                    }
                    else {
                        total += 2;
                    }
                }
                break;
        }
        return total;
    }

    function GetTextlength(txt) {
        var isNullTxt = (txt == null || txt.toString() == "") ? true : false;
        if (isNullTxt != false) {
            return 0;
        }
        if (Binarylength) {
            //return EncodingForGetBytes.GetByteCount(txt);
            return GetByteCount(txt, null);
        }
        else {
            return txt.length;
        }
    }

    //
    // 进行违禁关键字的检查
    // <param name="text">文本</param>
    // <param name="excludeKeywords">违禁关键字</param>
    // <param name="matchItem">被选中的项目</param>
    // <returns>检查是否通过</returns>
    //
    function CheckExecludeKeywords(text, excludeKeywords, refexclude) {
        if (text.replace(/^\s+|\s+$/g, '').length == 0) {
            // 文本为空，不进行判断
            return true;
        }
        if (excludeKeywords.length > 0) {
            var items = new Array();
            var iCount
            items = excludeKeywords.split(',');
            for (iCount = 0; iCount < items.length; iCount++) {
                var item = items[iCount];
                if (text.indexOf(item) >= 0) {
                    refexclude = item;
                    return false;
                }
            }
        }
        return true;
    }

    /**
    * @param text 键值对形式的字符串
    * @return 返回键值对的数组
    */
    function ParseAttributeString(text) {
        if (text == null || text == undefined || text == '') {
            return null;
        }
        var resultArray = new Array()//结果数组

        while (text.length > 0) {
            var newName = ""; //键
            var newValue = ""; //值
            var index = text.indexOf(":");
            if (index > 0) {
                newName = text.substring(0, index);
                text = text.substring(index + 1);
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
            else {
                newName = text.replace(/^\s+|\s+$/g, '');
                text = "";
            }
            //alert(newName);
            //alert(newValue);
            resultArray.push(newName);
            resultArray.push(newValue);
        }
        return resultArray;
    }

    var ValueName = null;   //数据的名称
    var Value = null;    //数值
    var Required = false; // 必填数据
    var ValueType = ValueTypeStyle.Text; // 数值类型
    var Binarylength = false; // 进行的是二进制长度判断
    var Maxlength = 0; // 最大文本长度
    var Minlength = 0; // 最小文本长度
    var CheckMaxValue = false; // 检查数值或者日期值的最大值
    var CheckMinValue = false; // 检查数值或者日期值的最小值
    var MaxValue = 0.0; // 数值最大值
    var MinValue = 0.0; // 数值最小值
    //
    var CheckDecimalDigits = false; // 是否需要判断小数位数
    var MaxDecimalDigits = 0; // 小数最大位数
    // 表示为空的日期数值
    // javascript中月是0-11表示十二个月的
    var NullDateTime = new Date(1980, 0, 1, 0, 0, 0);
    var DateTimeMaxValue = NullDateTime;  // 最大时间日期值
    var DateTimeMinValue = NullDateTime; // 最小时间日期值
    var Range = null; // 数据取值范围
    var RegExpression = null; // 正则表达式文字
    // 允许包含的关键字，各个关键字之间用英文逗号分开。
    // 如果内容为某个允许包含的关键字，则无需做其他验证项而验证通过。
    var IncludeKeywords = null;
    var ExcludeKeywords = null; // 排除关键字
    var CustomMessage = null; // 自定义提示信息
    var ContentVersion = -1; // 进行数据校验时的相关的内容版本号
    //
    var RequiredInvalidateFlag = false; // 由于必填项而导致的数据校验无效的标记
    var Message = null; // 验证结果

    //    if (valueWaitingForValidate == null || valueWaitingForValidate == ""
    //    || valueValidateStyleString == null || valueValidateStyleString == "") {
    //        return null;
    //    }

    var validateStyleIsNull = false;
    if (valueValidateStyleString == null || valueValidateStyleString == "") {
        validateStyleIsNull = true;
    }

    var toBoolean = function (v) {
        return v == "True" || v == "true" || v == "TRUE";
    };

    //待校验的文本
    var Value = valueWaitingForValidate;

    if (validateStyleIsNull == false) {
        //检测待校验的校验设置
        var valueValidateStyleItems = new Array();
        valueValidateStyleItems = ParseAttributeString(valueValidateStyleString);

        //待校验的文本
        // var Value = valueWaitingForValidate;//20150630 WLJ

        //校验设置
        for (var iCount = 0; iCount < valueValidateStyleItems.length; iCount += 2) {
            var vName = valueValidateStyleItems[iCount];
            var vValue = (iCount + 1 >= valueValidateStyleItems.length) ? "" : valueValidateStyleItems[iCount + 1];
            var casestr = valueValidateStyleItems[iCount].toString();
            switch (casestr) {
                case "Required":
                    Required = toBoolean(vValue);
                    break;
                case "ValueType":
                    ValueType = vValue;
                    break;
                case "BinaryLength":
                    Binarylength = parseInt(vValue);
                    break;
                case "MaxLength":
                    Maxlength = parseInt(vValue);
                    break;
                case "MinLength":
                    Minlength = parseInt(vValue);
                    break;
                case "CheckMaxValue":
                    CheckMaxValue = toBoolean(vValue);
                    break;
                case "CheckMinValue":
                    CheckMinValue = toBoolean(vValue);
                    break;
                case "MaxValue":
                    MaxValue = parseFloat(vValue);
                    break;
                case "MinValue":
                    MinValue = parseFloat(vValue);
                    break;
                case "CheckDecimalDigits":
                    CheckDecimalDigits = toBoolean(vValue);
                    break;
                case "MaxDecimalDigits":
                    MaxDecimalDigits = parseInt(vValue);
                    break;
                case "DateTimeMaxValue":
                    //var datetimemaxvalue = valueValidateStyleItems[parseFloat(validateValue) + 1];
                    var datetimemaxvalue = vValue.replace(/"/g, '');
                    datetimemaxvalue = datetimemaxvalue.toString().replace(/'/g, '');
                    datetimemaxvalue = datetimemaxvalue.toString().replace(/-/g, '/');
                    DateTimeMaxValue = new Date(Date.parse(datetimemaxvalue));
                    //DateTimeMaxValue = valueValidateStyleItems[parseFloat(validateValue) + 1];
                    break;
                case "DateTimeMinValue":
                    //var datetimeminvalue = valueValidateStyleItems[parseFloat(validateValue) + 1]
                    var datetimeminvalue = vValue.replace(/"/g, '');
                    datetimeminvalue = datetimeminvalue.toString().replace(/'/g, '');
                    datetimeminvalue = datetimeminvalue.toString().replace(/-/g, '/');
                    DateTimeMinValue = new Date(Date.parse(datetimeminvalue));
                    //DateTimeMinValue = valueValidateStyleItems[parseFloat(validateValue) + 1];
                    break;
                case "RegExpression":
                    RegExpression = vValue;
                    break;
                case "CustomMessage":
                    CustomMessage = vValue;
                default:
                    break;
            }
        }
    }

    //RequiredInvalidateFlag = false;
    //Message = null;
    //CustomMessage = null;

    var cm = CustomMessage;

    if (cm == null || cm.replace(/^\s+|\s+$/g, '').length == 0) {
        cm = null;
    }
    var isNullValue = false;
    if (Value == null || Value == "") {
        isNullValue = true;
    }
    else {
        var txt = Value.toString();
        var txtResult = (txt == null || txt == "") ? true : false;
        if (txtResult) {
            isNullValue = true;
        }
    }
    if (Required) {
        // 执行数据是否为空的判断
        if (isNullValue) {
            Message = cm != null ? cm : document.GetDCWriterString("JS_CanNotEmpty");
            RequiredInvalidateFlag = true;
            return Message;
        }
    }
    else {
        if (isNullValue) {
            // 数据为空而且允许为空,则不进行后续判断
            //return true;
            return null;
        }
    }
    var isFalse = (IncludeKeywords == null || IncludeKeywords == "") ? true : false;
    if (isNullValue == false && isFalse == false) {
        //数组
        //string[] items =  IncludeKeywords.split(',');
        var items = new Array();
        var item;
        items = IncludeKeywords.split(',');
        var txt = Value.toString();
        for (item in items) {
            if (items[item] == txt) {
                // 匹配某个包含关键字，则验证通过。
                return null;
            }
        }
    }
    switch (ValueType) { 
        case ValueTypeStyle.Text:
            {
                var txt = Value.toString();
                if (CheckMaxValue && Maxlength > 0) {
                    if (txt != null && GetTextlength(txt) > Maxlength) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_TextTooLong_Maxlength", Maxlength);
                        return Message;
                    }
                }
                if (CheckMinValue && Minlength > 0) {
                    if (txt != null && GetTextlength(txt) < Minlength) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_TextTooShort_MinLength", Minlength); 
                        return Message;
                    }
                }
                if (Range != null && Range.length > 0) {
                    var find = true;
                    var items = new Array();
                    var item;
                    items = Range.split(',');
                    for (item in items) {
                        //debugger;
                        find = false;
                        if (txt.localeCompare(items[item].replace(/^\s+|\s+$/g, '')) == 0) {
                            find = true;
                            break;
                        }
                    }
                    if (find == false) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_NotInclude") + Range;
                        return Message;
                    }
                }
            }
            break;
        case ValueTypeStyle.Numeric:
        case ValueTypeStyle.Integer:
            {
                var v = Number.NaN;
                if (typeof (Value) == "number") {
                    v = parseFloat(Value);
                }
                else {
                    var result = false;
                    if (ValueType == ValueTypeStyle.Numeric) {
                        result = isNaN(Value.toString()) ? false : true;
                        if (result == false) {
                            Message = cm != null ? cm : document.GetDCWriterString("JS_MustBeNumber");
                            return Message;
                        }
                        else {
                            v = parseFloat(Value.toString());
                        }
                    }
                    else {
                        result = isNaN(Value.toString()) ? false : true;
                        if (result == false) {
                            Message = cm != null ? cm : document.GetDCWriterString("JS_MustBeNumber");
                            return Message;
                        }
                        else {
                            if (parseFloat(Value.toString()) == parseInt(Value.toString())) {
                                v = parseInt(Value.toString());
                            }
                            else {
                                Message = cm != null ? cm : document.GetDCWriterString("JS_MustBeInteger");
                                return Message;
                            }
                        }
                    }
                }
                if (MaxValue != MinValue) {
                    if (CheckMaxValue && isNaN(MaxValue) == false) {
                        if (v > MaxValue) {
                            Message = cm != null ? cm : (document.GetDCWriterString("JS_ExceedMaxValue") + MaxValue);
                            return Message;
                        }
                    }
                    if (CheckMinValue && isNaN(MinValue) == false) {
                        if (v < MinValue) {
                            Message = cm != null ? cm : document.GetDCWriterString("JS_UnderMinValue") + MinValue;
                            return Message;
                        }
                    }
                }
                if (CheckDecimalDigits) {
                    var value = Value.toString();
                    if (value.indexOf('.') > -1) //是小数进行判断
                    {
                        var digitslength = value.length - value.indexOf('.') - 1;
                        if (digitslength > MaxDecimalDigits) {
                            Message = cm != null ? cm : document.GetDCWriterString("JS_TooManyDigits") + MaxDecimalDigits;
                            return Message;
                        }
                    }
                }
                if (Range != null && Range.length > 0) {
                    var find = true;
                    var item;
                    var items = new Array();
                    items = Range.split(',');
                    for (item in items) {
                        find = false;
                        var index = items[item].indexOf('-');
                        if (index > 0) {
                            var min = 0;
                            var max = 0;
                            min = parseFloat(items[item].substring(0, index))
                            var resultMin = isNaN(min) ? false : true;
                            max = parseFloat(items[item].substring(0, index + 1))
                            var resultMax = isNaN(max) ? false : true;
                            if (resultMin && resultMax) {
                                if (v >= min && v <= max) {
                                    find = true;
                                    break;
                                }
                            }
                        }
                        else {
                            var v2 = Number.NaN;
                            v2 = parseFloat(items[item]);
                            var resultv2 = isNaN(v2) ? false : true;
                            if (resultv2) {
                                if (v2 == v) {
                                    find = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (find == false) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_NotInclude") + Range;
                        return Message;
                    }
                }
            }
            break;
      case ValueTypeStyle.Date:
            {
                //toLocaleString()根据本地时间格式，把 Date 对象转换为字符串。
                // toLocaleDateString()根据本地时间格式，把 Date 对象的日期部分转换为字符串。
                var dtm = new Date(Date.parse(Value.toString().replace(/\s/g, " ")));
                var result = isNaN(Date.parse(dtm)) ? false : true;
                if (result == true) {
                    dtm = new Date(Date.parse(Value.toString().replace(/\s/g, " "))).toLocaleDateString();
                }
                if (result == false) {
                    Message = cm != null ? cm : document.GetDCWriterString("JS_MustBeDate");
                    return Message;
                }
                if (CheckMaxValue) {
                    var max = DateTimeMaxValue.toLocaleDateString();
                    if (Date.parse(dtm.toString().replace("下午", " ")) > Date.parse(max.toString().replace("下午", " "))) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_ExceedMaxValue") + DateTimeMaxValue.Format("yyyy-MM-dd").toString();
                        return Message;
                    }
                }
                if (CheckMinValue) {
                    //var min = DateTimeMinValue.getFullYear() + "-" + DateTimeMinValue.getMonth() + "-" + DateTimeMinValue.getDate();
                    var min = DateTimeMinValue.toLocaleDateString();
                    if (Date.parse(dtm.toString().replace("下午", " ")) < Date.parse(min.toString().replace("下午", " "))) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_UnderMinValue") + DateTimeMinValue.Format("yyyy-MM-dd").toString();
                        return Message;
                    }
                }
            }
            break;
        case ValueTypeStyle.Time:
            {
                // xuyiming 20191012 修复BS编辑器时间输入域设置最大最小范围不验证
                //toLocaleTimeString()根据本地时间格式，把 Date 对象的时间部分转换为字符串。
                var dtm = new Date(Date.parse("1900/01/01 "+Value.toString().replace(/\s/g, " ")));
                var result = isNaN(Date.parse(dtm)) ? false : true;
                // if (result == true) {
                //     dtm = new Date(Date.parse(Value.toString().replace(/\s/g, " "))).toLocaleTimeString();
                // }
                if (result == false) {
                    Message = cm != null ? cm : document.GetDCWriterString("JS_MustBeDate");
                    return Message;
                }
                if (DateTimeMaxValue) {
                    //var max = DateTimeMaxValue.getHours() * 60 * 60 * 1000 + DateTimeMaxValue.getMinutes() * 60 * 1000 + DateTimeMaxValue.getSeconds() * 1000;
                    var max = DateTimeMaxValue.toLocaleTimeString();
                    // if (Date.parse(dtm.toString().replace("下午", " ")) > Date.parse(max.toString().replace("下午", " "))) {
                    if (dtm.getTime() > DateTimeMaxValue.getTime()) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_ExceedMaxValue") + DateTimeMaxValue.Format("HH:mm:ss");
                        return Message;
                    }
                }
                if (DateTimeMinValue) {
                    //var min = DateTimeMinValue.TimeOfDay;
                    //var min = DateTimeMinValue.getHours() * 60 * 60 * 1000 + DateTimeMinValue.getMinutes() * 60 * 1000 + DateTimeMinValue.getSeconds() * 1000;
                    var min = DateTimeMinValue.toLocaleTimeString();
                    // if (Date.parse(dtm.toString().replace("下午", " ")) < Date.parse(min.toString().replace("下午", " "))) {
                    if (dtm.getTime() < DateTimeMinValue.getTime()) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_UnderMinValue") + DateTimeMinValue.Format("HH:mm:ss");
                        return Message;
                    }
                }
            }
            break;
        case ValueTypeStyle.DateTime:
            {
                // xuyiming 20190927 修复BS编辑器日期输入域设置最大最小范围不验证
                //toLocaleString()根据本地时间格式，把 Date 对象转换为字符串。
                var dtm = new Date(Date.parse(Value.toString().replace(/\s/g, " ")));
                var result = isNaN(Date.parse(dtm)) ? false : true;
                // if (result == true) {
                //     dtm = new Date(Date.parse(Value.toString().replace(/\s/g, " "))).toLocaleString();
                // }
                if (result == false) {
                    Message = cm != null ? cm : document.GetDCWriterString("JS_MustBeDate");
                    return Message;
                }
                if (CheckMaxValue) {
                    var max = DateTimeMaxValue.toLocaleString();
                    // if (Date.parse(dtm.toString().replace("下午", " ")) > Date.parse(max.toString().replace("下午", " "))) {
                    if (dtm.getTime() > DateTimeMaxValue.getTime()) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_ExceedMaxValue") + DateTimeMaxValue.Format("yyyy-MM-dd HH:mm:ss").toString();
                        return Message;
                    }
                }
                if (CheckMinValue) {
                    var min = DateTimeMinValue.toLocaleString();
                    // if (Date.parse(dtm.toString().replace("下午", " ")) < Date.parse(min.toString().replace("下午", " "))) {
                    if (dtm.getTime() < DateTimeMinValue.getTime()) {
                        Message = cm != null ? cm : document.GetDCWriterString("JS_UnderMinValue") + DateTimeMinValue.Format("yyyy-MM-dd HH:mm:ss").toString();
                        return Message;
                    }
                }
            }
            break;
        case ValueTypeStyle.RegExpress:
            {
                if (isNullValue == false) {
                    // 数据不为空，进行判断
                    // 进行正则表达式匹配
                    var nullorNot = (RegExpression == null || RegExpression == "") ? true : false;
                    if (nullorNot == false) {
                        var txt = Value.toString();
                        var reg = new RegExp(RegExpression);
                        if (reg.test(txt) == false) {
                            Message = cm != null ? cm : "必须符合“ " + RegExpression + " ”格式";
                            return Message;
                        }
                    }
                }
            }
            break;
    }

    var valueIsNull = (ExcludeKeywords == null || ExcludeKeywords == "") ? true : false;
    if (isNullValue == false && valueIsNull == false) {
        // 进行排除关键字判断
        if (CheckExecludeKeywords(Value.toString, ExcludeKeywords, refexclude) == false) {
            Message = cm != null ? cm : document.GetDCWriterString("JS_Exclude") + item;
            return Message;
        }
    }
    return null;
}


//测试用例
function DCValueValidate_MyDebug() {
    //var txt = DCValueValidate("2015/3/3 23:33:32", '');    
    //var txt = DCValueValidate("", 'Required:False;ValueType:Date;BinaryLength:False;MaxLength:0;MinLength:0;CheckMaxValue:False;CheckMinValue:False;MaxValue:0;MinValue:0;CheckDecimalDigits:False;MaxDecimalDigits:0;DateTimeMaxValue:"1980-01-01 00:00:00";DateTimeMinValue:"1980-01-01 00:00:00"');
    var txt = DCValueValidate("", 'ValueType:Date;MaxLength:0;MinLength:0;CheckMaxValue:False;CheckMinValue:False;MaxValue:0;MinValue:0;CheckDecimalDigits:False;MaxDecimalDigits:0;DateTimeMaxValue:"1980-01-01 00:00:00";DateTimeMinValue:"1980-01-01 00:00:00"');
    //var txt = DCValueValidate("", '');
    alert(txt);
}

//DCValueValidate_MyDebug();