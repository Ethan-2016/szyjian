//**************************************************************************************************************
//**************************************************************************************************************
// 数值表达式管理器 袁永福到此一游
//**************************************************************************************************************
//**************************************************************************************************************

var DCWriterExpressionManager = new Object();
//**************************************************************************************************************
// 启动数值表达式管理器
DCWriterExpressionManager.Start = function () {
    // 已经执行过表达式函数的名称列表
    DCWriterExpressionManager.FunctionStackCount = 0;
    // 重置状态
    var clearState = function () {
        DCWriterExpressionManager.FunctionStackCount = 0;
    };
    // 定期重置状态,防止程序异常而导致的状态错误。
    window.setInterval(clearState, 1000);
};

// 为执行表达式获得单选框、复选框元素数据
DCWriterExpressionManager.GetCheckRadioBoxElementValueForExpression = function (name, forNumerice) {
    if (name == null) {
        return null;
    }
    var strResult = "";
    var numResult = 0;
    var elements = document.getElementsByName(name);
    if (elements.length == 0) {
        //wyc20210414：有可能引用的是元素的ID
        var element = document.getElementById(name);
        if (element.nodeName == "INPUT" && element.checked == true) {
            strResult = element.getAttribute("dc_checkedvalue");
            numResult = parseFloat(element.getAttribute("dc_checkedvalue"));
        }
    }
    for (var iCount = 0; iCount < elements.length; iCount++) {
        var element = elements[iCount];
        if (element.nodeName == "INPUT" && element.checked == true) {
            
            if (forNumerice == true) {
                var v = parseFloat(element.getAttribute("dc_checkedvalue"));
                if (isNaN(v) == false) {
                    numResult = numResult + v;
                }
            }
            else {
                var v = element.getAttribute("dc_checkedvalue");
                if (v != null && v.length > 0) {
                    if (strResult.length > 0) {
                        strResult = strResult + ",";
                    }
                    strResult = strResult + v;
                }
            }
        } //if
    } //for
    if (forNumerice) {
        //console.log(name + ":" + numResult.toString());
        return numResult;
    }
    else {
        return strResult;
    }
};

//**************************************************************************************************************
// 获得元素文本值
DCWriterExpressionManager.GetElementTextForExpression = function (id) {
    if (id == null) {
        return null;
    }
    var element = null;
    if (id.nodeName) {
        if (id.nodeName == "#text") {
            // 输入为一个HTML纯文本元素
            return id.nodeValue;
        }
        // 输入的为一个HTML元素
        element = id;
    }
    else {
        // 输入的为一个ID号
        element = document.getElementById(id);
    }
    if (element == null) {
        return null;
    }
    if (element.tagName == "TD") {
        //        for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        //            var node = element.childNodes[iCount];
        //             
        //        }
        return DCDomTools.GetInnerText(element);
    }
    else if (element.tagName == "SELECT") {
        if (element.selectedIndex >= 0) {
            var opt = element.options[element.selectedIndex];
            var txt = opt.text;
            if (txt == null || txt.length == 0) {
                txt = opt.value;
            }
            return txt;
        }
        else {
            return "";
        }
    }
    else if (element.tagName == "INPUT") {
        // 处理单选框、复选框
        if (element.type == "checkbox" || element.type == "radio") {
            if (element.checked == true) {
                var result = element.getAttribute("value");
                if (result != null && result.length > 0) {
                    return result;
                }
                result = element.getAttribute("dc_caption");
                if (result != null && result.length > 0) {
                    return result;
                }
            }
            else {
                return "";
            }
        }
        return element.value;
    }
    else if (element.tagName == "SELECT"
        || element.tagName == "TEXTAREA") {
        return element.value;
    }
    var result = "";
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.nodeName == "#text") {
            result = result + node.nodeValue;
        }
        else if (node.getAttribute && node.getAttribute("dcignore") == "1") {
            // 忽略掉的元素
        }
        else {
            result = result + DCWriterControllerEditor.GetElementText(node);
        }
    } //for
    return result;
    //return element.innerText;
};
//**************************************************************************************************************
// 获得元素InnerValue值
DCWriterExpressionManager.GetElementInnerValueForExpression = function (id) {
    var element = document.getElementById(id);
    if (element == null) {
        return null;
    }
    if (element.tagName == "TD") {
        return DCDomTools.GetInnerText(element);
    }
    else if (element.tagName == "INPUT") {
        // 处理单选框、复选框
        if (element.type == "checkbox" || element.type == "radio") {
            if (element.checked == true) {
                var result = element.getAttribute("value");
                if (result != null && result.length > 0) {
                    return result;
                }
                result = element.getAttribute("dc_caption");
                if (result != null && result.length > 0) {
                    return result;
                }
            }
            else {
                return null;
            }
        }
        if (DCInputFieldManager.IsInputFieldElement(element) == true) {
            return element.getAttribute("dc_innervalue");
        } else {
            return element.value;
        }
    }
    else if (element.tagName == "SELECT"
        || element.tagName == "TEXTAREA") {
        var v = element.value;
        //alert(v);
        return v;
    }
    if (DCInputFieldManager.IsInputFieldElement(element)) {
        var innerValue = element.getAttribute("dc_innervalue");
        if (innerValue != null && innerValue.length > 0) {
            var v = innerValue;
            if (v != null) {
                return v;
            }
        }
    }
    var result = "";
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.nodeName == "#text") {
            result = result + node.nodeValue;
        }
        else if (node.getAttribute && node.getAttribute("dcignore") != "1") {
            result = result + DCWriterControllerEditor.GetElementText(node);
        }
    } //for
    return result;
};
//**************************************************************************************************************
// 获得元素数值值
DCWriterExpressionManager.GetElementNumericValueForExpression = function (id) {
    var element = document.getElementById(id);
    if (element == null) {
        return NaN;
    }
    if (element.tagName == "TD") {
        return parseFloat(DCDomTools.GetInnerText(element));
    }
    else if (element.tagName == "INPUT") {
        // 处理单选框、复选框
        if (element.type == "checkbox" || element.type == "radio") {
            if (element.checked == true) {
                var result = element.getAttribute("value");
                if (result != null && result.length > 0) {
                    return parseFloat(result);
                }
                result = element.getAttribute("dc_caption");
                if (result != null && result.length > 0) {
                    return parseFloat(result);
                }
            }
            else {
                return NaN;
            }
        }
        return parseFloat(element.value);
    }
    else if (element.tagName == "SELECT"
        || element.tagName == "TEXTAREA") {
        var v = element.value;
        //alert(v);
        return parseFloat(v);
    }
    if (DCInputFieldManager.IsInputFieldElement(element)) {
        var innerValue = element.getAttribute("dc_innervalue");
        if (innerValue != null && innerValue.length > 0) {
            var v = parseFloat(innerValue);
            if (isNaN(v) == false) {
                // 如果成功转换为数字，则返回。
                return v;
            }
        }
    }
    var result = "";
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.nodeName == "#text") {
            result = result + node.nodeValue;
        }
        else if (node.getAttribute && node.getAttribute("dcignore") != "1") {
            result = result + DCWriterControllerEditor.GetElementText(node);
        }
    } //for
    // 转换文本内容为数字
    return parseFloat(result);
};
//**************************************************************************************************************
// 试图执行相关的表达式
DCWriterExpressionManager.ExecuteEffectExpression = function (element) {
    if (DCWriterExpressionManager.FunctionStackCount > 5) {
        // 执行的堆栈层数超过5，则认为是递归，退出
        return;
    }
    if (document.body == null) {
        var a = "";
    }
    // 是否为调试模式
    var debugMode = document.body.getAttribute("debugmode") == "true";
    DCWriterExpressionManager.FunctionStackCount++;
    var names = element.getAttribute("effectexpression");
    if (names != null && names.length > 0) {
        var items = names.split(',');
        for (var iCount = 0; iCount < items.length; iCount++) {
            var item = items[iCount];
            var f = document.body[item];
            if (typeof (f) == "undefined") {
                // 函数未定义,出现错误
                if (DCWriterExpressionManager.debugMode == true) {
                    //alert(windows.DCWriterStrings.JS_NotDefinedFunction + item);
                    if (document.WriterControl) {
                        var eventObject = new Object();
                        eventObject.Message = windows.DCWriterStrings.JS_NotDefinedFunction + item;
                        eventObject.State = document.WriterControl.ErrorInfo.Error;
                        document.WriterControl.MessageHandler(eventObject);
                    }
                }
            }
            else {
                f();
            }
        } //for
    } //if
    DCWriterExpressionManager.FunctionStackCount--;
};
//**************************************************************************************************************
// 试图执行文档中所有的表达式
DCWriterExpressionManager.ExecuteAllExpression = function () {
    DCWriterExpressionManager.ExecuteEffectExpression(document.body);
};
//**************************************************************************************************************
// 设置表达式运算结果
DCWriterExpressionManager.SetExpressionResult = function (id, result) {
    if (result == null) {
        result = "";
    }
    else {
        result = result.toString();
    }

    var element = document.getElementById(id);
    if (element != null) {
        var dctype = element.getAttribute("dctype");
        if (element.tagName == "INPUT"
            || element.tagName == "SELECT"
            || element.tagName == "TEXTAREA") {
            //判断单选框并选中 2019-06-10 hulijun
            //if (element.getAttribute("dctype") == "XTextRadioBoxElement" && result.toLowerCase() == "true") {
            //    element.checked = true;
            //    $(element).data('waschecked', false);
            //    DCWriterControllerEditor.HandleCheckedChanged(element);//触发额外处理的逻辑
            //} else if (element.getAttribute("dctype") == "XTextRadioBoxElement" && result.toLowerCase() == "false") {
            //    element.checked = false;
            //} else {
            //    element.value = result;
            //}
            //重写判断逻辑 wyc20201209
            if ((dctype == "XTextRadioBoxElement" || dctype == "XTextCheckBoxElement") &&
                (result === true || result === false || result == "true" || result == "false")) {
                var checked = result === true || result == "true" ? true : false;
                DCWriterControllerEditor.SetElementCheckedByID(null, checked, element);
                if (element.getAttribute("dc_valueexpression") != null) {
                    return;//避免反复循环调用
                }
            } else {
                element.value = result;
            }
        }
        else if (element.tagName == "TD"
            //&& element.childNodes.length == 1 && element.firstChild.nodeName == "P" 
            /*&& element.firstChild.firstChild.nodeName == "BR"*/) {
            //判断单元格内不能有其它元素，才能直接写单元格的TEXT 伍贻超20190621
            //判断若单元格内只有一个P且P内只有一个BR，则代表当前单元格为空内容，可以按旧版逻辑直接写值
            if (element.firstChild != null && element.firstChild.nodeName == "P") {
                DCDomTools.SetInnerText(element.firstChild, result);
            }
            else {
                DCDomTools.SetInnerText(element, result);
            }              
        }
        
        else {
            DCInputFieldManager.SetCurrentInputFieldValue(result, result, true, element, true);
        }
        var targetExpress = element.getAttribute("effectexpression");
        if (targetExpress != null && targetExpress.length > 0) {
            var tf = document.body[targetExpress];
            if (typeof tf == "function") {
                tf();
            }
        }
    }
};
//**************************************************************************************************************
// 设置表达式运算结果来设置目标元素的可见性
DCWriterExpressionManager.SetExpressionVisibleResult = function (id, result) {
    var bv = true;
    if (result == null) {
        bv = true;
    }
    else {
        bv = new Boolean(result);
    }
    var element = document.getElementById(id);
    if (element != null) {
        if (bv == true) {
            if ($(element).is(':hidden')) {
                if (element.nodeName == "TR") {
                    element.style.display = "";
                } else {
                    element.style.display = "initial";
                }
                //级联保存 2019-03-29 hulijun
                element.setAttribute("dc_visible", "true")
                //DCDomTools.FlashElement(element, 7, "blue");
            }
        }
        else {
            if ($(element).is(':visible')) {
                element.style.display = "none";
                element.setAttribute("dc_visible","false")
            }
        }
    }
};

//wyc20210108 设置表达式运算结果来设置目标元素的打印时可见性
DCWriterExpressionManager.SetExpressionPrintVisibleResult = function (id, result) {
    var bv = true;
    if (result == null) {
        bv = true;
    }
    else {
        bv = new Boolean(result);
    }
    var element = document.getElementById(id);
    if (element != null) {
        if (bv == true) {
            element.setAttribute("dc_printvisibility", "Visible");
        }
        else {
            element.setAttribute("dc_printvisibility", "None");
        }
    }
};