// 输入域元素处理JS
// 袁永福到此一游 2015-7-20

var DCInputFieldManager = new Object();


//下拉菜单按点击时间排序变量
var clickTime = 0;
var clickTimeArr = [];
// 当前获取焦点的输入域
var FocusElement;
//WYC20191105：下拉框采用的字体和字号
DCInputFieldManager.FontName = "";
DCInputFieldManager.FontSize = "";

// 简单级联和可见性表达式
// inputElement 插入的输入域
// 徐逸铭 20190522
DCInputFieldManager.AddCascade = function (inputElement) {
    var defaulteventexpression = inputElement.getAttribute("dc_defaulteventexpression") || "";
    var visibleexpression = inputElement.getAttribute("dc_visibleexpression") || ""; //[id]='值' Find
    if (defaulteventexpression.toLowerCase().indexOf("value=") >= 0) {//简单级联
        var text = defaulteventexpression.substring(7, defaulteventexpression.length - 1); //value='值'
        var inputElement_id = inputElement.getAttribute("id");
        $("#" + inputElement_id).bind("DOMNodeInserted", function () {
            var nextInput = $(this).next();
            //var str = $(this).find("span:nth-child(1)").text() + text + $(this).find("span:nth-child(2)").text();
            if (DCInputFieldManager.GetFieldText(inputElement) == text) {
                nextInput.attr("style", "");
                nextInput.attr("dc_visible", "true");
            }
            else {
                nextInput.hide().attr("dc_visible", "false");
            }
        })
    }
    if (visibleexpression != "") {//可见性表达式
        var next_index = visibleexpression.indexOf("]");
        var prev_index = visibleexpression.indexOf("[");
        var id = visibleexpression.substring(prev_index + 1, next_index);
        var needChangeInput = $("#" + id);
        if (visibleexpression.slice(0, 4).toLowerCase() != "find" && visibleexpression.slice(0, 2).toLowerCase() != "if") {//[id] = '值'
            var val = visibleexpression.split("=")[1].substring(1, visibleexpression.split("=")[1].length - 1);
            needChangeInput.bind("DOMNodeInserted", function () {
                if ($(this).attr("dc_innervalue") == val) {
                    inputElement.setAttribute("style", "");
                    inputElement.setAttribute("dc_visible", "true");
                }
                else {
                    inputElement.style.display = "none";
                    inputElement.setAttribute("dc_visible", "false");
                }
            })

        } else {

        }
    }
}

//@method 移动输入焦点到指定地点
//@param sWhere 要移动的目标,可选值有beforeBegin,afterBegin,beforeEnd,afterEnd
//@param element 要移动的元素对象
//@returns true:完成了操作，移动了插入点位置。false:没有完成操作。
DCInputFieldManager.FocusAdjacent = function (sWhere, element) {
    if (element == null) {
        return false;
    }
    if (sWhere != null) {
        sWhere = sWhere.toLowerCase();
    }
    if (sWhere == "afterend") {
        DCDomTools.MoveCaretToEnd(element);
        return true;
    }
    else if (sWhere == "beforebegin") {
        // DCDomTools.MoveCaretTo(element);
        DCDomTools.MoveCaretToIndex(element, 0);
        return true;
    }
    else {
        if (element.nodeName == "SELECT") {
            //下拉列表
            if (element.focus) {
                element.focus();
            }
            if (element.select) {
                element.select();
            }
            if (element.setActive) {
                element.setActive();
            }
            return true;
        }
        else if (element.nodeName == "INPUT"
            && (element.type == "checkbox"
                || element.type == "radio"
                || element.type == "button"
                || element.type == "submit")) {
            // 单选框/复选框/按钮
            if (element.focus) {
                element.focus();
            }
            if (element.select) {
                element.select();
            }
            if (element.setActive) {
                element.setActive();
            }
            return true;
        }
        else if ((element.nodeName == "INPUT" && element.type == "text")
            || (element.nodeName == "INPUT" && element.type == "password")
            || element.nodeName == "TEXTAREA") {
            //文本框
            if (element.focus) {
                element.focus();
            }
            if (element.select) {
                element.select();
            }
            if (element.setActive) {
                element.setActive();
            }
            var v = element.value;
            if (v != null && v.length > 0) {
                if (sWhere == "afterbegin") {
                    element.selectionStart = 0;
                }
                else if (sWhere == "beforeend") {
                    element.selectionStart = v.length;
                }
                element.selectionEnd = element.selectionStart;
            }
            return true;
        }
        else if (element.nodeName == "INPUT") {
            // 其他表单元素
            if (element.focus) {
                element.focus();
            }
            if (element.select) {
                element.select();
            }
            if (element.setActive) {
                element.setActive();
            }
            return true;
        }
        else if (element.nodeName == "SPAN"
            && element.getAttribute("dctype") == "XTextInputFieldElement") {
            // SPAN类型的输入域
            for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
                var node = element.childNodes[iCount];
                if (node.getAttribute) {
                    var dctype = node.getAttribute("dctype");
                    if (sWhere == "afterbegin") {
                        if (dctype == "start") {
                            DCDomTools.MoveCaretToEnd(node);
                            return true;
                        }
                    }
                    else if (sWhere == "beforeend") {
                        // DCDomTools.MoveCaretTo(node);
                        if (dctype == "end") {
                            DCDomTools.MoveCaretToIndex(node, 0);
                            return true;
                        }
                    }
                }
            }
        }
        else {
            // 其他元素
            if (element.childNodes && element.childNodes.length > 0) {
                if (sWhere == "afterbegin") {
                    // DCDomTools.MoveCaretTo(element.firstChild);
                    DCDomTools.MoveCaretToIndex(element.firstChild, 0);
                    return true;
                }
                else if (sWhere == "beforeend") {
                    // DCDomTools.MoveCaretTo(element.lastChild);
                    DCDomTools.MoveCaretToIndex(element.lastChild, 0);
                    return true;
                }
            }
            else {
                // DCDomTools.MoveCaretTo(element);
                DCDomTools.MoveCaretToIndex(element, 0);
                return true;
            }
        }
    }
    return false;
};

//设置输入域的可编辑性
DCInputFieldManager.SetInputFieldEditable = function (id, editableValue) {
    var element = document.getElementById(id);
    if (element != null) {
        if (editableValue) {
            element.contentEditable = true;
        }
        else {
            element.contentEditable = true;
        }
    }
};

// 删除输入域
DCInputFieldManager.DeleteField = function (showUI, parameter) {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    var field = null;
    if (parameter == null) {
        field = DCSelectionManager.GetCurrentInputField();
        if (field == null) {
            return false;
        }
    }
    if (typeof (parameter) == "string") {
        field = document.getElementById(parameter);
        if (this.IsInputFieldElement(field) == false) {
            return false;
        }
    }
    if (field.getAttribute("dc_deleteable") == "false") {
        if (showUI) {
            //alert(document.GetDCWriterString("JS_InputFieldMarkUnDeleted"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_InputFieldMarkUnDeleted");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return false;
    }
    var p = field.parentNode;
    if (p != null) {
        p.removeChild(field);
        return true;
    }
    return false;
};
//**************************************************************************************************************
// 获得文档中所有的单选框或复选框对象
// type :radio、checkbox 
// name: 元素的name属性（可不传参数：表示获取所有）
DCInputFieldManager.getAllCheckboxOrRadio = function (type, name) {
    var result = new Array();

    var eles = document.getElementsByTagName("input"); //[0].getAttribute("dctype")
    if (eles && eles.length > 0) {
        var typeName;
        if (type && type.length > 0) {
            if (type == "radio") {
                typeName = "XTextRadioBoxElement";
            } else if (type == "checkbox") {
                typeName = "XTextCheckBoxElement";
            } else {
                return result; //类型匹配不正确
            }
        }
        for (var i = 0; i < eles.length; i++) {

            if (eles[i].getAttribute("dctype") == typeName) {
                if (name)//根据名字查询
                {
                    if (eles[i].name == name) {
                        result.push(eles[i]);
                    }
                } else {
                    result.push(eles[i]);
                }
            }
        }
    }
    return result;
};

// 插入单选框
DCInputFieldManager.InsertCheckboxOrRadio = function (showUI, options) {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextInputFieldElement") == false) {
        if (showUI) {
            //alert(document.GetDCWriterString("JS_CannotInsertFieldAtCurrentPosition"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_CannotInsertFieldAtCurrentPosition");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return null;
    }

    if (options.ListItems && options.ListItems.length > 0) {
        var strHtml = "";
        for (var i = 0; i < options.ListItems.length; i++) {

            var input = document.createElement("INPUT");
            input.setAttribute("contenteditable", "False");
            input.setAttribute("unselectable", "on");
            input.setAttribute("dc_visualstyle", "SystemDefault");

            var label = document.createElement("LABEL");
            label.setAttribute("dcignore", "1");
            label.setAttribute("dctype", "XTextCheckBoxElementBaseLabel");
            label.setAttribute("contenteditable", "False");
            //label.setAttribute("style", "font-family: 宋体;font-size: 9pt;font-style: normal;font-weight: normal;text-decoration: none;");

            if (options.ListItems[i].Stringtag) {
                input.setAttribute("dc_stringtag", options.ListItems[i].Stringtag);
            }
            if (options.ListItems[i].MultiLine && (options.ListItems[i].MultiLine == "true" || options.ListItems[i].MultiLine == true)) {
                input.setAttribute("dc_multiline", "true");
            } else {//wyc20210325:默认为false
                input.setAttribute("dc_multiline", "false");
            }
            if (options.ListItems[i].Value) {
                input.setAttribute("value", options.ListItems[i].Value);
            }
            if (options.Type == "radio") {
                input.setAttribute("type", "radio");
                input.setAttribute("dctype", "XTextRadioBoxElement");
                input.setAttribute("onclick", "DCWriterControllerEditor.HandleCheckedChanged(this);DCInputFieldManager.executClientJavaScript(event, this, 'click');");
            } else if (options.Type == "checkbox") {
                input.setAttribute("type", "checkbox");
                input.setAttribute("dctype", "XTextCheckBoxElement");
            } else {
                continue;
            }
            if (options.ListItems[i].ID) {
                input.setAttribute("id", options.ListItems[i].ID);
                label.setAttribute("for", options.ListItems[i].ID);
                label.setAttribute("id", options.ListItems[i].ID + "_label");
            }
            if (options.ListItems[i].ToolTip) {
                input.setAttribute("title", options.ListItems[i].ToolTip);
                input.setAttribute("dc_tooltip", options.ListItems[i].ToolTip);
            }
            if (options.ListItems[i].Text) {
                input.setAttribute("dc_caption", options.ListItems[i].Text);
                label.innerText = options.ListItems[i].Text;
            }
            if (options.Name) {
                input.setAttribute("dc_name", options.Name);
                input.setAttribute("name", options.Name);
            }

            var span = document.createElement("SPAN");
            span.setAttribute("contenteditable", "False");
            span.appendChild(input);

            strHtml += span.outerHTML + label.outerHTML + "<span></span>";
        }
        DCWriterControllerEditor.InsertHtmlAtCurentPosition(strHtml);
    }

    //    DCInputFieldManager.FocusAdjacent("afterEnd", span);
    //    DCWriterControllerEditor.InsertElementAtCurentPosition(label, true);
};

// 插入输入域
DCInputFieldManager.InsertInputField = function (showUI, options) {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextInputFieldElement") == false) {
        if (showUI) {
            //alert(document.GetDCWriterString("JS_CannotInsertFieldAtCurrentPosition"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_CannotInsertFieldAtCurrentPosition");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return null;
    }
    var eventNames = new Array();
    var field = this.createInputField(options, eventNames);
    if (field != null) {
        // 20200108 xuyiming 添加前端插入的输入域所需的事件列表属性
        field.setAttribute("eventlist", "onmousedown|onmouseenter|onmouseleave|onfocus|onblur|onclick|ondblclick|onkeydown|onkeypress");

        //wyc20200911:扩充参数支持输入域插入的具体位置
        if (options.InsertDirection == undefined ||
            (options.InsertDirection != "current" && options.InsertDirection != "before" && options.InsertDirection != "after")) {
            options.InsertDirection = "current"; //"current"当前位置插入；"before"给定元素之前位置插入；"after"给定元素之后位置插入
        }
        var btemp = false;
        var newelement = document.WriterControl.GetContentDocument().getElementById(options.TargetID);
        if (options.InsertDirection == "current") {
            btemp = DCWriterControllerEditor.InsertElementAtCurentPosition(field, false);
        } else if (options.InsertDirection == "before") {
            if (newelement == null) {
                btemp = false;
            } else {
                newelement.parentNode.insertBefore(field, newelement);
                btemp = true;
            }
        } else if (options.InsertDirection == "after") {
            if (newelement == null) {
                btemp = false;
            } else {
                if (newelement.parentNode.lastChild == newelement) {
                    newelement.parentNode.appendChild(field);
                } else {
                    newelement.parentNode.insertBefore(field, newelement.nextSibling);
                }
                btemp = true;
            }
        }

        if (btemp == true) {

            this.FocusOwnerInputField(field);
            DCInputFieldManager.AddCascade(field);
            if (field.style.display != "none" && field.parentNode.tagName == "BR") {
                field.parentNode.parentNode.appendChild(field);
                field.parentNode.removeChild(field.parentNode.firstChild);
            }
            this.FixInputElementDom(field);
            return field;
        }
    }
    return null;
};

// 创建输入域元素对象 符良柱 2018-5-16修改
DCInputFieldManager.createInputField = function (options, eventNames) {
    var result = null;
    if (options == null) {
        options = new Object();
    }
    var tagName = "SPAN";
    var isMobile = document.body.getAttribute("ismobiledevice") == "true";
    var isSpecifyWidth = options.SpecifyWidth && isNaN(options.SpecifyWidth) == false && options.SpecifyWidth != 0;//是否是固定宽度输入域
    if (isMobile == true) {
        tagName = "SELECT";
    }
    if (isSpecifyWidth && options.SpecifyWidth < 0) {
        // 负固定宽度
        tagName = "INPUT";
    }
    if (options.labeltype == "label") {
        tagName = "label";
    }
    result = document.createElement(tagName);

    //    // 正常创建的元素标记 
    //    result.__this = result ;
    if (isSpecifyWidth) {//固定宽度设置
        if (tagName == "INPUT") {
            result.style.width = DCExpression.ABS(options.SpecifyWidth);
        } else if (tagName == "SPAN") {
            result.style.minWidth = DCExpression.ABS(options.SpecifyWidth);
        }
    }
    if (result.nodeName == "INPUT") {
        if (options.inputtype == "radio") {
            result.setAttribute("type", "radio");
        }
        else if (options.inputtype == "checkbox") {
            result.setAttribute("type", "checkbox");
        }
        else if (options.inputtype == "button") {
            result.setAttribute("type", "button");
            result.setAttribute("value", options.value);
            result.setAttribute("dc_innervalue", options.value);
            result.setAttribute("style", "cursor:pointer");
        }
        else {
            result.setAttribute("type", "text");
        }
    }
    if (result.nodeName != "SELECT") {
        if (DCDomTools.toBoolean(options.RuntimeContentReadonly, false) == true
            || DCDomTools.toBoolean(options.ContentReadonly, false) == true) {
            result.setAttribute("class", "InputFieldNormal InputFieldReadonly");
        }
        else {
            result.setAttribute("class", "InputFieldNormal");
        }
    }
    if (DCDomTools.toBoolean(options.UserEditable, true) == false
        || DCDomTools.toBoolean(options.RuntimeContentReadonly, false) == true
        || DCDomTools.toBoolean(options.ContentReadonly, false) == true) {
        if (result.nodeName == "INPUT") {
            result.setAttribute("readonly", "true");
        }
        else if (result.nodeName == "SELECT") {
            // 前端添加输入域时，修改select标签不需要disabled设置
            // result.setAttribute("disabled", "true");
        }
        else {
            result.setAttribute("CONTENTEDITABLE", "false");
        }
    }
    if (result.nodeName == "INPUT") {
        if (options.Alignment == "Near") {
            result.style.textAlign = "left";
        }
        else if (options.Alignment == "Center") {
            result.style.textAlign = "center";
        }
        else if (options.Alignment == "Far") {
            result.style.textAlign = "right";
        }
        else {
            result.style.textAlign = "left";
        }
    }
    //添加字体颜色和背景色 hulijun 2019-09-21
    if (options.Color) {
        result.style.color = options.Color;
        result.setAttribute("dc_textcolor", options.Color);
    }
    if (options.BackgroundColor) {
        result.style.backgroundColor = options.BackgroundColor;
    }

    if (result.nodeName == "SPAN") {
        result.setAttribute("hasbegin", "true");
        result.setAttribute("hasend", "true");
    }
    if (options.ID == "" || options.ID == undefined) {
        var i = Math.floor(Math.random() * 1000) + 1000;
        var random = "field" + i;
        result.setAttribute("id", random);
    } else {
        result.setAttribute("id", options.ID);
    }
    if (result.nodeName == "LABEL") {
        result.setAttribute("for", options.Htmlfor);
        result.innerText = options.value;
        result.setAttribute("dc_innertext", options.value);
    }
    if (options.ToolTip !== null && options.ToolTip !== undefined && options.ToolTip !== "") {
        result.setAttribute("title", options.ToolTip);
    }
    // 20191023 xuyiming 修改插入输入域name属性(没有值时不设置，修复首字母大小写的影响)
    if (options.Name || options.name) {
        result.setAttribute("name", options.Name || options.name);
        // 20191023 xuyiming 修复后端保存Name失败问题
        result.setAttribute("dc_name", options.Name || options.name);
    }
    result.setAttribute("dctype", "XTextInputFieldElement");
    if (DCInputFieldManager.propertyNames == null) {
        DCInputFieldManager.propertyNames = new Array(
            "AcceptTab",
            "AdornTextType",
            "Alignment",
            "Attributes",
            "BackgroundText",
            "BackgroundTextColor",
            "BindingPath",
            "BorderElementColor",
            "BorderVisible",
            "ContentReadonly",
            "CopySource",
            "CustomAdornText",
            "DataSource",
            "DictionaryID",//模板工具导出来的属性，对应listsourcename
            "DefaultEventExpression",
            "DefaultValueType",
            "Deleteable",
            "DisplayFormat",
            "EditorActiveMode",
            "EditorControlTypeName",
            "EnableFieldTextColor",
            "EnableHighlight",
            "EnablePermission",
            "EnableValueEditor",
            "EnableValueValidate",
            "EndBorderText",
            "FormButtonStyle",
            "ID",
            "InnerEditStyle",
            "InnerItemSpliter",
            "InnerListSourceName",
            "InnerMultiSelect",
            "InnerRuntimeContentReadonly",
            "InnerValue",
            "JavaScriptForClick",
            "JavaScriptForDoubleClick",
            "LabelText",
            "LinkListBinding",
            "LimitedInputChars",
            "MaxInputLength",
            "MoveFocusHotKey",
            "RuntimeBackgroundTextColor",
            "RuntimeEnableHighlight",
            "RuntimeMoveFocusHotKey",
            "ShowFormButton",
            "SpecifyWidth",
            "StartBorderText",
            "TabIndex",
            "TabStop",
            "TextColor",
            "ToolTip",
            "UnitText",
            "UserEditable",
            "ValidateStyle",
            "ValueBinding",
            "ValueExpression",
            "ViewEncryptType",
            "Visible",
            "VisibleExpression"
        );
    }
    // 复制属性值
    for (var key in options) {
        var lkey = key.toLowerCase();
        for (var iCount = 0; iCount < this.propertyNames.length; iCount++) {
            var name = this.propertyNames[iCount];
            if (lkey == name.toLowerCase()) {
                if (lkey == "attributes") {
                    //伍贻超20190307：碰上attributes属性则特殊处理
                    result.setAttribute("dc_" + lkey, JSON.stringify(options[key]));
                } else if (lkey == "datasource") {  //WYC20190909：这里的datasource与bindingpath可能会来自模板工具导出的JSON
                    result.setAttribute("datasourcename", options[key]);//datasourcename与datasourcepath要与JS里的定义和前后端解析对拢
                } else if (lkey == "bindingpath") {
                    result.setAttribute("datasourcepath", options[key]);
                } else if (lkey == "dictionaryid") {
                    result.setAttribute("dc_innerlistsourcename", options[key]);
                } else if (lkey == "specifywidth") {
                    result.setAttribute("dc_specifywidthinpixel", options.SpecifyWidth);
                } else {
                    result.setAttribute("dc_" + lkey, options[key]);
                }
            }
        } //for
    } //for

    // 输出事件处理
    if (eventNames == null) {
        eventNames = new Array();
    }
    if (options.RuntimeEnableHighlight != "Disabled") {
        eventNames.push("onmouseenter");
        eventNames.push("onmouseleave");
        eventNames.push("onfocus");
        eventNames.push("onblur");
    }
    if (DCDomTools.toBoolean(options.RuntimeContentReadonly, false) == false
        && DCDomTools.toBoolean(options.ContentReadonly, false) == false) {
        eventNames.push("onfocus");
        if (result.nodeName == "SELECT") {
            eventNames.push("onchange");
            if (options.InnerListSourceName != null && options.InnerListSourceName.length > 0) {
                eventNames.push("onclick");
            }
        }
        else if (result.nodeName == "INPUT") {
            eventNames.push("onchange");
            eventNames.push("onclick");
            eventNames.push("ondblclick");
        }
        else {
            eventNames.push("onclick");
            eventNames.push("ondblclick");
        }
    }
    eventNames.push("onkeydown");
    eventNames.push("onkeypress");
    for (var iCount = 0; iCount < eventNames.length; iCount++) {
        var eventName = eventNames[iCount];
        if (eventName == "onmouseenter") {
            result.onmouseenter = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onmouseenter"); };
        }
        else if (eventName == "onmouseleave") {
            result.onmouseleave = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onmouseleave"); };
        }
        else if (eventName == "onfocus") {
            result.onfocus = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onfocus"); };
        }
        else if (eventName == "onblur") {
            result.onblur = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onblur"); };
        }
        else if (eventName == "onchange") {
            result.onchange = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onchange"); };
        }
        else if (eventName == "onclick") {
            result.onclick = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onclick"); };
        }
        else if (eventName == "ondblclick") {
            result.ondblclick = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "ondblclick"); };
        }
        else if (eventName == "onkeydown") {
            result.onkeydown = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onkeydown"); };
        }
        else if (eventName == "onkeypress") {
            result.onkeypress = function (eventObject) { DCInputFieldManager.HandleInputFieldEvent(eventObject, this, "onkeypress"); };
        }
    } //for

    ////        result.setAttribute(
    ////                eventName,
    ////                "DCInputFieldManager.HandleInputFieldEvent(event, this , '" + eventName + "');");
    //    }

    if (options.ListItems != null) {
        // 加载下拉列表
        result.setAttribute("itemcount", options.ListItems.length);
        for (var iCount = 0; iCount < options.ListItems.length; iCount++) {
            var listItem = options.ListItems[iCount];
            if (result.nodeName == "SELECT") {
                var opt = document.createElement("option");
                var txt = listItem.TextInList;
                if (txt == null || txt.length == 0) {
                    txt = listItem.Text;
                }
                opt.appendChild(document.createTextNode(txt));
                var v = listItem.Value;
                if (v == null || v.length == 0) {
                    v = listItem.Text;
                }
                opt.setAttribute("value", v);
                if (v == options.Text) {
                    opt.setAttribute("selected", "true");
                }
                result.appendChild(opt);
            }
            else {
                if (listItem.Text != null) {
                    result.setAttribute("lt" + iCount, listItem.Text);
                }
                if (listItem.Value != null) {
                    result.setAttribute("lv" + iCount, listItem.Value);
                }
                if (listItem.TextInList != null) {
                    result.setAttribute("lz" + iCount, listItem.TextInList);
                }
            }
        } //for
    }
    if (options.Visible === false) {
        result.style.display = "none";
    }
    if (options.Text != null && options.Text.length > 0) {
        if (result.nodeName === "INPUT") {
            result.setAttribute("dc_innertext", options.Text);
            result.setAttribute("value", DCWriterControllerEditor.GetFormatedText(result, options.Text));
            result.setAttribute("placeholder", options.BackgroundText);
        }
        else {
            result.appendChild(document.createTextNode(DCWriterControllerEditor.GetFormatedText(result, options.Text)));
        }
    }
    // this.FixInputElementDom(result);
    return result;
};

//@method 判断是否为一个内容空白的而且可以被删除的输入域元素
//@param element 文档元素
DCInputFieldManager.IsEmptyInputFieldElement = function (element) {
    if (element == null) {
        return true;
    }

    if (element.nodeName == "INPUT") {
        var v = element.value;
        return (v == null || v.length == 0);
    }
    if (DCInputFieldManager.IsInputFieldElement(element) && element.nodeName == "SPAN") {
        for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
            var node = element.childNodes[iCount];
            if (node.getAttribute) {
                var dctype = node.getAttribute("dctype");
                var nodeNameStr = node.nodeName;
                if (dctype == "start" || dctype == "end" || dctype == "backgroundtext") {

                }
                // 20191025 xuyiming 修复输入域中有单标签dom,如图片、换行符,判断成内容空白的问题
                else if (nodeNameStr == "INPUT"
                    || nodeNameStr == "SELECT"
                    || nodeNameStr == "TEXTAREA"
                    || nodeNameStr == "BUTTON"
                    || nodeNameStr == "OBJECT"
                    || nodeNameStr == "IMG"
                    || nodeNameStr == "BR") {
                    return false;
                }
                else {
                    if (DCInputFieldManager.HasContentNode(node) == true) {
                        return false;
                    }
                    //var txt = node.innerText;
                    //if( txt != null && txt.length > 0 )
                    //{
                    //    return false;
                    //}
                }
            }
            else if (node.nodeName == "#text") {
                var txt = node.nodeValue;
                if (txt != null && txt.length > 0) {
                    return false;
                }
            }
        }
        return true;
    }
};

//**************************************************************************************************************
// 判断是否为输入域元素对象
DCInputFieldManager.IsInputFieldElement = function (element) {
    if (element == null) {
        return false;
    }
    //    if (element.nodeName != "SPAN") {
    //        return false;
    //    }
    if (element.getAttribute) {
        if (element.getAttribute("dctype") == "XTextInputFieldElement") {
            return true;
        }
    }
    return false;
};


//**************************************************************************************************************
// 让元素所在的输入域获得输入焦点
DCInputFieldManager.FocusOwnerInputField = function (element) {
    if (element == null) {
        return;
    }
    while (element != null) {
        if (DCInputFieldManager.IsInputFieldElement(element)) {
            break;
        }
        element = element.parentNode;
    };
    if (element == null) {
        return;
    }
    DCInputFieldManager.FixInputElementDom(element);
    var contentNode = element.dcFirstContentNode;
    if (contentNode != null) {
        if (contentNode.firstChild == null) {
            // DCDomTools.MoveCaretTo(contentNode);
            DCDomTools.MoveCaretToIndex(contentNode, 0);
        }
        else {
            // DCDomTools.MoveCaretTo(contentNode.firstChild);
            DCDomTools.MoveCaretToIndex(contentNode.firstChild, 0);
        }
    }
    else {
        // DCDomTools.MoveCaretTo(element);
        DCDomTools.MoveCaretToIndex(element, 0);
    }
};

//**************************************************************************************************************
// 更新输入域背景文字
DCInputFieldManager.UpdateInputElementBackground = function (element) {
    //    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
    //        return;
    //    }
    //    var backElements = new Array();
    //    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
    //        var node = element.childNodes[iCount];
    //        if (node.getAttribute) {
    //            if (node.getAttribute("dctype") == "backgroundtext") {
    //                backElements.push(node);
    //            }

    //        }
    //    }
};

// 判断输入域元素是否具有完整的开始元素和结束元素
DCInputFieldManager.HasStartEndElement = function (element) {
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        return true;
    }
    if (element.nodeName == "INPUT") {
        // 文本输入框，不处理
        return true;
    }
    var hasStart = false;
    var hasEnd = false;
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var e2 = element.childNodes[iCount];
        if (e2.nodeName == "SPAN") {
            if (e2.getAttribute("dctype") == "start") {
                hasStart = true;
            }
            else if (e2.getAttribute("dctype") == "end") {
                hasEnd = true;
            }
        }
    }
    return hasStart && hasEnd;
};

// 输入域是否显示了背景文字
DCInputFieldManager.IsBackgroundTextVisible = function (element) {
    if (element == null) {
        return false;
    }
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var e = element.childNodes[iCount];
        if (e.getAttribute && e.getAttribute("dctype") == "backgroundtext") {
            return true;
        }
    }
    return false;
};

// 修复文档中所有的输入域的DOM结构
DCInputFieldManager.FixAllInputFieldElementDom = function () {
    $("span[dctype='XTextInputFieldElement']").each(function () {
        DCInputFieldManager.FixInputElementDom(this);
    });

    $("select").each(function () {
        // IPAD返回的HTML的select.option.selected值不对，在此额外的设置属性值。
        this.setAttribute("dcselectedindex", this.selectedIndex);
    });
    $("input,textarea").each(function () {
        this.setAttribute("dc_newvalue", this.value);
    });
};

DCInputFieldManager.IsEmptTextNode = function (textNode) {
    var v = textNode.nodeValue;
    if (v == null || v.length == 0) {
        return true;
    }
    if (v == " ") {
        return true;
    }
    return false;
};

DCInputFieldManager.HasContentNode = function (rootNode) {
    if (rootNode.nodeName == "#text") {
        // 本身就是文本节点
        if (DCInputFieldManager.IsEmptTextNode(rootNode) == false) {
            return true;
        }
    }
    else if (rootNode.childNodes && rootNode.childNodes.length > 0) {
        for (var iCount = 0; iCount < rootNode.childNodes.length; iCount++) {
            var node = rootNode.childNodes[iCount];
            var nodeName = node.nodeName;
            if (nodeName == "TABLE"
                || nodeName == "TR"
                || nodeName == "TD"
                || nodeName == "INPUT"
                || nodeName == "SELECT"
                || nodeName == "TEXTAREA"
                || nodeName == "BUTTON"
                || nodeName == "OBJECT"
                || nodeName == "SCRIPT"
                || nodeName == "STYLE"
                || nodeName == "IMG") {
                return true;
            }
            else if (nodeName == "#text") {
                if (DCInputFieldManager.IsEmptTextNode(node) == false) {
                    return true;
                }
            }
            else {
                if (DCInputFieldManager.HasContentNode(node) == true) {
                    return true;
                }
            }
        }//for
    }
    return false;
};

// 为背景文字的原因而修正输入域的DOM结构
DCInputFieldManager.FixInputFieldElementDomForBackgroundText = function (element) {
    if (typeof (element) == "undefined" || element == null) {
        element = DCSelectionManager.GetCurrentInputField();
    }
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        return true;
    }
    if (element.nodeName != "SPAN") {
        return;
    }
    var stdStartText = element.getAttribute("dc_startbordertext");
    if (stdStartText == null || stdStartText.length == 0) {
        stdStartText = "[";
    }
    if (element.getAttribute("dc_labeltext") != null) {
        stdStartText = stdStartText + element.getAttribute("dc_labeltext");
    }
    var stdEndText = element.getAttribute("dc_endbordertext");
    if (stdEndText == null || stdEndText.length == 0) {
        stdEndText = "]";
    }
    if (element.getAttribute("dc_unittext") != null) {
        stdEndText = element.getAttribute("dc_unittext") + stdEndText;
    }
    var hasUserText = false;
    var userText = "";
    var hasBackgroundText = false;


    var needFix = false;
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.nodeName == "LABEL" && node.getAttribute("dctype") == "backgroundtext") {
            hasBackgroundText = true;
        }
        else if (node.nodeName == "SPAN") {
            var dctype = node.getAttribute("dctype");
            if (dctype == "start") {
                var txt = node.innerText;
                if (txt != stdStartText) {
                    hasUserText = true;
                    needFix = true;
                    //break;
                }
            }
            else if (dctype == "end") {
                var txt = node.innerText;
                if (txt != stdEndText) {
                    hasUserText = true;
                    needFix = true;
                    //break;
                }
            }
            else {
                //  普通文本
                var txt = node.innerText;
                if (txt != null && txt.length > 0) {
                    hasUserText = true;
                }
            }
            //else if( dctype == "backgroundtext")
            //{
            //    hasBackgroundText = true;
            //    var txt = node.innerText ;
            //    if( txt != node.getAttribute("text"))
            //    {
            //        hasUserText = true;
            //        //break;
            //    }
            //}
        }
        else if (node.nodeName == "#text") {
            if (DCInputFieldManager.IsEmptTextNode(node) == false) {
                hasUserText = true;
            }
        }
        else {
            if (DCInputFieldManager.HasContentNode(node) == true) {
                hasUserText = true;
            }
        }
    }//for
    if (hasUserText == hasBackgroundText || needFix == true) {
        // xuyiming 20200604 用户内容和背景文字的状态一致，则进行修正
        DCInputFieldManager.FixInputElementDom(element);
    }
};

//**************************************************************************************************************
// 先检查边界元素来判断是否需要修正输入域元素DOM结构
// 如果通过，无需修正则返回true，否则返回false。
DCInputFieldManager.FixInputElementDomWithDetectBorderElement = function () {
    var element = DCSelectionManager.GetCurrentInputField();
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        return true;
    }
    if (element.nodeName == "INPUT") {
        // 文本输入框，不处理
        return true;
    }
    var stdStartText = element.getAttribute("dc_startbordertext");
    if (stdStartText == null || stdStartText.length == 0) {
        stdStartText = "[";
    }
    if (element.getAttribute("dc_labeltext") != null) {
        stdStartText = stdStartText + element.getAttribute("dc_labeltext");
    }
    var stdEndText = element.getAttribute("dc_endbordertext");
    if (stdEndText == null || stdEndText.length == 0) {
        stdEndText = "]";
    }
    if (element.getAttribute("dc_unittext") != null) {
        stdEndText = element.getAttribute("dc_unittext") + stdEndText;
    }
    var startNode = null;
    var endNode = null;
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.getAttribute) {
            var dctype = node.getAttribute("dctype");
            if (dctype == "start") {
                startNode = node;
                var txt = DCDomTools.GetInnerText(node);
                if (txt != stdStartText) {
                    DCInputFieldManager.FixInputElementDom(element);
                    return false;
                }
            }
            else if (dctype == "end") {
                endNode = node;
                var txt = DCDomTools.GetInnerText(node);
                if (txt != stdEndText) {
                    //                    if (element.normalFlag != true) {
                    //                        // 不是正常创建的文档元素

                    //                    }
                    //                    var element2 = DCSelectionManager.GetCurrentInputField();
                    //                    txt = DCDomTools.GetInnerText(node);
                    //                    if (node.childNodes.length == 1 && node.firstChile.nodeName == "BR") {
                    //                        // 只有一个BR节点
                    //                    }
                    //                    else {
                    //if (element.normalFlag != true) {
                    DCInputFieldManager.FixInputElementDom(element);
                    //}
                    //}
                    return false;
                }
            }
            else if (dctype == "backgroundtext") {
                var txt = DCDomTools.GetInnerText(node);
                if (txt != null && txt.length > 1) {
                    DCInputFieldManager.FixInputElementDom(element);
                    return false;
                }
            }
        } //if
    } //for
    if (startNode == null || endNode == null) {
        DCInputFieldManager.FixInputElementDom(element);
        return false;
    }
    return true;
};

// 设置启用FixInputElementDom的延时时刻数
DCInputFieldManager.SetStartTickForFixInputElementDom = function (tick) {
    this.StartTick = DCDomTools.GetDateMillisecondsTick(new Date()) + tick;
};

// @method 在加载文档内容的时候初始化输入域元素
// @param element 输入域文档元素对象
DCInputFieldManager.FixSpanInputElementDomForDocumentLoad = function (element) {
    if (document.WriterControl == null) {
        // 运行环境不对
        return;
    }
    if (document.WriterControl.Options.CustomizeSpanInputElementBorderCssStyle != null) {
        var _CustomizeSpanInputElementBorderCssStyle = document.WriterControl.Options.CustomizeSpanInputElementBorderCssStyle;
        if ($.type(_CustomizeSpanInputElementBorderCssStyle) == "object") {
            //不做处理
        } else if ($.type(_CustomizeSpanInputElementBorderCssStyle) == "string" && _CustomizeSpanInputElementBorderCssStyle.indexOf("{") == 0) {
            _CustomizeSpanInputElementBorderCssStyle = JSON.parse(_CustomizeSpanInputElementBorderCssStyle);
        }
    }
    var isEmpty = element.getAttribute("empty") == "1";
    var ShowFieldBorderElement = document.Options != null && document.Options.ViewOptions.ShowFieldBorderElement == false;
    var contentNodes = new Array();
    if (isEmpty == false) {
        // 这明确不是一个内容为空的元素，则内容元素进行备份
        for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
            contentNodes.push(element.childNodes[iCount]);
        }
    }
    // 删除所有的子元素
    while (element.firstChild != null) {
        element.removeChild(element.firstChild);
    }
    if (element.getAttribute("hasbegin") == "true") {
        // 创建开始边界元素
        var stdStartText = element.getAttribute("dc_startbordertext");;
        if (stdStartText == null || stdStartText.length == 0) {
            stdStartText = "[";
        }
        if (element.getAttribute("dc_labeltext") != null) {
            if (ShowFieldBorderElement) {
                stdStartText = "";
            }
            stdStartText = stdStartText + element.getAttribute("dc_labeltext");
        }
        var startNode = document.createElement("span");
        startNode.setAttribute("dctype", "start");
        //startNode.setAttribute("atomicselection", "true");
        //startNode.setAttribute("unselectable", "on");
        //startNode.setAttribute("contenteditable", "false");
        startNode.setAttribute("dcignore", "1");
        var c = DCInputFieldManager.GetRuntimeBorderColor(element);
        if (c == null) {
            if (document.Options != null) {
                c = document.Options.ViewOptions.NormalFieldBorderColor;
            }
            else {
                c = "blue";
            }
        }
        //通过文档选项控制FieldBorder 2019-12-24 huliun
        if (ShowFieldBorderElement && element.getAttribute("dc_labeltext") == null) {
            startNode.style.opacity = 0;
        }
        startNode.style.color = c;
        if (_CustomizeSpanInputElementBorderCssStyle != null) {
            $(startNode).css(_CustomizeSpanInputElementBorderCssStyle);
        }
        startNode.appendChild(document.createTextNode(stdStartText));
        element.appendChild(startNode);
    }
    if (isEmpty == false && contentNodes.length > 0) {
        // 追加原有的内容
        for (var iCount = 0; iCount < contentNodes.length; iCount++) {
            if (contentNodes[iCount].nodeName == "#text") {
                element.appendChild(contentNodes[iCount]);
            } else if (contentNodes[iCount].getAttribute("dctype") != "start" && contentNodes[iCount].getAttribute("dctype") != "end") {
                element.appendChild(contentNodes[iCount]);
            }
        }
    }
    else {
        // 添加背景文字
        var stdBackgroundText = element.getAttribute("dc_backgroundtext");
        if (stdBackgroundText != null && stdBackgroundText.length > 0) {
            var c = element.getAttribute("rbtc");
            if (c == null) {
                if (document.Options != null) {
                    c = document.Options.ViewOptions.BackgroundTextColor;
                }
                else {
                    c = "gray";
                }
            }
            var lbl = DCInputFieldManager.CreateBackgroundTextLabel(element);// document.createElement("label");
            //lbl.setAttribute("dctype", "backgroundtext");
            //lbl.setAttribute("dcignore", "1");
            //lbl.style.color = element.getAttribute("rbkc");
            //lbl.setAttribute("atomicselection", "true");
            //lbl.setAttribute("contenteditable", "false");
            //if (document.IsIE7 == true) {
            //    lbl.setAttribute("unselectable", "on");
            //}
            //lbl.onclick = function () {
            //    var parent = this.parentNode;
            //    var func33 = function () {
            //        DCDomTools.MoveCaretToEnd(parent.firstChild);
            //    };
            //    window.setTimeout(func33, 50);
            //};
            // lbl.appendChild(document.createTextNode(stdBackgroundText));
            lbl.innerHTML = stdBackgroundText.replace(/ /g, "\&ensp\;");
            element.appendChild(lbl);
        }
    }
    if (element.getAttribute("hasend") == "true") {
        // 创建开始边界元素
        var stdEndText = element.getAttribute("dc_endbordertext");
        if (stdEndText == null || stdEndText.length == 0) {
            stdEndText = "]";
        }
        if (element.getAttribute("dc_unittext") != null) {
            if (ShowFieldBorderElement) {
                stdEndText = "";
            }
            stdEndText = element.getAttribute("dc_unittext") + stdEndText;
        }
        var endNode = document.createElement("span");
        endNode.setAttribute("dctype", "end");
        //startNode.setAttribute("atomicselection", "true");
        //startNode.setAttribute("unselectable", "on");
        //startNode.setAttribute("contenteditable", "false");
        endNode.setAttribute("dcignore", "1");
        if (element.getAttribute("dc_specifywidth") && parseFloat(element.getAttribute("dc_specifywidth")) > 0 && $(element).css("display") == "inline-block") {
            endNode.style.float = "right";
            element.style.textIndent = "0";//2020818 xym 修复IE8下固定宽度输入域报错问题
        }
        var c = DCInputFieldManager.GetRuntimeBorderColor(element);
        if (c == null) {
            if (document.Options != null) {
                c = document.Options.ViewOptions.NormalFieldBorderColor;
            }
            else {
                c = "blue";
            }
        }
        //通过文档选项控制FieldBorder 2019-12-24 huliun
        if (ShowFieldBorderElement && element.getAttribute("dc_unittext") == null) {
            endNode.style.opacity = 0;
        }
        endNode.style.color = c;
        if (_CustomizeSpanInputElementBorderCssStyle != null) {
            $(endNode).css(_CustomizeSpanInputElementBorderCssStyle);
        }
        endNode.appendChild(document.createTextNode(stdEndText));
        element.appendChild(endNode);
    }
};

//**************************************************************************************************************
// 修正输入域元素DOM结构
DCInputFieldManager.FixInputElementDom = function (element, callForLoadDocument) {
    //if (typeof (this.StartTick) == "number")
    //{
    //    var tick = DCDomTools.GetDateMillisecondsTick(new Date());
    //    if( tick < this.StartTick )
    //    {
    //        return;
    //    }
    //    else
    //    {
    //        this.StartTick = null;
    //    }
    //}
    //return;
    //debugger;
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        return false;
    }
    if (element.nodeName == "SPAN" && (element.getAttribute("dc_specifywidth") && parseFloat(element.getAttribute("dc_specifywidth")) > 0) || (element.getAttribute("dc_specifywidthinpixel") && parseFloat(element.getAttribute("dc_specifywidthinpixel")) > 0)) {
        var a = $(element).outerWidth();
        if (element.className.indexOf("InputFieldInvalidateValue") >= 0) {
            a -= 2;
        }
        var flag = a > parseFloat($(element).css("min-width"));
        if (element.style.display != "none") {//wyc20201125如果元素隐藏则不处理
            element.style.display = flag ? "inline" : "inline-block";
        }
        element.style.textIndent = "0";
        if ($(element).parent().css("line-height") != "normal") {
            element.style.lineHeight = flag ? "inherit" : "1";
        }
        if ($(element).find(">[dctype='end']")[0]) {
            $(element).find(">[dctype='end']")[0].style.float = flag ? "none" : "right";
        }
    }
    //WYC20190605：若处于输入法输入状态下，则不处理
    if (DCWriterControllerEditor.OnIMEMode === true) {
        return false;
    }
    ////////////////////////////////////////////////
    if (element.nodeName == "INPUT") {
        // 文本框元素无需修正
        return true;
    }
    if (document.WriterControl.Options.CustomizeSpanInputElementBorderCssStyle != null) {
        var _CustomizeSpanInputElementBorderCssStyle = document.WriterControl.Options.CustomizeSpanInputElementBorderCssStyle;
        if ($.type(_CustomizeSpanInputElementBorderCssStyle) == "object") {
            //不做处理
        } else if ($.type(_CustomizeSpanInputElementBorderCssStyle) == "string" && _CustomizeSpanInputElementBorderCssStyle.indexOf("{") == 0) {
            _CustomizeSpanInputElementBorderCssStyle = JSON.parse(_CustomizeSpanInputElementBorderCssStyle);
        }
    }
    var sel = DCSelectionManager.getSelection();
    if (sel != null && sel.currentContainer != null && sel.currentContainer.nodeName
        && (sel.currentContainer.nodeName == "OL" || sel.currentContainer.nodeName == "UL")
        && sel.startOffset > 0) {
        var linode = sel.currentContainer.childNodes[sel.startOffset];
        // DCDomTools.MoveCaretTo(linode);
        DCDomTools.MoveCaretToIndex(linode, 0);
        //debugger;
    }
    //console.log("fixdom:" + sel.currentContainer.nodeName);
    if (sel != null && sel.currentContainer &&
        ((sel.currentContainer.nodeName && sel.currentContainer.nodeName == "LI")
            || (sel.currentContainer.parentNode != null &&
                sel.currentContainer.parentNode.nodeName &&
                sel.currentContainer.parentNode.nodeName == "LI")
            || (sel.currentContainer.parentNode != null &&
                sel.currentContainer.parentNode.parentNode != null &&
                sel.currentContainer.parentNode.parentNode.nodeName &&
                sel.currentContainer.parentNode.parentNode.nodeName == "LI"))) {
        if (sel.currentContainer.nodeName == "LI" && sel.currentContainer.innerHTML == "<br>") {
            //console.log("前端空列表内直接回车仍然需要处理");
            var div = document.createElement("div");
            div.innerHTML = "<li>&zwnj;</li>";
            sel.currentContainer.parentNode.replaceChild(div.firstChild, sel.currentContainer);
        }
        return;
    }

    element.dcFirstContentNode = null;
    var pe = element.parentNode;

    var eatEdgeContent = false;
    if (pe != null) {
        if (pe.isContentEditable == false) {
            // 父容器是否为内容可编辑,如果为true，则边界的文本在输入域外面，如果为false，则边界内容划归输入域的内容。
            eatEdgeContent = true;
        }
    }
    if (DCDomTools.isInDocumentFragment(element) == true) {
        // 属于文档片段
    }
    else {
        if (DCMultiDocumentManager.isInDocument(element) == false) {
            // 不属于文档正文部分，不修正
            return false;
        }
    }
    // 判断是否为临时生成的元素
    var id = element.id;
    var checkForTemplateGenerate = false;
    //修改级联保存问题 2019-04-04 hulijun
    if (element.offsetWidth == 0 && element.parentNode != null && !(element.style.display != null)) {
        if (DCInputFieldManager.IsEmptyInputFieldElement(element) == true) {
            checkForTemplateGenerate = true;
        }
    }
    if (callForLoadDocument == true) {
        checkForTemplateGenerate = false;
    }
    ////    if (DCDomTools.isFirefox) {
    ////        // 对火狐浏览器进行特别判断
    ////        checkForTemplateGenerate = element.__this != element;
    ////        if (checkForTemplateGenerate == false) {
    ////            // 这种判断还不保险
    ////            // firefox中，敲回车会将当前输入域元素复制到下一行，而原先的位置反而是一个复制品。很变态。

    ////        }
    ////    }
    ////    else {
    ////        // 对IE和CHORME，敲回车，会将当前输入域元素的复制到下一行，原型的位置还是原装货。
    ////        checkForTemplateGenerate = element.__this != element;
    ////        //        if (element.__this != element) {
    ////        //            checkForTemplateGenerate = true;
    ////        //        }
    ////        //        else if (id == null || id.length == 0) {
    ////        //            var idback = element.getAttribute("idback");
    ////        //            if (idback != null && idback.length > 0) {
    ////        //                checkForTemplateGenerate = true;
    ////        //            }
    ////        //        }
    ////        //        else {
    ////        //            if (element.parentNode != null && element.parentNode.nodeName == "P" && element.previousSibling == null) {
    ////        //                // 段落中的第一个元素
    ////        //                var txt = DCWriterControllerEditor.GetElementText(element);
    ////        //                if (txt == null || txt.length == 0) {
    ////        //                    var e2 = document.getElementById(element.id);
    ////        //                    if (e2 != null && e2 != element) {
    ////        //                        checkForTemplateGenerate = true;
    ////        //                    }
    ////        //                }
    ////        //            }
    ////        //        }
    ////    }
    if (checkForTemplateGenerate) {

        // 临时生成的元素，清空内容
        var pn = element.parentNode;
        if (pn != null) {
            var setCaret = DCDomTools.ContainsSelection(pn);
            // 搜索BR的子孙节点
            var brElement = this.GetChildElementByNodeName(element, "BR");
            if (brElement == null) {
                pn.removeChild(element);
            }
            else {
                brElement.parentNode.removeChild(brElement);
                pn.replaceChild(brElement, element);
                if (setCaret) {
                    DCDomTools.MoveCaretToEnd(brElement);
                }
            }
        }
        return;
    }
    var doc = element.ownerDocument;
    var contentList = new Array();
    var startNode = null;
    var labelNode = null;
    var unitNode = null;
    var endNode = null;
    var hasContent = false;
    var newFocusNode = null;
    var curBackgroundText = "";
    var backgroundText = element.getAttribute("dc_backgroundtext");
    var oldSelection = DCSelectionManager.getSelection();
    var focusToEndOfText = false;
    if (oldSelection.currentContainer != null
        && oldSelection.currentContainer.nodeType == 3
        && oldSelection.currentOffset == oldSelection.currentContainer.length) {
        var p4 = oldSelection.currentContainer.parentNode;
        if (p4.nodeName == "SPAN" && p4.getAttribute("dctype") == "end") {
            focusToEndOfText = true;
        }
    }
    var ShowFieldBorderElement = document.Options != null && document.Options.ViewOptions.ShowFieldBorderElement == false;
    var hasBegin = element.getAttribute("hasbegin") == "true";
    var hasEnd = element.getAttribute("hasend") == "true";
    var fixedContentWidth = parseFloat(element.getAttribute("fixedcontentwidth"));
    var endTagAhead = element.getAttribute("endtagahead") == "true";
    if (isNaN(fixedContentWidth)) {
        fixedContentWidth = 0;
    }
    var result = false;
    if (backgroundText == null) {
        backgroundText = "";
    }
    // 删除空白文本节点
    for (var iCount = element.childNodes.length - 1; iCount >= 0; iCount--) {
        var node = element.childNodes[iCount];
        //        if (node.nodeName != "#text" && node.nodeName != "SPAN") {
        //            // 出现非文本元素，则不处理
        //            return;
        //        }
        if (node.nodeName == "#text") {
            var txt = node.nodeValue;
            if (txt == null || txt.length == 0) {
                element.removeChild(node);
            }
        }
    }
    var getLeftText = function (bigText, smallText) {
        var index = bigText.indexOf(smallText);
        if (index > 0) {
            return bigText.substring(0, index);
        }
        return null;
    };
    var getRightText = function (bigText, smallText) {
        var index = bigText.indexOf(smallText);
        if (index + smallText.length < bigText.length) {
            return bigText.substring(index + smallText.length, bigText.length);
        }
        return null;
    };
    var stdStartText = element.getAttribute("dc_startbordertext");;
    if (stdStartText == null || stdStartText.length == 0) {
        stdStartText = "[";
    }
    if (element.getAttribute("dc_labeltext") != null) {
        if (ShowFieldBorderElement) {
            stdStartText = "";
        }
        stdStartText = stdStartText + element.getAttribute("dc_labeltext");
    }
    var stdEndText = element.getAttribute("dc_endbordertext");
    if (stdEndText == null || stdEndText.length == 0) {
        stdEndText = "]";
    }
    if (element.getAttribute("dc_unittext") != null) {
        if (ShowFieldBorderElement) {
            stdEndText = "";
        }
        stdEndText = element.getAttribute("dc_unittext") + stdEndText;
    }
    var stdBackgroundText = element.getAttribute("dc_backgroundtext");
    var backgroundTextCount = 0;
    // 预期的节点列表
    var expectNodes = new Array();
    var bkNodes = new Array();
    //var nodeCountRemoved = 0;
    var lblBackgroundText = null;
    if (hasBegin) {
        // 开始元素之前的元素都移动到输入域之前
        for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
            var node = element.childNodes[iCount];
            if (node.nodeName == "SPAN" && node.getAttribute("dctype") == "start") {
                if (iCount > 0) {
                    if (eatEdgeContent == true) {
                        // 吃掉前面的内容
                        element.removeChild(node);
                        element.insertBefore(node, element.firstChild);
                    }
                    else {
                        // 将内容放在输入域前面
                        var items = new Array();
                        for (var iCount2 = 0; iCount2 < iCount; iCount2++) {
                            items.push(element.firstChild);
                            element.removeChild(element.firstChild);
                        }
                        var pn = element.parentNode;
                        for (var iCount2 = 0; iCount2 < iCount; iCount2++) {
                            pn.insertBefore(items[iCount2], element);
                        } //for
                    }
                } //if
                break;
            } //if
        } //for
    } //if
    if (hasEnd) {
        // 结束元素之后的元素都移动到输入域之后
        for (var iCount = element.childNodes.length - 1; iCount >= 0; iCount--) {
            var node = element.childNodes[iCount];
            if (node.nodeName == "SPAN" && node.getAttribute("dctype") == "end") {
                if (iCount < element.childNodes.length - 1) {
                    if (eatEdgeContent == true) {
                        // 吃掉后面的内容
                        element.removeChild(node);
                        element.appendChild(node);
                    }
                    else {
                        var items = new Array();
                        for (var iCount2 = iCount + 1; iCount2 < element.childNodes.length; iCount2++) {
                            items.push(element.childNodes[iCount2]);
                        }
                        var pn = element.parentNode;
                        for (var iCount2 = 0; iCount2 < items.length; iCount2++) {
                            var node4 = items[iCount2];
                            element.removeChild(node4);
                            if (node4.nodeName == "#text") {
                                element.insertAdjacentText("afterEnd", node4.nodeValue);
                            }
                            else {
                                element.insertAdjacentElement("afterEnd", node4);
                            }
                        }
                    }
                }
                break;
            } //if
        } //for
    }
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (endNode != null && fixedContentWidth == 0) {
            // 内容在结束节点之后
            //注销：第一个输入域的结尾符多了一个
            //element.removeChild(node);
            //if (node.nodeName == "#text") {
            //    var span = document.createElement("span");
            //    span.appendChild(node);
            //    span.style.fontFamily = element.style.fontFamily;
            //    span.style.fontSize = element.style.fontSize;
            //    span.style.color = element.style.color;
            //    node = span;
            //}
            //var parentNode = element.parentNode;
            //var nextNode = element.nextSibling;
            //if (nextNode == null) {
            //    parentNode.appendChild(node);
            //}
            //else {
            //    parentNode.insertBefore(node, nextNode);
            //}
            //nodeCountRemoved++;
            continue;
        }

        if (node.nodeName == "#text") {
            contentList.push(node);
            hasContent = true;
        }
        else if (node.getAttribute) {
            var txtForFix = null;
            var dcType = node.getAttribute("dctype");
            switch (dcType) {
                case "start":
                    {
                        var txt = DCDomTools.GetInnerText(node);
                        if (txt == null) {
                            txt = "";
                        }
                        if (txt != stdStartText) {
                            DCDomTools.SetInnerText(node, stdStartText);
                            if (txt.length > stdStartText.length) {
                                var parentNode = element.parentNode;
                                var leftText = getLeftText(txt, stdStartText);
                                if (leftText != null) {
                                    var txtNode = document.createTextNode(leftText);
                                    if (eatEdgeContent == true) {
                                        contentList.unshift(txtNode);
                                    }
                                    else {
                                        parentNode.insertBefore(txtNode, element);
                                    }
                                    //20191128 xuyiming 修复表单模式下在输入域前输入文字光标不动问题
                                    newFocusNode = txtNode;
                                    result = true;
                                }
                                var rightText = getRightText(txt, stdStartText);
                                if (rightText != null) {
                                    var arr = handleEnter(rightText);
                                    if (arr && arr.length > 0) {
                                        contentList = contentList.concat(arr);
                                        txtNode = arr[arr.length - 1];
                                    }
                                    newFocusNode = txtNode;
                                }
                            }
                        }
                        startNode = node;
                    }
                    break;
                case "backgroundtext":
                    //var txt2 = DCDomTools.GetInnerText(node);
                    //if (txt2 != null) {
                    //    if (txt2.length > 1) {
                    //        var txt3 = node.getAttribute("text");
                    //        if (txt3 != null) {
                    //            txt2 = txt2.replace(txt3, "");
                    //            if (txt2.length > 0) {
                    //                var txtNode = document.createTextNode(txt2);
                    //                contentList.push(txtNode);
                    //                newFocusNode = txtNode;
                    //            }
                    //        }
                    //    }
                    //    curBackgroundText = curBackgroundText + txt2;
                    //}
                    lblBackgroundText = node;
                    bkNodes.push(node);
                    break;
                case "end":
                    {
                        var txt = DCDomTools.GetInnerText(node);
                        if (txt == null) {
                            txt = "";
                        }
                        if (txt != stdEndText) {
                            DCDomTools.SetInnerText(node, stdEndText);
                            if (txt.length > stdEndText.length) {
                                var parentNode = node.parentNode;
                                var leftText = getLeftText(txt, stdEndText);
                                if (leftText != null) {
                                    var arr = handleEnter(leftText);
                                    if (arr && arr.length > 0) {
                                        contentList = contentList.concat(arr);
                                        txtNode = arr[arr.length - 1];
                                    }
                                    newFocusNode = txtNode;
                                }
                                var rightText = getRightText(txt, stdEndText);
                                if (rightText != null) {
                                    var txtNode = document.createElement("span");
                                    txtNode.innerHTML = rightText.replace(/\n/g, "<br dcpf='1'/>");
                                    // txtNode.appendChild(document.createTextNode(rightText));
                                    txtNode.style.fontFamily = element.style.fontFamily;
                                    txtNode.style.fontSize = element.style.fontSize;
                                    //txtNode.style.color = element.style.color;
                                    if (eatEdgeContent == true) {
                                        contentList.push(txtNode);
                                    }
                                    else {
                                        var parentNode = element.parentNode;
                                        var nextNode = element.nextSibling;
                                        if (nextNode == null) {
                                            parentNode.appendChild(txtNode);
                                        }
                                        else {
                                            parentNode.insertBefore(txtNode, nextNode);
                                        }
                                    }
                                    newFocusNode = txtNode;
                                    result = true;
                                }
                            }
                        }
                        endNode = node;
                    }
                    break;
                default:
                    //if (node.getAttribute("dcignore") != "1") {
                    contentList.push(node);
                    hasContent = true;
                    //}
                    break;
            } //switch

        } //if
    } //for

    if (startNode == null && hasBegin == true) {
        startNode = doc.createElement("span");
        startNode.setAttribute("dctype", "start");
        //startNode.setAttribute("atomicselection", "true");
        //startNode.setAttribute("unselectable", "on");
        //startNode.setAttribute("contenteditable", "false");
        startNode.setAttribute("dcignore", "1");
        var c = DCInputFieldManager.GetRuntimeBorderColor(element);
        if (c == null) {
            if (document.Options != null) {
                c = document.Options.ViewOptions.NormalFieldBorderColor;
            }
            else {
                c = "blue";
            }
        }
        startNode.style.color = c;
        if (_CustomizeSpanInputElementBorderCssStyle != null) {
            $(startNode).css(_CustomizeSpanInputElementBorderCssStyle);
        }
        //通过文档选项控制FieldBorder
        if (ShowFieldBorderElement && element.getAttribute("dc_labeltext") == null) {
            startNode.style.opacity = 0;
        }
        startNode.appendChild(doc.createTextNode(stdStartText));
        element.appendChild(startNode);
    }
    if (startNode != null) {
        expectNodes.push(startNode);
    }

    // 添加有效内容节点
    if (contentList.length > 0) {
        for (var iCount = 0; iCount < contentList.length; iCount++) {
            expectNodes.push(contentList[iCount]);
        }
    }
    if (contentList.length == 0) {
        // 没有正式内容，添加背景文字节点
        //alert(curBackgroundText);
        if (lblBackgroundText == null) {// curBackgroundText != backgroundText) {
            // 背景文字不匹配,重新生成背景文字元素
            var bkNodes = new Array();
            var c = element.getAttribute("rbtc");
            if (c == null) {
                if (document.Options != null) {
                    c = document.Options.ViewOptions.BackgroundTextColor;
                }
                else {
                    c = "gray";
                }
                element.setAttribute("rbtc", c);
            }
            var lbl = DCInputFieldManager.CreateBackgroundTextLabel(element);// document.createElement("label");
            lbl.innerHTML = backgroundText.replace(/ /g, "\&ensp\;");
            bkNodes.push(lbl);
        }
        // 背景元素节点
        if (bkNodes.length > 0) {
            for (var iCount = 0; iCount < bkNodes.length; iCount++) {
                expectNodes.push(bkNodes[iCount]);
            }
        }
    }
    else {
        element.dcFirstContentNode = contentList[0];
    }

    // 结束标记元素
    if (endNode == null && hasEnd == true) {
        endNode = doc.createElement("span");
        //endNode.setAttribute("atomicselection", "true");
        //endNode.setAttribute("unselectable", "on");
        //endNode.setAttribute("contenteditable", "false");
        endNode.setAttribute("dctype", "end");
        endNode.setAttribute("dcignore", "1");
        //endNode.setAttribute("contenteditable", "false");
        var c = DCInputFieldManager.GetRuntimeBorderColor(element);
        if (c == null || c.length == 0 || c == "transparent") {
            if (document.Options != null) {
                c = document.Options.ViewOptions.NormalFieldBorderColor;
            }
            else {
                c = "blue";
            }
        }
        endNode.style.color = c;
        if (_CustomizeSpanInputElementBorderCssStyle != null) {
            $(endNode).css(_CustomizeSpanInputElementBorderCssStyle);
        }
        //通过文档选项控制FieldBorder
        if (ShowFieldBorderElement && element.getAttribute("dc_unittext") == null) {
            endNode.style.opacity = 0;
        }
        endNode.appendChild(doc.createTextNode(stdEndText));
    }
    if (endNode != null) {
        if (endTagAhead == true) {
            // end标记前置
            if (fixedContentWidth > 0) {
                endNode.style.float = "right";
            }
            expectNodes.unshift(endNode);
        }
        else {
            expectNodes.push(endNode);
        }
    }
    // 比较新旧列表是否完全一致。
    var needSet = true;
    var Nodesp = false;
    for (var i = 0; i < expectNodes.length; i++) {
        if ((/[\r\n]+/.test(expectNodes[i].data)) === true) {
            Nodesp = false;
        }
        else if ((/[\r\n]+/.test(expectNodes[i].data)) != true) {
            Nodesp = true;
            break;
        }
    }
    if (expectNodes.length == element.childNodes.length) {
        // 长度一样,则挨个比较节点
        needSet = false;
        for (var index = 0; index < expectNodes.length; index++) {
            if (expectNodes[index] != element.childNodes[index]) {
                needSet = true;
                break;
            }
        }
    }
    else if (Nodesp == false) {
        // 内容为空，不需要重新设置
        needSet = false;
    }
    else {
        // 长度不一样，需要重新设置
        needSet = true;
    }
    if (needSet) {
        //debugger;
        // 重新设置
        //        if (oldSelection.startContainer == null) {
        //            return result;
        //        }
        var isCurrentElement = (element == DCSelectionManager.GetCurrentInputField());

        if (callForLoadDocument != true) {
            element.Modified = true;
            if (element.nodeName != "SELECT") {
                DCDomTools.addClass(element, "TagColorForModifiedField");
            }
        }
        //if (expectNodes.length == 4 || expectNodes[1].nodeValue == "是是")
        //{
        //    console.log(expectNodes.length);
        //}
        DCDomTools.RemoveAllChildNodes(element);
        for (var index = 0; index < expectNodes.length; index++) {
            element.appendChild(expectNodes[index]);
        } //for

        //debugger;
        DCDomTools.ClearUndo();
        result = true;
        //debugger;
        if (newFocusNode != null) {
            //if (document.IsIE7 == true) {
            //debugger;
            DCDomTools.MoveCaretToEnd(newFocusNode);
            //var tempSpan = document.createElement("span");
            //tempSpan.innerText = "|";
            //newFocusNode.parentNode.insertBefore(tempSpan, newFocusNode.nextSibling);
            //DCDomTools.MoveCaretTo(tempSpan);
            //tempSpan.focus();
            //newFocusNode.parentNode.removeChild(tempSpan);

            //}
            //else {
            //    DCDomTools.MoveCaretTo(newFocusNode.nextSibling);
            //}
        }
        else {
            var sel2 = DCSelectionManager.getSelection();
            //        if (sel2.startContainer == null) {
            //            return result;
            //        }
            if (oldSelection && sel2
                && oldSelection.startContainer == sel2.startContainer
                //WYC20191023：排除三个判断，避免当光标在列表样式段落中编辑时光标乱跳
                && oldSelection.currentContainer
                && oldSelection.currentContainer.nodeName != "LI"
                && oldSelection.currentContainer.parentNode
                && oldSelection.currentContainer.parentNode.nodeName != "LI"
                && oldSelection.currentContainer.parentNode.parentNode
                && oldSelection.currentContainer.parentNode.parentNode.nodeName != "LI") {
                var node = oldSelection.startContainer;
                if (node != null && node.childNodes) {
                    var index = Math.min(oldSelection.startOffset, sel2.startOffset);
                    if (index >= 0 && index < node.childNodes.length) {
                        DCDomTools.MoveCaretTo(node.childNodes[index]);
                    }
                }
            }
            else {
                if (element.childNodes.length >= 2
                    //WYC20191023：排除三个判断，避免当光标在列表样式段落中编辑时光标乱跳
                    && oldSelection.currentContainer
                    && oldSelection.currentContainer.nodeName != "LI"
                    && oldSelection.currentContainer.parentNode
                    && oldSelection.currentContainer.parentNode.nodeName != "LI"
                    && oldSelection.currentContainer.parentNode.parentNode
                    && oldSelection.currentContainer.parentNode.parentNode.nodeName != "LI") {
                    DCDomTools.MoveCaretToEnd(element.firstChild);
                    //DCDomTools.MoveCaretTo(element.childNodes[1]);
                }
                //var node = oldSelection.startContainer;
                //if (node != null && node.ownerDocument != null && node.parentNode != null) {
                //    DCDomTools.MoveCaretTo(node);
                //}
                ////DCWriterControllerEditor.MoveCaretTo(element.childNodes[1]);
                //var sel3 = DCDomTools.getSelection();
            }
        }
    }
    //console.log(element.innerText);
    //BSDCWRIT-208 hulijun 20210409
    DCInputFieldManager.UpdateInnerValue(element);
    if (focusToEndOfText == true && newFocusNode != null) {
        DCDomTools.MoveCaretToEnd(newFocusNode);
        setTimeout(function () {
            DCDomTools.MoveCaretToEnd(newFocusNode);
        }, 0);
    }
    return result;
};

function handleEnter(str) {
    var arr = new Array();
    if (!str) {
        return arr;
    }
    var index = str.search(/\n/g);
    if (index >= 0) {
        var str1 = str.substring(0, index);
        arr.push(document.createTextNode(str1));
        var br = document.createElement("br");
        br.setAttribute("dcpf", "1");
        arr.push(br);

        if ((index + 1) < str.length) {
            var str2 = str.substring(index + 1, str.length);
            arr = arr.concat(handleEnter(str2));
        }
    } else {
        arr.push(document.createTextNode(str));
    }

    return arr;
}

// 获得指定节点第一个指定名称的子孙节点对象
DCInputFieldManager.GetChildElementByNodeName = function (rootElement, nodeName) {
    for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
        var node = rootElement.childNodes[iCount];
        if (node.nodeName == nodeName) {
            return node;
        }
        if (node.childNodes) {
            var subNode = this.GetChildElementByNodeName(node, nodeName);
            if (subNode != null) {
                return subNode;
            }
        }
    }
    return null;
};

DCInputFieldManager.innerGetAllInputFields = function (
    rootElement,
    excludeReadonly,
    excludeHiddenElement,
    resultArray) {
    var len = rootElement.childNodes.length;
    for (var iCount = 0; iCount < len; iCount++) {
        var node = rootElement.childNodes[iCount];
        if (excludeHiddenElement == true) {
            // 忽略不可见的元素
            if (DCDomTools.isHiddenElementFast(node)) {
                continue;
            }
        }
        var nodeName = node.nodeName;
        if (nodeName == "#text"
            || nodeName == "#comment"
            || nodeName == "SCRIPT"
            || nodeName == "IMG") {
            // 直接忽略的元素
            continue;
        }
        if (nodeName == "SPAN"
            || nodeName == "INPUT"
            || nodeName == "SELECT"
            || nodeName == "TEXTAREA") {
            if (DCInputFieldManager.IsInputFieldElement(node) == true) {
                var add = true;
                if (excludeReadonly == true) {
                    if (nodeName == "SPAN" && node.getAttribute("contenteditable") == "False") {
                        add = false;
                    }
                    else if (nodeName == "INPUT" && node.readOnly == true) {
                        add = false;
                    }
                    else if (nodeName == "SELECT" && node.disabled == true) {
                        add = false;
                    }
                }
                if (add == true) {
                    resultArray.push(node);
                }
            }
            if (nodeName != "SPAN") {
                // 非span元素，无需遍历子节点
                continue;
            }
        } //if
        if (node.childNodes != null) {
            // 递归遍历子节点
            DCInputFieldManager.innerGetAllInputFields(node, excludeReadonly, excludeHiddenElement, resultArray);
        }
    } //for
};

//**************************************************************************************************************
// 获得文档中所有的输入域对象
// 参数 excludeReadonly :是否排除只读输入域
DCInputFieldManager.getAllInputFields = function (excludeReadonly, excludeHiddenElement) {
    var result = new Array();
    var root = DCWriterControllerEditor.getdivAllContainer();
    if (root == null) {
        root = document.body;
    } else {
        //BSDCWRIT-164 hlj  20210224
        var divHeader = document.getElementById("divXTextDocumentHeaderElement");
        DCInputFieldManager.innerGetAllInputFields(divHeader, excludeReadonly, excludeHiddenElement, result);

        var divFooter = document.getElementById("divXTextDocumentFooterElement");
        DCInputFieldManager.innerGetAllInputFields(divFooter, excludeReadonly, excludeHiddenElement, result);
    }
    DCInputFieldManager.innerGetAllInputFields(root, excludeReadonly, excludeHiddenElement, result);


    return result;
};


//**************************************************************************************************************
// 获得指定根节点下所有的输入域对象
// 参数 excludeReadonly :是否排除只读输入域
DCInputFieldManager.getAllInputFieldsSpecifyRoot = function (
    rootElement,
    excludeReadonly,
    excludeHiddenElement) {
    if (rootElement == null) {
        return null;
    }
    var result = new Array();
    DCInputFieldManager.innerGetAllInputFields(rootElement, excludeReadonly, excludeHiddenElement, result);
    return result;
};


// 更新输入域数据样式
DCInputFieldManager.UpdateInputFieldClassName = function (element) {
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        return;
    }
    if (element.nodeName == "SELECT") {
        return;
    }
    if (element.nodeName == "INPUT" || element.nodeName == "TEXTAREA") {
        if (element.readOnly == true) {
            return;
        }
    }
    var clsName = "";
    if (element.getAttribute("ircr") == "true") {
        // 只读输入域
        clsName = "InputFieldReadonly";
    }
    else if (element.LastValidateResult != null) {
        // 数据校验错误输入域
        clsName = "InputFieldInvalidateValue";
    }
    else if (element.Modified == true) {
        // 内容修改输入域
        clsName = "InputFieldModified";
    }
    else {
        // 正常输入域
        clsName = "InputFieldNormal";
    }
    //xym 20200728 修改没有特殊输入域样式时不更新
    if (element.className.indexOf("InputField") == -1) {
        return;
    }
    var lc = element.getAttribute("localclass");
    if (lc != null && lc.length > 0) {
        clsName = clsName + " " + lc;
    }
    element.className = clsName;
};

//**************************************************************************************************************
// 执行数据校验 袁永福2015-6-26
// 返回校验结果信息
DCInputFieldManager.ValueValidate = function (element) {
    var vs = element.getAttribute("dc_validatestyle");
    if (vs != null && vs.length > 0) {
        // 执行数据校验
        var txt = DCWriterControllerEditor.GetElementText(element);
        // 20210302 xym 修复BSDCWRIT-165
        var dc_innervalue = element.getAttribute("dc_innervalue");
        if (txt != dc_innervalue) {
            var newText = DCWriterControllerEditor.GetFormatedText(element, dc_innervalue);
            if (txt == newText) {
                txt = dc_innervalue;
            }
        }
        var result = DCValueValidate(txt, vs);
        //alert(result);
        if (result != null && result.length > 0) {
            element.LastValidateResult = result;
            element.setAttribute("title", result);
        }
        else {
            element.LastValidateResult = null;
            var title = element.getAttribute("dc_tooltip");
            if (title != null && title.length > 0) {
                element.setAttribute("title", title);
            }
            else {
                element.removeAttribute("title");
            }
        }
        DCInputFieldManager.UpdateInputFieldClassName(element);
        return result;
    }
    return null;
};


// 执行客户端脚本
DCInputFieldManager.executClientJavaScript = function (eventObject, element, eventName) {
    if (eventObject == null) {
        if (window.event) {
            eventObject = window.event;
        }
    }
    if (element == null || eventName == null) {
        return;
    }
    var funcName = element.getAttribute("fname_" + eventName);
    if (funcName != null && funcName.length > 0) {
        var f = document.body[funcName];
        if (f) {
            var txt = DCWriterControllerEditor.GetElementText(element);
            var eventParameter = new Object();
            eventParameter.text = txt;
            f(eventObject, element, eventParameter);
            if (eventParameter.text != txt) {
                DCWriterControllerEditor.SetElementText(element, eventParameter.text);
            }
        }
    }
};

// 判断元素内容是否可以编辑
DCInputFieldManager.isContentEditable = function (element) {
    var p = element;
    while (p != null) {
        var c = p.contentEditable;
        if (c == "inherit") {
        }
        else if (c == "false") {
            return false;
        }
        else if (c == "true") {
            return true;
        }
        p = p.parentNode;
    }
    return false;
};

//**************************************************************************************************************
// 处理输入域事件
DCInputFieldManager.HandleInputFieldEvent = function (eventObject, element, eventName) {
    //console.log(eventName);
    if (eventObject == null) {
        if (window.event) {
            eventObject = window.event;
        }
    }
    if (element === null || eventName === null) {
        return;
    }
    if (DCDomTools.IsMouseDragScrollMode(document.body) === true) {
        if (eventName === "onmousedown"
            || eventName === "onmousemove"
            || eventName === "onmouseup"
            || eventName === "onclick"
            || eventName === "ondblclick"
            || eventName === "onmouseenter"
            || eventName === "onmouseleave") {
            return false;
        }
    }
    if (eventName === "onblur") {
        //alert(element.id);
        DCInputFieldManager.FixInputElementDom(element);
        // xuyiming 20200612 添加输入域失去焦点的回调函数EventFieldOnBlur
        DCInputFieldManager.RaiseFieldOnBlurEvent(element);
    }
    DCInputFieldManager.executClientJavaScript(eventObject, element, eventName);
    //DCWriterExpressionManager.ExecuteEffectExpression(element);
    //    //    if (element.nodeName == "SELECT" && eventName == "onchange") {
    //    //        element.setAttribute("dcselectedindex", element.selectedIndex);
    //    //    }
    //    var funcName = element.getAttribute("fname_" + eventName);
    //    if (funcName != null && funcName.length > 0) {
    //        var f = document.body[funcName];
    //        if (f) {
    //            var txt = DCWriterControllerEditor.GetElementText(element);
    //            var eventParameter = new Object();
    //            eventParameter.text = txt;
    //            f(eventObject, element, eventParameter);
    //            if (eventParameter.text != txt) {
    //                DCWriterControllerEditor.SetElementText(element, eventParameter.text);
    //            }
    //        }
    //    }

    if (eventName == "onkeypress") {
        if (element.getAttribute("dc_innereditstyle") == "Numeric"
            && document.IsIE7 == false) {
            // 只能输入数值型的
            var char = eventObject.charCode;
            if (char == 0) {
                return true;
            }
            //            if (eventObject.charCode) {
            //                char = eventObject.charCode;
            //            }
            var txt = String.fromCharCode(char);
            if ("01234567890.-".indexOf(txt) < 0) {
                // 非数字键
                eventObject.cancelBubble = true;
                eventObject.returnValue = false;
                return false;
            }
        }
        else if (this.isContentEditable(element)
            && element.nodeName == "SPAN") {
            // 处于可编辑区域
            if (eventObject.keyCode == 13 && eventObject.shiftKey == false) {
                // 正常的回车,默认会产生一个<P>元素，会导致输入域断裂，改用<br/>元素。
                eventObject.cancelBubble = true;
                eventObject.returnValue = false;
                //DCDomTools.fireKeyEvent(element, "keypress", 13, false, false, true);
                return false;
            }
        }
    }
    else if (eventName == "onmouseenter") {
        if (element.getAttribute("rehl") == "Enabled") {
            element.BackgroundColor = element.style.backgroundColor;
            if (document.Options != null && document.Options.ViewOptions != null && document.Options.ViewOptions != null && document.Options.ViewOptions.FieldHoverBackColor != null) {//xym 20200825
                element.style.backgroundColor = document.Options.ViewOptions.FieldHoverBackColor;
            }
        }
    }
    else if (eventName == "onmouseleave") {
        if (this.currentElement != element) {
            if (element.getAttribute("rehl") == "Enabled") {
                element.style.backgroundColor = element.BackgroundColor != null ? element.BackgroundColor : "";
            }
        }
    }
    else if (eventName == "onblur") {
        if (this.curentElement == element) {
            this.curentElement = null;
        }
        DCInputFieldManager.UpdateInputFieldClassName(element);
        var dropdownElement = DCDropdownControlManager.GetCurrentEditInputField();
        if (dropdownElement !== null && element !== dropdownElement) {
            //DCWRITER-2881 hulijun 2019-10-28
            var selElement = DCSelectionManager.getSelection().GetCurrentInputField();
            if (DCWriterControllerEditor.IsFormView() == true && selElement != element && DCInputFieldManager.IsInputFieldElement(selElement)) {
            } else {
                DCDropdownControlManager.CloseDropdownControl();
            }
        } else if (dropdownElement !== null) {
            return;
        }

        //if (element != DCDropdownControlManager.GetCurrentEditInputField()) {
        //    if (DCDropdownControlManager.GetCurrentEditInputField() != null) {
        //        DCDropdownControlManager.CloseDropdownControl();
        //    }
        //}
        //else {
        //    return;
        //}
        if (element.isContentEditable == true) {
            var oldText = DCWriterControllerEditor.GetElementText(element);
            // DCWriterControllerEditor.SetElementInnerValueString(element.ID, oldText, oldText);//将原始格式的时间存入innervalue
            // var newText = DCWriterControllerEditor.GetFormatedText(element, oldText);
            // 修复BSDCWRIT-41,元素无法通过鼠标切换
            // if (oldText != newText) {
            //     DCWriterControllerEditor.SetElementText(element, newText);
            // }
            //alert(DCWriterControllerEditor.GetElementText(element));
            //DCInputFieldManager.FixInputElementDom(element);
            if (DCInputFieldManager.ValueValidate(element) == null && oldText != "") {
                DCWriterExpressionManager.ExecuteEffectExpression(element);
            }
        }
        //属性值表达式
        DCInputFieldManager.propertyexpressions(element);
    }
    else if (eventName == "onfocus") {
        this.curentElement = element;
        if (element.getAttribute("rehl") == "Enabled") {
            if (element.nodeName != "SELECT" ||
                !(element.getAttribute("dc_innereditstyle") != null && DCWriterControllerEditor.IsFormView() == true)) {
                DCDomTools.addClass(element, "FieldFocusedBackColor");
            }
        }
        //当输入域为空，光标定位输出格式为日期格式，下拉框转变成日期格式 2019-06-21 xuyiming
        DCWriterControllerEditor.GetFormatedText(element, null);
        //        if (DCWriterControllerEditor.IsActiveEditor(element, "GotFocus")) {
        //            if (this.DropdownFieldEditor(element, eventObject)) {
        //                if (eventObject != null) {
        //                    eventObject.cancelBubble = true;
        //                    eventObject.returnValue = false;
        //                }
        //                return false;
        //            }
        //        }
        // xuyiming 20201204 添加输入域获取焦点的回调函数EventFieldOnFocus
        DCInputFieldManager.RaiseFieldOnFocusEvent(element);
    }
    else if (eventName == "onfocusWithoutActiveEditor") {
        //alert("zzzz" + element.outerHTML );
        this.curentElement = element;
        if (element.getAttribute("rehl") == "Enabled") {
            if (element.nodeName != "SELECT") {
                DCDomTools.addClass(element, "FieldFocusedBackColor");
            }
        }
    }
    else if (eventName == "onkeydown") {
        var ctl = document.WriterControl;
        // 修复ondocumentkeydown函数可以控制重写输入域中keydown操作
        if (ctl != null && ctl.ondocumentkeydown != null
            && typeof (ctl.ondocumentkeydown) == "function") {
            var result = ctl.ondocumentkeydown.call(ctl, eventObject);
        }
        if (result == false) {
            eventObject.cancelBubble = true;
            return false;
        }

        //alert("ggggggggg");
        //alert(eventObject.keyCode);
        keyselect();
        //BSDCWRIT-82 取消输入域全选 hulijun 20201223
        if (eventObject.ctrlKey == true && eventObject.keyCode == 65) {
            //eventObject.cancelable = false;
            eventObject.cancelBubble = true;
            eventObject.returnValue = false;
            return;
        }
        if (eventObject == null) {
            return true;
        }
        var sel = DCSelectionManager.getSelection();
        //console.log("keydown:" + sel.currentContainer.nodeName);
        //WYC20191023：如果检测到在输入域内部的列表样式段落内，则不处理
        if (sel.currentContainer.nodeName == "LI" || sel.currentContainer.nodeName == "OL" || sel.currentContainer.nodeName == "UL"
            || sel.currentContainer.parentNode.nodeName == "LI"
            || sel.currentContainer.parentNode.parentNode.nodeName == "LI") {
            return;
        }
        if (eventObject.keyCode == 113) {
            if (DCInputFieldManager.IsActiveEditor(element, "F2")) {
                if (this.DropdownFieldEditor(element, eventObject)) {
                    if (eventObject != null) {
                        DCDomTools.completeEvent(eventObject);
                        eventObject.returnValue = false;
                    }
                    return false;
                }
            }
        }
        //符良柱2018-1-9
        //Enter按键事件
        if (eventObject.keyCode == 13) {
            if (element.nodeName == "TEXTAREA") {
                // 不处理
                return;
            }
            // if ((!!window.ActiveXObject || "ActiveXObject" in window) == true) {alert("ie");}
            var editMode = element.getAttribute("dc_innereditstyle");
            //xuyiming 20190905 enter快捷键在各个输入域之间来回切换,禁止一些操作
            var moveFocusHotKey = element.getAttribute("rmfhk") || "";
            if (moveFocusHotKey != "Enter") {
                if (element.nodeName != "INPUT"
                    && editMode != "DropdownList"
                    && element.nodeName != "SELECT"
                    && editMode != "DateTime"
                    && editMode != "Date"
                    && editMode != "DateTimeWithoutSecond"
                    && !element.getAttribute("dc_specifywidth")
                    && !element.getAttribute("dc_specifywidthinpixel")) {
                    // 不是下拉列表编辑模式
                    eventObject.cancelBubble = false;
                    eventObject.returnValue = false;
                    if (eventObject.keyCode == 13
                        && eventObject.shiftKey == false
                        && this.isContentEditable(element)) {
                        // 正常的回车,默认会产生一个<P>元素，会导致输入域断裂，改用<br/>元素。
                        eventObject.cancelBubble = true;
                        eventObject.returnValue = false;
                        // 取消当前事件
                        DCDomTools.completeEvent(eventObject);
                        var brElement = document.createElement("br");
                        brElement.setAttribute("dcpf", "1");
                        DCWriterControllerEditor.InsertElementAtCurentPosition(brElement, true);
                        // 解决BS编辑器空输入域回车后光标消失问题
                        DCInputFieldManager.FixInputElementDom(element);
                        //DCDomTools.fireKeyEvent(element, "keydown", 13, false, false, true);
                        return false;
                    }
                    return;
                } else {
                    if (document.getElementById("divDropdownContainer").style.display == "none") {
                        if (this.DropdownFieldEditor(element, eventObject)) {
                            eventObject.cancelBubble = true;
                            eventObject.returnValue = false;
                            return false;
                        }
                        if (element.getAttribute("dc_specifywidth") || element.getAttribute("dc_specifywidthinpixel")) {//20200922 xym 固定宽度输入域禁止shift+enter换行
                            DCDomTools.completeEvent(eventObject);
                        } else {
                            // 20210309 xym 修复BSDCWRIT-180
                            eventObject.cancelBubble = false;
                            eventObject.returnValue = false;
                            if (eventObject.keyCode == 13
                                && eventObject.shiftKey == false
                                && this.isContentEditable(element)) {
                                // 正常的回车,默认会产生一个<P>元素，会导致输入域断裂，改用<br/>元素。
                                eventObject.cancelBubble = true;
                                eventObject.returnValue = false;
                                // 取消当前事件
                                DCDomTools.completeEvent(eventObject);
                                var brElement = document.createElement("br");
                                brElement.setAttribute("dcpf", "1");
                                DCWriterControllerEditor.InsertElementAtCurentPosition(brElement, true);
                                // 解决BS编辑器空输入域回车后光标消失问题
                                DCInputFieldManager.FixInputElementDom(element);
                                return false;
                            }
                        }
                    } else {
                        var ctl = document.WriterControl;
                        //添加EventAfterEnter函数用来下拉展示时可以控制重写Enter操作
                        if (ctl != null && ctl.EventAfterEnter != null
                            && typeof (ctl.EventAfterEnter) == "function") {
                            var result = ctl.EventAfterEnter.call(ctl, eventObject);
                        }
                        if (result == false) {
                            return false;
                        }
                        // 判断是被选择的内容
                        var mid = document.getElementById("divDropdownContainer");
                        // 20200702 xym 解决enter键无法触发当前选中的下拉项的数据
                        var arr = DCDomTools.allChildNodes(mid, 1);
                        for (var i = 0; i < arr.length; i++) {
                            if ($(arr[i]).is(":hidden") || arr[i].getAttribute("dcignore")) {
                                arr.splice(i, 1);
                                i--;
                            }
                        }
                        var selectDom = $(arr).filter(".selected")[0] || $(arr).filter("#selecteddropdownlistitem")[0];
                        if (selectDom != null) {
                            selectDom.click();
                            DCDomTools.completeEvent(eventObject);
                        }
                    }
                }
            }
        }
        ////符良柱2018-1-11
        ////鼠标进入触发下拉
        //if (eventObject.keyCode == 37 || eventObject.keyCode == 39) {

        //    var editMode = element.getAttribute("dc_innereditstyle");
        //    if (editMode != "DropdownList"
        //        && element.nodeName != "SELECT"
        //        && editMode != "DateTime"
        //        && editMode != "Date"
        //        && editMode != "DateTimeWithoutSecond") {
        //        return;

        //    } else {
        //        if (document.getElementById("divDropdownContainer").style.display == "none") {
        //            if (this.DropdownFieldEditor(element, eventObject)) {
        //                eventObject.cancelBubble = true;
        //                eventObject.returnValue = false;
        //            }
        //        }
        //    }
        //}

        var moveFocusDirection = DCInputFieldManager.getMoveFocusHotKeyDirection(element, eventObject);
        if (moveFocusDirection == 1 || moveFocusDirection == -1) {
            // 根据快捷键在各个输入域之间来回切换。
            DCDropdownControlManager.CloseDropdownControl();
            DCInputFieldManager.moveFocusEvent(element, moveFocusDirection, eventObject);
        } //if
    }
    else if (eventName == "ondblclick") {
        if (DCInputFieldManager.IsActiveEditor(element, "MouseDblClick")) {
            if (this.DropdownFieldEditor(element, eventObject)) {
                eventObject.cancelBubble = true;
                eventObject.returnValue = false;
                return false;
            }
        }
    }

    else if (eventName == "onclick") {
        //aler(element.nodeName);
        if (element.nodeName == "SELECT") {
            DCInputFieldManager.CheckLisItems(element);
            return true;
        }
        if (DCInputFieldManager.IsActiveEditor(element, "MouseClick")
            || DCInputFieldManager.IsActiveEditor(element, "GotFocus")) {
            if (this.DropdownFieldEditor(element, eventObject)) {
                eventObject.cancelBubble = true;
                eventObject.returnValue = false;
                return false;
            }
        }
    }
    else if (eventName == "onchange") {
        // 元素内容发生改变
        element.Modified = true;
        DCInputFieldManager.UpdateInputFieldClassName(element);
        if (element.nodeName == "SELECT") {
            this.SetSelectElementWidth(element);
        }
        else {
            // 执行数据校验
            DCInputFieldManager.ValueValidate(element);
        }

        //内容修改后，需给对应属性赋值
        // DCInputFieldManager.UpdateInnerValue(element);
        //var innerValue = element.innerText;
        //element.setAttribute("dc_innervalue", innerValue);

        var className = element.getAttribute("class");
        if (element.nodeName == "SELECT"
            || element.nodeName == "INPUT"
            || element.nodeName == "TEXTAREA"
            || (element.nodeName == "SPAN" && className != null && className.indexOf("InputField") >= 0)) {
            DCWriterExpressionManager.ExecuteEffectExpression(element);
        }
    }
    return true;
};

//wyc20210204:新增验证最大输入长度与限制输入字符
DCInputFieldManager.validateMaxInputLength = function (element, eventObject) {
    var permitcodes = [8, 46,];//无条件允许退格键与删除键
    if (permitcodes.indexOf(eventObject.keyCode) != -1) {
        return true;
    }
    if (element.hasAttribute("dc_maxinputlength") == false) {
        return true;
    } else {
        var length = parseInt(element.getAttribute("dc_maxinputlength"));
        if (isNaN(length) == true) {
            return true;
        } else {
            var text = DCWriterControllerEditor.GetElementText(element);
            if (text.length >= length) {
                return false;
            } else {
                return true;
            }
        }
    }
};
DCInputFieldManager.validateLimitedInputChars = function (element, eventObject) {
    var permitcodes = [8, 46,];//无条件允许退格键与删除键
    if (permitcodes.indexOf(eventObject.keyCode) != -1) {
        return true;
    }
    if (element.hasAttribute("dc_limitedinputchars") == false) {
        return true;
    } else {
        var limitedchars = element.getAttribute("dc_limitedinputchars").split('');
        if (limitedchars.length > 0 && eventObject != null && eventObject.key) {
            var i = limitedchars.indexOf(eventObject.key);
            if (i == -1) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
};
///////////////////////////////////////////////////////

DCInputFieldManager.UpdateInnerValue = function (element) {
    if (element.nodeName == "SPAN") {
        var newValue = "";
        var itemCount = element.getAttribute("itemcount");
        if (itemCount != null && itemCount.length > 0) {
            // 下拉列表方式 
        }
        else {

            var newValue2 = DCInputFieldManager.GetInnerValule(element);
            //for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
            //    var node = element.childNodes[iCount];
            //    if (node.nodeType == 3) {
            //        newValue = newValue + node.nodeValue;
            //    }
            //    else if (node.nodeType == 1) {
            //        if (node.getAttribute("dcignore") != "1") {
            //            newValue = newValue + node.innerText;
            //        }
            //    }
            //}//for
            element.setAttribute("dc_innervalue", newValue2);
            return true;
        }
    } else if (element.nodeName == "INPUT") {
        //WYC20190823：先简单防御一下如果没有值就复制TEXT的
        // var innervalue = element.getAttribute("dc_innervalue");
        // if (innervalue == null || innervalue == "" || innervalue == undefined) {
        //     var text = DCWriterControllerEditor.GetElementText(element);
        //     element.setAttribute("dc_innervalue", text);
        // }
        //xym 20201026 负固定宽度输入域的innervalue实时更新
        var text = DCWriterControllerEditor.GetElementText(element);
        element.setAttribute("dc_innervalue", text);
    }
    return false;
};

DCInputFieldManager.GetInnerValule = function (rootElement) {
    var newValue = "";
    for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
        var node = rootElement.childNodes[iCount];
        if (node.nodeType == 3) {
            newValue = newValue + node.nodeValue;
        }
        else if (node.nodeType == 1) {
            if (node.nodeName == "INPUT"
                || node.nodeName == "TEXTAREA"
                || node.nodeName == "SELECT") {
                newValue = newValue + node.value;
            }
            else if (node.getAttribute("dcignore") != "1") {
                newValue = newValue + DCInputFieldManager.GetInnerValule(node);
            }
        }
    }//for
    //WYC20200515:临时处理一下时间类型输入域在前端的innervalue出现特殊空字符的问题
    var editstyle = rootElement.getAttribute("dc_innereditstyle");
    if (editstyle != null && editstyle != "Numeric" && editstyle != "DropdownList") {
        newValue = newValue.replace(/\s/, " ");
    }
    return newValue;
};

// WYC20190522：添加工具函数，专用于设置输入域的起始与结束 字符是否可改
DCInputFieldManager.setFieldStartEndSpanEditable = function (element, editable) {
    if (DCInputFieldManager.IsInputFieldElement(element) == false ||
        (editable !== true && editable !== false)) {
        return;
    }
    var bstart = false;
    var bend = false;
    for (var i = 0; i < element.childNodes.length; i++) {
        if (element.childNodes[i].getAttribute("dctype") === "start") {
            element.childNodes[i].setAttribute("contenteditable", editable);
            bstart = true;
        }
        if (element.childNodes[i].getAttribute("dctype") === "end") {
            element.childNodes[i].setAttribute("contenteditable", editable);
            bend = true;
        }
        if (bstart === true && bend === true) {
            break;
        }
    }
};

DCInputFieldManager.moveFocusEvent = function (element, moveFocusDirection, eventObject) {
    var targetField = DCInputFieldManager.GetMoveToInputField(element, moveFocusDirection);
    if (targetField != null) {
        DCDomTools.processMoveCaret("pre");//wyc20201123:表单下暂时放开用于解决69火狐的兼容性问题
        DCDomTools.completeEvent(eventObject);
        DCWriterControllerEditor.SetFocus(targetField);
        DCDomTools.processMoveCaret("post");//wyc20201123:恢复表单下设置
        DCInputFieldManager.FocusAdjacent("afterBegin", targetField);//xuyiming 20200610 修改tab光标在输入域内部
        ///////////////////////////////////////
        if ((element.nodeName == "INPUT" || element.nodeName == "SELECT" || element.nodeName == "TEXTAREA")
            && document.activeElement) {
            if (document.activeElement == element) {
                // 没有成功的切换,再次尝试不同的方法
                if (element.blur) {
                    element.blur();
                    DCWriterControllerEditor.SetFocus(targetField);
                }
            }
        }

        if (DCDomTools.IsInVisibleArea(targetField, DCWriterControllerEditor.getFixedHeaderHeight()) == false) {
            // 不在可视区域，则滚动视图
            if (targetField.scrollIntoView) {
                targetField.scrollIntoView();
            }
            else {
                DCDomTools.ScrollIntoView(targetField);
            }
            DCWriterControllerEditor.fixScrollPositionForFixedHeader();
        }
        if (document.WriterControl.DocumentOptions != null) {
            var _FastInputMode = DCDomTools.toBoolean(document.WriterControl.DocumentOptions.BehaviorOptions.FastInputMode, false);
            if (_FastInputMode == true) {
                setTimeout(function () {
                    // 20200702 xym 解决快速录入时光标偶然不跳转问题
                    DCInputFieldManager.FocusAdjacent("afterBegin", targetField);

                    // 清除不参与移动的输入域
                    DCInputFieldManager.HandleInputFieldEvent(eventObject, targetField, "onclick");
                    DCInputFieldManager.HandleInputFieldEvent(eventObject, targetField, "ondblclick");
                });
            }
        }
        return false;
    } else if (DCWriterControllerEditor.IsFormView() == true) {
        DCWriterControllerEditor.SetFocus(element);
        DCInputFieldManager.FocusAdjacent("afterBegin", element);//xuyiming 20200610 修改tab光标在输入域内部
    }
}

// @method 获得需要移动到的输入域
DCInputFieldManager.GetMoveToInputField = function (element, moveIndex) {
    var inputs = DCInputFieldManager.getAllInputFields(false, true);
    var _index = $.inArray(element, inputs);
    var tabindex = element.getAttribute("dc_tabindex");
    if (tabindex != null && isNaN(parseInt(tabindex)) == false) {
        tabindex = parseInt(tabindex);
    }
    var _moveIndex = isNaN(parseInt(moveIndex)) ? 0 : parseInt(moveIndex);
    if (tabindex) {
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].getAttribute("dc_tabindex") == tabindex + _moveIndex) {
                return inputs[i];
            }
        }
    } else {
        if (_index + _moveIndex > -1 && _index + _moveIndex < inputs.length) {
            return inputs[_index + _moveIndex];
        }
    }
};

//
// 获得移动焦点方向。
// 参数 element :要判断的元素 eventObject 键盘按键按下事件参数
// 返回  -1：向前移动；0:不移动；1:向后移动.
DCInputFieldManager.getMoveFocusHotKeyDirection = function (element, eventObject) {
    var moveFocusHotKey = element.getAttribute("rmfhk");
    var result = 0;
    var moveToNextField = false;
    if (moveFocusHotKey == "Tab") {
        if (eventObject.keyCode == 9) {
            if (eventObject.shiftKey == true) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    else if (moveFocusHotKey == "Enter") {
        if (eventObject.keyCode == 13) {
            if (eventObject.shiftKey == true) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    return 0;
};



// 上下键控制下拉选中  符良柱2018-1-9
function keyselect() {
    if (document.getElementById("divDropdownContainer") != null
        && document.getElementById("divDropdownContainer") != "undifined") {
        if (document.getElementById("divDropdownContainer").style.display == "none") {
            return;
        } else {
            var mid = document.getElementById("divDropdownContainer");
            var zj = mid.firstChild;
            var ej = mid.lastChild;
            //给mid设置事件的监听
            window.document.onkeydown = function (ent) {
                if (document.getElementById("divDropdownContainer").style.display == "none") {
                    return;
                } else {
                    var div = document.getElementById("divDropdownContainer");
                    var event = ent || window.event;
                    function getMoveNode(arr, NowNode, MoveDirection) {
                        if (NowNode == null) {
                            if (MoveDirection == 1) {
                                return arr[0];
                            } else if (MoveDirection == -1) {
                                return arr[arr.length - 1];
                            }
                        }
                        if (NowNode.id == "selecteddropdownlistitem" && NowNode.className.indexOf("selected") == -1) {
                            return NowNode;
                        }
                        var _index = $.inArray(NowNode, arr);
                        var MoveIndex = _index + MoveDirection;
                        if (MoveIndex < 0) {
                            MoveIndex = arr.length - 1;
                        } else if (MoveIndex > arr.length - 1) {
                            MoveIndex = 0;
                        }
                        return arr[MoveIndex];
                    }
                    if (event.keyCode == 38 || event.keyCode == 40) {
                        if (div.currentElement.getAttribute("dc_innereditstyle") != "DropdownList") {
                            return;
                        }
                        var arr = DCDomTools.allChildNodes(div, 1);
                        for (var i = 0; i < arr.length; i++) {
                            if ($(arr[i]).is(":hidden") || arr[i].getAttribute("dcignore")) {
                                arr.splice(i, 1);
                                i--;
                            }
                        }
                        var selectDom = $(arr).filter(".selected")[0] || $(arr).filter("#selecteddropdownlistitem")[0];
                        switch (event.keyCode) {
                            case 38: //上
                                var Node = getMoveNode(arr, selectDom, -1);
                                break;
                            case 40: //下
                                var Node = getMoveNode(arr, selectDom, 1);
                                break;
                        }
                        $(Node).addClass("selected").css({ "border": "1px solid blue" });
                        if (Node != selectDom) {
                            $(selectDom).removeClass("selected").css({ "border": "1px solid white" });
                        }
                        if (Node != null) {
                            // 20200702 xym 下拉菜单过长时跳转到当前选中的项目
                            var a = $(Node).height();
                            var b = $(Node).offset().top;
                            var c = Node.parentElement.offsetHeight;
                            var e = $(Node).parent().offset().top;
                            if (a + b - e > c || a + b - e < 0) {
                                $(Node).parent().scrollTop($(Node).parent().scrollTop() + b - e);
                            }
                        }
                        ent.handled = true;
                        ent.cancelBubble = false;
                        ent.returnValue = false;
                    }
                }
            }
        }
    }
};




//**************************************************************************************************************
DCInputFieldManager.IsActiveEditor = function (element, modeName) {
    var mode = element.getAttribute("dc_editoractivemode");
    if (mode == null || mode.length == 0) {
        mode = "F2 MouseDblClick Program";
    }
    if (mode == "Default") {
        var documentoptions = document.WriterControl.DocumentOptions;
        var defaultMode = documentoptions.BehaviorOptions.DefaultEditorActiveMode;
        if (defaultMode == null || defaultMode.length == 0) {
            return false;
        } else {
            return defaultMode.indexOf(modeName) >= 0;
        }
    }
    else {
        return mode.indexOf(modeName) >= 0;
    }
};


//**************************************************************************************************************
// 检查下拉列表项目
DCInputFieldManager.CheckLisItems = function (element) {
    if (DCWriterControllerEditor.readonly == true) {
        // 编辑器控件整体是只读的，不操作
        return;
    }
    if (element.getAttribute("ircr") == "true") {
        // 元素内容只读
        return;
    }
    var editMode = element.getAttribute("dc_innereditstyle");
    if (editMode != "DropdownList" && element.nodeName != "SELECT") {
        // 不是下拉列表编辑模式
        return;
    }
    if (element.nodeName == "SELECT") {
        if (element.options.length > 0) {
            // 已经有下拉选项
            return;
        }
    }
    // 准备动态加载下拉列表项目
    if (element.listItems == null) {
        var listitemcount = parseInt(element.getAttribute("itemcount"));
        if (isNaN(listitemcount) == false && listitemcount > 0) {
            var items = new Array();
            element.listItems = items;
            for (var iCount = 0; iCount < listitemcount; iCount++) {
                var item = new Object();
                item.Text = element.getAttribute("lt" + iCount);
                item.Value = element.getAttribute("lv" + iCount);
                item.TextInList = element.getAttribute("lz" + iCount);//20200806 xym 修复指定列表文本无效问题
                items.push(item);
            } //for
            return;
        }
        var listSourceName = element.getAttribute("dc_innerlistsourcename");
        //添加动态加载列表属性并根据其加载动态下拉列表事件 2019-08-26 hulijun
        var dynamicListItems = element.getAttribute("dc_dynamiclistitems");
        if ((listSourceName != null && listSourceName.length > 0) || (dynamicListItems != null && dynamicListItems == "true")) {

            // 填充列表项目的函数
            var funcFillListItems = function (sourceElement, jsonObj) {
                sourceElement.listItems = jsonObj;
                if (sourceElement.nodeName == "SELECT") {
                    // 填充下拉列表
                    DCDomTools.removeAllChilds(sourceElement);
                    for (var iCount = 0; iCount < jsonObj.length; iCount++) {
                        var item = jsonObj[iCount];
                        var opt = document.createElement("option");
                        opt.value = item.Value;
                        if (item.TextInList != null && item.TextInList.length > 0) {
                            opt.appendChild(document.createTextNode(item.TextInList));
                        }
                        else {
                            opt.appendChild(document.createTextNode(item.Text));
                        }
                        sourceElement.appendChild(opt);
                    }
                }
                if (sourceElement.nodeName != "SELECT") {
                    // 20200619 xuyiming 阻止动态下拉列表进行二次加载
                    // if (DCSelectionManager.GetCurrentInputField() == sourceElement) {
                    //     // 如果当前输入域还是这个输入域，则弹出下拉列表
                    //     var html = DCInputFieldManager.BuildListHtml(element);
                    //     if (html != null && html.length > 0) {
                    //         DCDropdownControlManager.DropdownControl(element, html);
                    //     }
                    // }
                }
            };


            // 动态加载下拉列表的函数 **************************************************
            var funcLoadListItemsByJsonUrl = function (sourceElement, jsonUrl) {
                // 加载成功后的回调函数
                var funcReadListItems = function (responseText, okFlag, sourceElement, xmlhttp) {
                    if (okFlag == true
                        && responseText != null
                        && responseText.length > 0
                        && responseText.indexOf("[") >= 0) {
                        // 删除加载标志
                        if (sourceElement.stateFlagImg != null) {
                            sourceElement.stateFlagImg.parentNode.removeChild(sourceElement.stateFlagImg);
                            sourceElement.stateFlagImg = null;
                        }
                        // 加载成功，获得json格式的对象
                        var jsonObj = DCDomTools.ParseJSON(responseText);
                        funcFillListItems(sourceElement, jsonObj);
                    }
                    else {
                        // 加载不成功
                        sourceElement.listItems = new Array();
                        if (sourceElement.stateFlagImg != null) {
                            sourceElement.stateFlagImg.src = DCWriterControllerEditor.servicePageURL + "?dcwres=Flag_Error.png";
                            var errTitle = DCDomTools.GetTitleFromHtml(responseText);
                            if (xmlhttp != null) {
                                errTitle = "加载列表数据错误，错误代码:" + xmlhttp.status + "." + errTitle;
                            }
                            sourceElement.stateFlagImg.setAttribute("title", errTitle);
                        }
                    }
                };
                // 异步远程加载下拉列表
                var stateFlagImg = element.stateFlagImg;
                if (stateFlagImg == null) {
                    stateFlagImg = document.createElement("img");
                }
                else {
                    stateFlagImg.onclick = null;
                }
                stateFlagImg.setAttribute("title", "");
                stateFlagImg.setAttribute("dcignore", "1");
                stateFlagImg.setAttribute("unselectable", "on");
                stateFlagImg.setAttribute("contenteditable", "false");
                stateFlagImg.setAttribute("align", "bottom");
                stateFlagImg.src = DCWriterControllerEditor.servicePageURL + "?dcwres=Loading16.gif";
                var p = element.parentNode;
                if (element.nextSibling == null) {
                    p.appendChild(stateFlagImg);
                }
                else {
                    p.insertBefore(stateFlagImg, element.nextSibling);
                }
                element.stateFlagImg = stateFlagImg;
                // DCDomTools.GetContentByUrl(jsonUrl, true, funcReadListItems, element);
                // 20200624 xuyiming 修改后台加载动态下拉列表事件为同步加载
                DCDomTools.PostContentByUrlNotAsyncHasCallback(jsonUrl, true, funcReadListItems, element);
            };
            //***********************************************************************************


            var clientFunc = document.DCGetClientEventHandler("EventQueryListItems");
            if (clientFunc != null) {
                // 调用客户端脚本事件来加载下拉列表内容
                var args2 = new Object();
                args2.PageName = document.body.getAttribute("pagename");
                args2.ControlName = element.id;
                args2.WriterControl = document.WriterControl;
                args2.Document = document;
                args2.Element = element;
                args2.ListSourceName = listSourceName;
                args2.Handled = false;
                args2.Result = null;

                // 添加列表项目
                args2.AddResultItem = function (item) {
                    if (this.Result == null) {
                        this.Result = new Array();
                    }
                    this.Result[this.Result.length] = item;
                };
                // 添加列表项目
                args2.AddResultItemByTextValue = function (strText, strValue) {
                    if (this.Result == null) {
                        this.Result = new Array();
                    }
                    var item2 = new Object();
                    item2.Text = strText;
                    item2.Value = strValue;
                    this.Result[this.Result.length] = item2;
                };
                // 添加列表项目
                args2.AddResultItemByTextValueTextInList = function (strText, strValue, strTextInList) {
                    if (this.Result == null) {
                        this.Result = new Array();
                    }
                    var item2 = new Object();
                    item2.Text = strText;
                    item2.Value = strValue;
                    item2.TextInList = strTextInList;
                    this.Result[this.Result.length] = item2;
                };
                args2.JsonUrl = null;
                var _return = clientFunc(args2);
                if (_return && typeof _return.then === "function") {
                    _return.then(function () {
                        if (args2.Result != null && args2.Result.length) {
                            funcFillListItems(element, args2.Result);
                            if (element.nodeName != "SELECT" && DCSelectionManager.GetCurrentInputField() == element) {
                                var html = DCInputFieldManager.BuildListHtml(element);
                                if (html != null && html.length > 0) {
                                    DCDropdownControlManager.DropdownControl(element, html);
                                }
                            }
                            return;
                        }
                    });
                }
                if (args2.Result != null && args2.Result.length) {
                    funcFillListItems(element, args2.Result);
                    return;
                }
                if (args2.JsonUrl != null && typeof (args2.JsonUrl) == "string" && args2.JsonUrl.length > 0) {
                    // 用户指定的JSON数据的URL地址
                    funcLoadListItemsByJsonUrl(this.Element, args2.JsonUrl);
                    return;
                }
                if (args2.Handled) {
                    // 事件被用户处理了，无需后续处理。
                    return;
                }
            }

            //if (DCWriterControllerEditor.HasServerEvent("EventQueryListItems") == true) 
            {
                // 调用服务器动态加载列表项目
                var url = DCWriterControllerEditor.servicePageURL + "?dcquerylistitems="
                    + encodeURI(listSourceName) + "&pagename="
                    + document.body.getAttribute("pagename") + "&controlname="
                    + document.body.getAttribute("controlname");
                funcLoadListItemsByJsonUrl(element, url);

            }
        }
    }
};



//**************************************************************************************************************
// 显示弹出式数值编辑器功能
DCInputFieldManager.DropdownFieldEditor = function (element, eventObject) {
    if (DCWriterControllerEditor.readonly === true) {
        // 编辑器控件整体是只读的，不操作
        return false;
    }
    if (element.getAttribute("ircr") === "true") {
        // 元素内容只读
        return false;
    }
    var editMode = element.getAttribute("dc_innereditstyle");
    if (editMode === null) {
        // 没有指定编辑模式
        return false;
    }
    if (DCDropdownControlManager.GetCurrentEditInputField() === element) {
        // 不重复显示
        return true;
    }
    DCDropdownControlManager.DisableDropdownControlDelay(0);
    var dropdownResult = false;

    // 准备动态加载下拉列表项目
    DCInputFieldManager.CheckLisItems(element);

    var setDateTimeValue = function (dates) {
        DCSelectionManager.DelayDetectSelectionChanged(1);
        var e2 = setDateTimeValue.currentElement;
        var txt = dates.toString();
        DCInputFieldManager.SetCurrentInputFieldValue(txt, txt, true, e2, true);
    };

    var showDateTimeControl = function (cusFormat, showTime) {
        DCSelectionManager.detectSelectionChanged();
        var funcGetElementText = function (element) {
            DCSelectionManager.DelayDetectSelectionChanged(1);
            return DCWriterControllerEditor.GetElementInnerValueString(element);
        };
        var funcSetElementText = function (element, text) {
            var sel = DCDomTools.getSelection();
            DCSelectionManager.DelayDetectSelectionChanged(1);
            DCInputFieldManager.SetCurrentInputFieldValue(text, text, false, element, false);
            DCWriterControllerEditor.SetFocus(element);
            DCInputFieldManager.RaiseAfterFieldContentEditEvent();
            DCInputFieldManager.ClickStartFastInputMode();
        };
        var c = DCDropdownControlManager.GetDropdownContainer();
        setDateTimeValue.currentElement = element;
        laydateReset();
        DCDomTools.removeAllChilds(c);
        if (document.body.getAttribute("ismobiledevice") == "true11111") {
            // 移动平台上
            var writerControl = document.WriterControl; // DCWriterControllerEditor.GetWriterControlElement();
            var title = element.getAttribute("dc_tooltip");
            if (title == null || title.length === 0) {
                title = element.getAttribute("name");
            }
            if (title == null || title.length === 0) {
                title = element.getAttribute("dc_backgroundtext");
            }
            if (title == null || title.length === 0) {
                title = element.getAttribute("id");
            }
            var frame = writerControl.ShowMaskDialog(245, 220, title);
            var options = new Object();
            options.elem = element;
            var targetDoc = frame.contentWindow.document;
            options.container = targetDoc.body;
            options.static = true;
            options.istime = showTime;
            options.choose = setDateTimeValue;
            options.eventObj = eventObject;
            options.format = cusFormat;
            options.getElementText = funcGetElementText;
            options.setElementText = funcSetElementText;
            options.allowCheck = false;
            options.handleDocuemntMouseUp = false;
            options.onclose = function () {
                writerControl.CloseMaskDialog();
                DCWriterControllerEditor.SetFocus(element);
            };
            targetDoc.body.style.padding = "0px";
            targetDoc.body.style.margin = "0px";
            targetDoc.body.style.overflow = "hidden";
            DCDomTools.createCssLinkElement(
                targetDoc,
                document.body.getAttribute('servicepageurl') + "?dcwres=dcwriter.css");
            laydate(options);
            dropdownResult = true;
            var child = c.firstChild;
            if (child !== null) {
                c.style.padding = "0px";
                c.style.width = "245px";
                c.style.height = "220px";
                if (document.body.getAttribute("ismobiledevice") === "true") {
                    // 在移动平台上，隐藏键盘
                    var btn = document.getElementById("laydate_ok");
                    if (btn != null) {
                        DCDomTools.setActive(btn);
                    }
                }
            }
        }
        else {
            var options = new Object();
            options.elem = element;
            options.container = c;
            options.static = true;
            options.istime = showTime;
            options.choose = setDateTimeValue;
            options.eventObj = eventObject;
            options.format = cusFormat;
            options.getElementText = funcGetElementText;
            options.setElementText = funcSetElementText;
            options.allowCheck = false;
            options.handleDocuemntMouseUp = false;
            options.onclose = function () {
                var sel = DCDomTools.getSelection();
                DCDropdownControlManager.CloseDropdownControl();
                DCWriterControllerEditor.SetFocus(element);

            };
            laydate(options);
            var child = c.firstChild;
            if (child != null) {
                c.style.padding = "0px";
                c.style.width = "245px";
                c.style.height = "220px";
                c.style.overflow = "hidden";
                c.style.overflowX = "hidden";
                c.style.overflowY = "hidden";
                DCDropdownControlManager.DropdownControl(element, null);
                dropdownResult = true;
            }
        }
    };
    if (document.WriterControl != null
        && typeof (document.WriterControl.EventDropdownEditor) == "function") {
        var dropdownOptions = new Object();
        dropdownOptions.element = element;
        var c = DCDropdownControlManager.GetDropdownContainer();
        while (c.lastChild != null) {
            c.removeChild(c.lastChild);
        }
        dropdownOptions.container = c;
        //dropdownOptions.container = DCDropdownControlManager.GetDropdownContainer(true);
        dropdownOptions.handled = false;
        dropdownOptions.cancel = false;
        // 设置数值
        dropdownOptions.setValue = function (newText, newValue) {
            if (newValue == null) {
                newValue = newText;
            }
            DCInputFieldManager.SetCurrentInputFieldValue(newText, newValue, true, element, true);
            // 自定义弹出框添加快速录入模式和引发EventAfterFieldEdit事件
            DCInputFieldManager.RaiseAfterFieldContentEditEvent();
            DCInputFieldManager.ClickStartFastInputMode();
        };
        // 关闭下拉列表
        dropdownOptions.close = function () {
            DCDropdownControlManager.CloseDropdownControl();
        };

        document.WriterControl.EventDropdownEditor.call(document.WriterControl, dropdownOptions);
        if (dropdownOptions.cancel == true) {
            // 用户取消操作
            return;
        }
        if (c.lastChild != null) {
            // 用户处理了,提供了自定义的下拉列表内容。
            DCDropdownControlManager.DropdownControl(
                element,
                html,
                funcMoveItem,
                dropdownOptions);
            return true;
        }
    }

    //wyc20200605:引发BeforeFieldContentEditEvent事件
    DCInputFieldManager.RaiseBeforeFieldContentEditEvent();

    if (editMode == "DropdownList") {
        // 下拉列表
        var funcMoveItem = function (eventObject) {
            // 键盘上下光标键来移动当前项目
            if (eventObject == null) {
                return;
            }
            if (eventObject.keyCode == 39) {
            }
        };
        var html = this.BuildListHtml(element);
        if (html != null && html.length > 0) {
            var sel = DCSelectionManager.getSelection();
            if (sel.GetCurrentInputField() != element) {
                // 20100117 xuyiming 修复在输入域边缘点击弹出下拉框时无法修改文本问题
                DCInputFieldManager.FocusAdjacent("beforeBegin", element);
            }
            DCSelectionManager.detectSelectionChanged();
            DCDropdownControlManager.DropdownControl(element, html, funcMoveItem);
            dropdownResult = true;
        }
    }
    else if (editMode == "Date") {
        showDateTimeControl("YYYY-MM-DD", false);

        //                this.FixInputElementDom(element);
        //                var e = element.contentNode;
        //                e.id = "date_" + Math.random();
        //                var div = this.GetDropdownContainer();
        //                div.currentElement = element;
        //                setDateTimeValue.currentElement = element;
        //                laydate({ elem: '#' + e.id, istime: false, format: 'YYYY-MM-DD', choose: setDateTimeValue });
    }
    else if (editMode == "DateTime") {
        showDateTimeControl("YYYY-MM-DD hh:mm:ss", true);
        //debugger;
        //                this.FixInputElementDom(element);
        //                var e = element.contentNode;
        //                //                var id = "date_111111";
        //                //                e.id = id;
        //                var div = this.GetDropdownContainer();
        //                div.currentElement = element;
        //                setDateTimeValue.currentElement = element;
        //                laydate({ elem: e, istime: true, format: 'YYYY-MM-DD hh:mm:ss', choose: setDateTimeValue, container: this.GetDropdownContainer() });
    }
    else if (editMode === "DateTimeWithoutSecond") {
        showDateTimeControl("YYYY-MM-DD hh:mm", true);
    }
    else if (editMode == "Time") {
        var c = DCDropdownControlManager.GetDropdownContainer();
        c.style.width = "auto";
        c.style.height = "auto";
        DCDomTools.removeAllChilds(c);
        c.innerHTML = '<div id="time" style="padding:10px;"><div style="margin-bottom:20px;"><span><input type="number" name="hh"> 时</span><span><input type="number" name="mm"> 分</span><span><input type="number" name="ss"> 秒</span></div><p><input type="button" value="确定" id="time_sub"><input type="button" value="取消" id="time_exit"></p></div>';
        DCDropdownControlManager.DropdownControl(element, null);
        //单击激活 2019-06-20 xuyiming
        dropdownResult = true;
        var time = document.getElementById("time");
        var inputs = time.querySelectorAll("input[type=number]");
        var _date = new Date();
        var localTime = {
            "hh": _date.getHours(),
            "mm": _date.getMinutes(),
            "ss": _date.getSeconds()
        }; //当前时间
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].style.width = "70px";
            inputs[i].style.lineHeight = "20px";
            inputs[i].style.border = "1px solid #000";
            inputs[i].parentElement.style.paddingRight = "10px";
            //赋值 当前时间
            inputs[i].value = localTime[inputs[i].getAttribute("name")];
            if (inputs[i].value.length == 1) {//长度为1时，前面加上0
                inputs[i].value = "0" + inputs[i].value;
            }
            //输入时事件
            inputs[i].oninput = function () {
                if (this.value.slice(0, 1) == "0") {
                    this.value = this.value.slice(-2);
                } else {
                    this.value = this.value.slice(0, 2);
                }
                if (this.getAttribute("name") == "hh") {
                    if (this.value > 23) { this.value = 0 };
                    if (this.value < 0) { this.value = 23 };
                } else {
                    if (this.value > 59) { this.value = 0 };
                    if (this.value < 0) { this.value = 59 };
                }
                if (this.value.length == 1) { this.value = '0' + this.value };
            }
        }
        document.getElementById("time_sub").onclick = function () {
            var setTime = {};
            for (var i = 0; i < inputs.length; i++) {
                setTime[inputs[i].getAttribute("name")] = inputs[i].value;
            }
            var str = setTime["hh"] + ":" + setTime["mm"] + ":" + setTime["ss"];
            // element.innerText = str; //赋值
            DCInputFieldManager.SetCurrentInputFieldValue(str, str, false, element, false);
            closeDrop();
            DCInputFieldManager.RaiseAfterFieldContentEditEvent();
            DCInputFieldManager.ClickStartFastInputMode();
        }
        document.getElementById("time_exit").onclick = function () {
            closeDrop();
        }
        function closeDrop() {
            DCDropdownControlManager.CloseDropdownControl();
            DCInputFieldManager.FocusAdjacent("afterbegin", element);
        }
    }
    else if (editMode === "Numeric") {
        //xym 20200720 添加功能：BehaviorOptions.EnableCalculateControl可以启用停用数字小键盘
        if (document.WriterControl.DocumentOptions != null) {
            var _EnableCalculateControl = DCDomTools.toBoolean(document.WriterControl.DocumentOptions.BehaviorOptions.EnableCalculateControl, true);
        }
        if (_EnableCalculateControl !== false) {
            var _keyBoard = DCInputFieldManager.keyBoard(element);
            _keyBoard.openKeyBoard('请输入数字', document.WriterControl.GetElementTextByID(element), _keyBoard.keyModels.PLUS, function (number) {
                // DCWriterControllerEditor.SetElementText(element, number);
                // DCWriterControllerEditor.SetFocus(element);
                // DCInputFieldManager.FocusAdjacent("beforeEnd", element);
            });
            DCDropdownControlManager.DropdownControl(element, null);
            dropdownResult = true;
        }
    }
    var dcv = DCDropdownControlManager.isDropdownControlVisible();
    if (dropdownResult === false || dcv === false) {
        //alert("false");
    }
    return dropdownResult;
};

DCInputFieldManager.clearAllFields = function () {
    $("span[dctype='XTextInputFieldElement']").each(function () {
        DCInputFieldManager.clearFieldContent(this);
    });
}
// 清空输入域的内容
DCInputFieldManager.clearFieldContent = function (element) {
    this.SetCurrentInputFieldValue("", "", true, element, true);
}

DCInputFieldManager.SetCurrentInputFieldValue = function (
    text,
    innerValue,
    autoClose,
    element,
    enableEffectExpression) {
    //debugger;
    if (element == null) {
        var div = DCDropdownControlManager.GetDropdownContainer();
        if (div != null) {
            element = div.currentElement;
        }
    }

    //Debug.writeln("开始 " + element.id + "=" + text);
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        //alert("设置失败 " + element );
        if (autoClose) {
            DCDropdownControlManager.CloseDropdownControl();
        }
        return;
    }

    var setFoucs = DCSelectionManager.GetCurrentInputField() == element;
    if (text == null) {
        text = "";
    }
    else {
        text = text.toString();
    }

    //BSDCWRIT-104------hulijun----20210112-------单选下拉列表  实现有无列表--多选框也可使用------------
    var listvalueformatstring = element.getAttribute("dc_listvalueformatstring");
    if (listvalueformatstring
        && (listvalueformatstring.indexOf("[includelist]") >= 0 || listvalueformatstring.indexOf("[excludelist]") >= 0)
        && element.getAttribute("dc_innereditstyle") == "DropdownList"
        && element.getAttribute("dc_innermultiselect") != "true") {

        var inneritemspliter = element.getAttribute("dc_inneritemspliter");
        if (!inneritemspliter) {
            inneritemspliter = ",";
        }

        var listItems = element.listItems;
        var itemSelected = false;
        var includelistStr = "";
        var excludelistStr = "";
        for (var i = 0; i < listItems.length; i++) {
            var itemText = listItems[i].Text;
            var itemValue = listItems[i].Value;

            if (!itemSelected && itemValue && itemValue == innerValue) {
                includelistStr = itemText;
                itemSelected = true;
            } else if (!itemSelected && !itemValue && itemText == innerValue) {
                includelistStr = itemText;
                itemSelected = true;
            } else {
                excludelistStr += itemText + inneritemspliter;
            }
        }
        excludelistStr = excludelistStr.substring(0, excludelistStr.length - 1);

        var resultText = "";
        resultText = listvalueformatstring.replace(/\[includelist\]/g, includelistStr);
        resultText = resultText.replace(/\[excludelist\]/g, excludelistStr);
        text = resultText;
    }
    //--------------------------------

    var formatText = "";
    if (text == null || text.length == 0) {
        formatText = "";
    }
    else {
        formatText = DCWriterControllerEditor.GetFormatedText(element, text);
    }
    if (innerValue == null) {
        innerValue = "";
    }
    else {
        innerValue = innerValue.toString();
        //WYC20200515:临时处理一下时间类型输入域在前端的innervalue出现特殊空字符的问题
        var editstyle = element.getAttribute("dc_innereditstyle");
        if (editstyle != null && editstyle != "Numeric" && editstyle != "DropdownList") {
            innerValue = innerValue.replace(/\s/, " ");
            //wyc20200608：如果是日期类型的输入域，则过滤掉赋值当中的时分秒信息
            if (editstyle == "Date") {
                innerValue = innerValue.substring(0, innerValue.indexOf(" "));
            }
        }
    }

    //BSDCWRIT-90 hulijun 
    var oldText = element.getAttribute("dc_innertext");
    if (oldText != text) {
        DCWriterControllerEditor.HandleEventChangeContent();
    }
    element.setAttribute("dc_innervalue", innerValue);
    element.setAttribute("dc_innertext", text);

    if (element.nodeName == "INPUT") {
        // 对于 input 标签直接设置数值
        if (element.value != formatText) {
            element.value = formatText;
            DCInputFieldManager.UpdateInputFieldClassName(element);
        }
    }
    else {
        // 清空有效内容
        for (var iCount = element.childNodes.length - 1; iCount >= 0; iCount--) {
            var node = element.childNodes[iCount];
            if (node.nodeName && node.nodeName == "#text") {
                element.removeChild(node);
            }
            else if (node.getAttribute && node.getAttribute("dcignore") !== "1") {
                element.removeChild(node);
                //DCInputFieldManager.FixHeaderInputClass(node, element);
            }
        }
        var result = 0;
        for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
            var node = element.childNodes[iCount];
            if (node.nodeName == "#text") {
                result = iCount;
                break;
            }
            else if (node.getAttribute) {
                var dctype = node.getAttribute("dctype");
                if (dctype == "backgroundtext"
                    || dctype == "unit"
                    || dctype == "end") {
                    result = iCount;
                    break;
                }
            }
        } //for
        var text = formatText.toString().replace(/ /g, "&ensp;");
        text = text.replace(/\r\n/g, "<br dcpf='1'>");
        var tszf = "<span>" + text + "</span>";
        var node = $(tszf)[0];
        DCDomTools.inertHTML(element, result, node.innerHTML, true);
        element.Modified = true;
        DCInputFieldManager.UpdateInputFieldClassName(element);
    }
    if (autoClose) {
        DCDropdownControlManager.CloseDropdownControl(null, false);
    }
    // xuyiming 20200103 修复设置输入域文本时也需要修改empty
    element.setAttribute("empty", formatText != "" ? "" : 1);
    DCInputFieldManager.FixInputElementDom(element);
    DCInputFieldManager.ValueValidate(element);
    //alert(element.id + " " + text + " " + element.innerText);
    if (enableEffectExpression) {
        DCWriterExpressionManager.ExecuteEffectExpression(element);
    }
    if (setFoucs) {
        //        var func22 = new function () {
        //            //var e = document.getElementById(this.eid);
        //            DCWriterControllerEditor.SetFocus(window.currentElement);
        //            window.currentElement = null;
        //        };
        //        window.currentElement = element;
        var sLeft = document.body.scrollLeft;
        var sTop = document.body.scrollTop;
        DCWriterControllerEditor.SetFocus(element);
        DCInputFieldManager.FocusAdjacent("beforeEnd", element);
        //window.setTimeout("DCWriterControllerEditor.SetFocus('" + element.id + "');", 500);
        //var func = new function () {
        //        if (element.nodeName == "INPUT") {
        //            DCDomTools.MoveCaretToIndex(element, 0);
        //        }
        //        else {
        //            DCDomTools.MoveCaretToIndex(element, 1);
        //        }
        //        //        }
        //        //        window.setTimeout(func, 100);
    }
    DCDomTools.BubbleRaiseChanged(element);
    if (DCUndoRedo || DCUndoRedo.LogUndo) {
        DCUndoRedo.LogUndo();
    }
};


//**************************************************************************************************************
//设置多选下拉框
DCInputFieldManager.SetMultiSelectedInputFieldValue = function () {
    var div = DCDropdownControlManager.GetDropdownContainer();
    var hasArr = [], unhasArr = [];//有无数组
    if (div != null) {
        var element = div.currentElement;
        if (element != null) {
            //var inputs = div.getElementsByTagName("INPUT");//所有input，包括按钮
            var inputs = div.querySelectorAll("input[type='checkbox']");//所有复选框
            var spliter = element.getAttribute("dc_inneritemspliter");
            if (spliter == null || spliter.length == 0) {
                spliter = ",";
            }
            var resultText = "";
            var resultValue = "";
            if (element.getAttribute("dc_getvalueorderbytime") == "true") {
                //下拉菜单按点击时间排序
                if (!element.getAttribute("clickTimeArr")) {
                    element.setAttribute("clickTimeArr", clickTimeArr);
                    clickTimeArr = [];

                }
                var clickTimeArr3 = element.getAttribute("clickTimeArr").split(",");
                //console.log(clickTimeArr3);
                var clickTimeArr2 = [];
                for (var iCount = 0; iCount < inputs.length; iCount++) {
                    var input = inputs[iCount];
                    var input_time = input.parentNode.getAttribute("clickTime");
                    if (input.checked && (!clickTimeArr3[iCount] || clickTimeArr3[iCount] < input_time)) {
                        clickTimeArr3[iCount] = input_time;
                    }
                }
                for (var iCount = 0; iCount < inputs.length; iCount++) {
                    clickTimeArr2[iCount] = clickTimeArr3[iCount];
                }
                //数组排序
                var t = 0;
                for (var i = 0; i < clickTimeArr2.length; i++) {
                    for (var j = i + 1; j < clickTimeArr2.length; j++) {
                        if (clickTimeArr2[i] > clickTimeArr2[j]) {
                            t = clickTimeArr2[i];
                            clickTimeArr2[i] = clickTimeArr2[j];
                            clickTimeArr2[j] = t;
                        }
                    }
                }
                //下拉菜单按点击时间排序
                //console.log(clickTimeArr);
                //console.log(clickTimeArr2);
                for (var j = 0; j < inputs.length; j++) {
                    for (var iCount = 0; iCount < inputs.length; iCount++) {
                        var input = inputs[iCount];
                        if (input.checked && clickTimeArr2[j] == clickTimeArr3[iCount]) {//下拉菜单按点击时间排序
                            hasArr.push(input);
                        } else if (!input.checked && clickTimeArr2[j] == clickTimeArr3[iCount]) {
                            unhasArr.push(input);
                        }
                    }
                } //for
                element.setAttribute("clickTimeArr", clickTimeArr3);//下拉菜单按点击时间排序
            } else {
                for (var iCount = 0; iCount < inputs.length; iCount++) {
                    var input = inputs[iCount];
                    if (input.checked) {
                        hasArr.push(input);
                    } else {
                        unhasArr.push(input);
                    }
                }
            }
            //数组去重
            function unique(arr) {
                var hash = [];
                for (var i = 0; i < arr.length; i++) {
                    if (hash.indexOf(arr[i]) == -1) {
                        hash.push(arr[i]);
                    }
                }
                return hash;
            }
            hasArr = unique(hasArr);
            unhasArr = unique(unhasArr);
            // 20200506 xuyiming 修复BS版多选输入域BUG
            for (var i = 0; i < hasArr.length; i++) {
                if (resultText.length > 0) {
                    resultText += spliter;
                    resultValue += spliter;
                }
                resultText += hasArr[i].getAttribute("text2");
                resultValue += hasArr[i].getAttribute("value2");
            }
            //20190506 有无列表
            //具有dc_listvalueformatstring属性,值可自定义（信息1,信息2）【使用英文逗号分隔】，呈现(信息1a、b，信息2c)
            var listvalueformatstring = element.getAttribute("dc_listvalueformatstring");
            if (listvalueformatstring && (listvalueformatstring.indexOf("[includelist]") >= 0 || listvalueformatstring.indexOf("[excludelist]") >= 0)) {
                var ttt = "";
                var listArr = element.getAttribute("dc_listvalueformatstring").split(",");
                for (var j = 0; j < listArr.length; j++) {
                    var arr = listArr[j].split('[');
                    var listStr1 = arr[0];//有
                    var listStr2 = arr[1].split(']')[0];//includelist
                    if (listStr2 == "includelist" && hasArr.length > 0) {
                        ttt += listStr1;
                        for (var i = 0; i < hasArr.length; i++) {
                            ttt += hasArr[i].getAttribute("text2");
                            if (i + 1 < hasArr.length) {
                                ttt += spliter;
                            }
                        }
                        ttt += ",";
                    }
                    else if (listStr2 == "excludelist" && unhasArr.length > 0) {
                        ttt += listStr1;
                        for (var i = 0; i < unhasArr.length; i++) {
                            ttt += unhasArr[i].getAttribute("text2");
                            if (i + 1 < unhasArr.length) {
                                ttt += spliter;
                            }
                        }
                        ttt += ",";
                    }
                }
                ttt = ttt.substring(0, ttt.length - 1);
                resultText = ttt;
            }
            this.SetCurrentInputFieldValue(resultText, resultValue, false, null, true);
        }
    }
    DCDropdownControlManager.CloseDropdownControl();
};

//**************************************************************************************************************
DCInputFieldManager.BuildListHtml = function (element) {
    //debugger;
    var listItems = element.listItems;
    if (listItems == null || listItems.length == 0) {
        return "";
    }
    var itemsize = DCDomTools.GetSizeFromSpecifyFont(
        DCInputFieldManager.FontName,
        DCInputFieldManager.FontSize);

    var itemHeight = itemsize;//17;
    var div = DCDropdownControlManager.GetDropdownContainer();
    //    var itemCount = parseInt(element.getAttribute("listitemcount"));
    //    if (itemCount == NaN) {
    //        return "";
    //    }
    var multiSelect = element.getAttribute("dc_innermultiselect") == "true";
    //multiSelect = true;
    var html = "";
    // 计算最大文本宽度
    var maxTextLength = 4;
    for (var iCount = 0; iCount < listItems.length; iCount++) {
        var txt = listItems[iCount].TextInList; // element.getAttribute("listtextinlist" + iCount);
        if (txt == null || txt.length == 0) {
            txt = listItems[iCount].Text;
        }
        if (txt != null && txt.length > 0) {
            var byteLength = 0;
            for (var ci = 0; ci < txt.length; ci++) {
                if (txt.charCodeAt(ci) < 0x7f) {
                    byteLength = byteLength + itemsize;//bytelength++
                }
                else {
                    byteLength += 2;
                }
            } //for
            maxTextLength = Math.max(maxTextLength, byteLength);
        }
    }
    maxTextLength = Math.min(maxTextLength, 20);
    var divWidth = maxTextLength * 8;
    var divHeight = listItems.length * (itemHeight + 2);
    if (multiSelect) {
        divHeight += 25;
    }
    //debugger;
    var eleft = DCDomTools.GetViewLeftInDocument(element);
    var etop = DCDomTools.GetViewLeftInDocument(element);
    var eheight = element.offsetHeight;
    var maxHeight = DCDomTools.GetDocumentClientHeight() * 0.4; // Math.max(this.clientHeight - etop - eheight, etop) * 0.8;
    if (maxHeight > 600) {
        maxHeight = 600;
    }
    divHeight = Math.min(divHeight, maxHeight);
    divWidth = Math.min(divWidth, DCDomTools.GetDocumentClientWidth() * 0.5);
    divWidth = Math.max(divWidth, 120);

    div.style.width = divWidth + "px";
    div.style.height = divHeight + "px";
    div.style.fontFamily = this.FontName;
    div.style.fontSize = this.FontSize;
    var selectedIndex = -1;
    var checkInnerValue = true;
    var text = element.getAttribute("dc_innervalue");
    if (text == null || text.length == 0) {
        text = DCInputFieldManager.GetFieldText(element);
        checkInnerValue = false;
    }
    // 有无列表的修复
    var listvalueformatstring = element.getAttribute("dc_listvalueformatstring");//有[includelist],无[excludelist]
    if (listvalueformatstring && (listvalueformatstring.indexOf("[includelist]") >= 0 || listvalueformatstring.indexOf("[excludelist]") >= 0)) {
        var listArr1 = listvalueformatstring.split("[");
        var listArr = [];
        for (var i = 0; i < listArr1.length; i++) {
            var listArr2 = listArr1[i].split("]");
            for (var j = 0; j < listArr2.length; j++) {
                if (listArr2[j] != "") {
                    listArr.push(listArr2[j]);
                }
            }
        }
        var textIndexArr = [];
        for (var i = 0; i < listArr.length; i++) {
            if (text.indexOf(listArr[i]) != -1) {
                textIndexArr.splice(i, 0, [text.indexOf(listArr[i]), listArr[i]]);
            }
        }
        var textArr = [];
        for (var i = 0; i < textIndexArr.length; i++) {
            if (textIndexArr[0][0] != 0) {
                textArr.push(text.substring(0, textIndexArr[0][0]));
            }
            textArr.push(text.substring(textIndexArr[i][0], textIndexArr[i][0] + textIndexArr[i][1].length));
            if (i + 1 < textIndexArr.length) {
                textArr.push(text.substring(textIndexArr[i][0] + textIndexArr[i][1].length, textIndexArr[i + 1][0]));
            } else if (i + 1 == textIndexArr.length) {
                textArr.push(text.substring(textIndexArr[i][0] + textIndexArr[i][1].length));
            }
        }
        var obj = {};
        for (var i = 0; i < listArr.length; i++) {
            obj[listArr[i]] = textArr[i];
        }
        if (obj.hasOwnProperty("includelist") && obj["includelist"] != undefined) {
            text = obj["includelist"];
        } else if (obj.hasOwnProperty("excludelist") && obj["excludelist"] != undefined) {
            var spliter = element.getAttribute("dc_inneritemspliter") || ",";
            var excludelist = obj["excludelist"].split(spliter);
            text = "";
            for (var i = 0; i < listItems.length; i++) {
                if (checkInnerValue) {
                    var str = listItems[i]["Value"];
                } else {
                    var str = listItems[i]["Text"];
                }
                if (excludelist.indexOf(str) == -1) {
                    text += str + spliter;
                }
            }
            text = text.substring(0, text.length - 1);
        } else {
            // 20191024 xuyiming 暂时修复目前的有无选下拉框问题（全部不点选时，再次点开下拉框，会默认勾选除第一个的其他项）
            if (element.getAttribute("dc_innertext").substring(0, 1) == "无") {
                text = "";
            }
        }
    }
    var selectedItems = null;
    if (multiSelect) {
        // 多选
        div.style.overflowY = "";
        div.style.overflowX = "";
        var spliter = element.getAttribute("dc_inneritemspliter");
        if (spliter == null || spliter.length == 0) {
            spliter = ",";
        }
        selectedItems = text.split(spliter);

        // //列表格式化判断 2019-07-26 hulijun
        // var listvalueformatstring = element.getAttribute("dc_listvalueformatstring");
        // if (listvalueformatstring && listvalueformatstring.length > 0 && spliter != ",") {
        //     var hasArr = text.split(',');
        //     var flagHas = true;
        //     for (var i = 0; i < hasArr.length;i++){
        //         if (flagHas && hasArr[i].substring(0, 1) == "有") {
        //             var hasStr = hasArr[i].substring(1, hasArr[i].length);
        //             selectedItems = hasStr.split(spliter);
        //             flagHas = false;
        //         }
        //     }
        // } else if (listvalueformatstring && listvalueformatstring.length > 0 && spliter == ",") {
        //     var flagStart = false;
        //     var copyArr = new Array();
        //     for (var i = 0; i < selectedItems.length; i++) {
        //         if (selectedItems[i].substring(0, 1) == "有") {
        //             selectedItems[i] = selectedItems[i].substring(1, selectedItems[i].length);
        //             flagStart = true;
        //         }
        //         if (selectedItems[i].substring(0, 1) == "无") {
        //             flagStart = false;
        //         }
        //         if (flagStart) {
        //             copyArr.push(selectedItems[i]);
        //         }
        //     }
        //     selectedItems = copyArr;
        // }


        html = html + "<div style='overflow-y:auto;height:" + (divHeight - 25) + ";cursor:default' dcignore='1'>";
    }
    else {
        // 单选
        div.style.overflowY = "auto";
        div.style.overflowX = "hidden";
    }
    div.style.wordBreak = "keep-all";

    for (var iCount = 0; iCount < listItems.length; iCount++) {
        var listText = listItems[iCount].Text; // element.getAttribute("listtext" + iCount);
        var listValue = listItems[iCount].Value; // element.getAttribute("listvalue" + iCount);
        var listTextInList = listItems[iCount].TextInList; // element.getAttribute("listtextinlist" + iCount);
        if (listValue == null || listValue.length == 0) {
            listValue = listText;
        }
        var selected = false;
        // 判断是被选择的内容
        if (multiSelect) {
            for (var index = 0; index < selectedItems.length; index++) {
                if (checkInnerValue) {
                    if (listValue != null && listValue.length > 0) {
                        if (selectedItems[index] == listValue) {
                            selectedItems.splice(index, 1);
                            index--;
                            selected = true;
                            break;
                        }
                    }
                }
                else {
                    if (listText != null && listText.length > 0) {
                        if (selectedItems[index] == listText) {
                            selectedItems.splice(index, 1);
                            index--;
                            selected = true;
                            break;
                        }
                    }
                }
            }
        }
        else {
            if (checkInnerValue) {
                selected = listValue == text;
            }
            else {
                selected = listText == text;
            }
        }
        //BSDCWRIT-89 hulijun 20201225
        var disText = listTextInList || listText;//显示内容
        html = html + "<div title='" + disText + "'  style='height:" + itemHeight + "px;padding-left:3px;cursor:default;border-width:1px;border-style:solid;border-color:white;UNSELECTABLE:on;word-break:keep-all;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;";
        if (selected) {
            if (multiSelect || selectedIndex < 0) {
                html = html + "background-color:#A8CDF1;"
            }
        }
        // xuyiming 20200604 添加生成下拉列表时输出value值
        html = html + "' value='" + listValue + "'";
        if (multiSelect == false) {
            html = html + " onclick=\"DCInputFieldManager.SetCurrentInputFieldValue('" + listText + "','" + listValue + "'  , true , null , true );DCDomTools.completeEvent(event);DCInputFieldManager.RaiseAfterFieldContentEditEvent();DCInputFieldManager.ClickStartFastInputMode();\"";
        }
        else {
            html = html + " onclick=\"DCInputFieldManager.SetListItemChecked( event , this , " + iCount + ");DCDomTools.completeEvent(event);\"";
        }

        html = html + " onmousemove=\"this.style.borderColor='#0000ff';DCDomTools.completeEvent(event);\" onmouseout=\"this.style.borderColor='white';DCDomTools.completeEvent(event);\"";
        if (selected && selectedIndex < 0) {
            html = html + " id='selecteddropdownlistitem' ";
            selectedIndex = iCount;
        }
        html = html + ">";
        if (multiSelect) {
            html = html + "<input type=checkbox dcignore='1' id='dcdropdowncheckbox" + iCount + "'  value2=\"" + listValue + "\" text2=\"" + listText + "\" style='vertical-align:middle;' ";
            if (selected) {
                html = html + " checked='true'";
            }
            html = html + "/>";
        }
        var disText = "";
        if (listTextInList == null || listTextInList.length == 0) {
            disText = listText;
        }
        else {
            disText = listTextInList;
        }
        html = html + disText;
        html = html + "</div>";
    } //for
    if (multiSelect) {
        html = html + "</div>";
        html = html + "<div style='text-align:center;border-top-color:black;border-top-style:solid;border-top-width:1px;background-color:buttonface;padding-top:2px' dcignore='1'>";
        html = html + "<input type='button' value='" + document.GetDCWriterString("JS_OK") + "' onclick='DCInputFieldManager.SetMultiSelectedInputFieldValue();DCDomTools.completeEvent(event);DCInputFieldManager.RaiseAfterFieldContentEditEvent();DCInputFieldManager.ClickStartFastInputMode(); '  />";
        html = html + "<input type='button' id='btnCancelDropdown' value='" + document.GetDCWriterString("JS_Cancel") + "' onclick='DCDropdownControlManager.CloseDropdownControl();DCDomTools.completeEvent(event);'  /></div>";
    }
    //alert(html);
    // 20200702 xuyiming 修改为输入域勾选动态加载时清除缓存
    var dynamicListItems = element.getAttribute("dc_dynamiclistitems");
    if (dynamicListItems != null && dynamicListItems == "true") {
        element.listItems = null;
    }
    return html;
};

//**************************************************************************************************************
DCInputFieldManager.SetListItemChecked = function (eventObject, element, index) {
    var input = element.ownerDocument.getElementById("dcdropdowncheckbox" + index);
    if (input == null) {
        return;
    }
    //debugger;
    if (eventObject.srcElement != input) {
        input.checked = !input.checked;
    }
    if (input.checked) {
        element.style.backgroundColor = "#A8CDF1";
        element.setAttribute("clickTime", ++clickTime); //下拉菜单按点击时间排序
    }
    else {
        element.style.backgroundColor = "transparent";
    }
    clickTimeArr[index] = element.getAttribute("clickTime");//下拉菜单按点击时间排序
    //console.log(element.innerText + "和" + element.getAttribute("clickTime"));
    DCDomTools.BubbleRaiseChanged(element);
    //20190814 xuyiming 解决多选下拉菜单选择勾选框无法选中选项
    setTimeout(function () {
        if (element.style.backgroundColor == "transparent") {
            input.checked = false;
        } else {
            input.checked = true;
        }
    }, 100);
};


//**************************************************************************************************************
DCInputFieldManager.GetFieldText = function (element) {
    var result = "";
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.nodeName && node.nodeName == "#text") {
            result = result + node.nodeValue;
        }
        else if (node.getAttribute) {
            if (node.getAttribute("dcignore") != "1") {
                result = result + DCDomTools.GetInnerText(node);
            }
        }
    }
    return result;
};


// 隐藏背景文字
DCInputFieldManager.HideBackgroundText = function (element) {
    if (DCInputFieldManager.IsInputFieldElement(element) == false) {
        return false;
    }
    var sel = DCSelectionManager.getSelection();
    var anchorElement = null;
    var curNode = sel.currentContainer;
    while (curNode != null) {
        if (curNode.parentNode == element) {
            break;
        }
        curNode = curNode.parentNode;
    }
    var sel = DCSelectionManager.getSelection();
    var result = false;
    for (var iCount = element.childNodes.length - 1; iCount >= 0; iCount--) {
        var node = element.childNodes[iCount];
        if (node.getAttribute && node.getAttribute("dctype") == "backgroundtext") {
            element.removeChild(node);
            result = true;
            //node.style.display = "none";
        }
    }
    var sel2 = DCSelectionManager.getSelection();
    if (result) {
        DCWriterControllerEditor.oldSelection = DCSelectionManager.getSelection();
        //        if (curNode != null) {
        //            DCWriterControllerEditor.MoveCaretTo(curNode);
        //            var sel2 = DCWriterControllerEditor.getSelection();
        //        }
    }
    return result;
};

// 启动输入域控制器
DCInputFieldManager.Start = function () {
    var selects = document.getElementsByTagName("SELECT");
    for (var iCount = 0; iCount < selects.length; iCount++) {
        var select = selects[iCount];
        if (DCMultiDocumentManager.isInDocument(select)) {
            DCInputFieldManager.SetSelectElementWidth(select);
        }
    }
};

DCInputFieldManager.SetSelectElementWidth = function (element) {
    if (element == null) {
        return;
    }
    //return;
    if (element.getAttribute("autowidth") != "true") {
        // 没有设置自动宽度
        return;
    }

    var maxWidth = 10000;
    var parentCell = DCDomTools.getParentSpecifyNodeName(element, "TD");
    if (parentCell != null) {
        maxWidth = parentCell.clientWidth - 2;
        if (maxWidth < 20) {
            maxWidth = 20;
        }
    }
    var fw = element.getAttribute("fixedcontentwidth");
    if (fw == null || fw.length == 0) {
        // 设置宽度
        var setWidth = false;
        var zoomRate = parseFloat(document.body.style.zoom);
        if (isNaN(zoomRate) == true) {
            zoomRate = 1;
        }
        if (element.selectedIndex >= 0) {
            var opt = element.options[element.selectedIndex];
            var w = opt.getAttribute("pixelwidth");
            if (w != null && w.length > 0) {
                var fw = parseFloat(w);
                fw = Math.max(fw, 15);
                fw = fw + 40;
                fw = Math.min(fw, maxWidth);
                element.style.width = fw + "px";
                setWidth = true;
            }
        }
        if (setWidth == false) {
            element.style.width = "";
        }
    }

};

DCInputFieldManager.CreateStartBorderText = function (inputElement) {
    var span = document.createElement("span");
    span.setAttribute("dctype", "start");
    span.setAttribute("dcignore", "1");
    span.style.color = DCInputFieldManager.GetRuntimeBorderColor(inputElement);
    span.appendChild(document.createTextNode("["));
    return span;
};
// 绑定输入域的背景文本标签元素的事件
DCInputFieldManager.BindBackgroundLabelEvent = function (lbl, inputElement) {
    if (lbl == null) {
        return;
    }
    if (inputElement == null) {
        inputElement = lbl.parentNode;
    }
    if (inputElement != null
        && inputElement.getAttribute("dctype") == "XTextInputFieldElement") {
        function IsPC() {
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        }
        lbl.onclick = function (eventObject) {
            var inputElement = this.parentNode || this.parentElement;
            // xuyiming 20190911 解决普通文字输入域（非单选多选的），在没有值的情况下，点击这个输入域无法调出输入法(移动端情况下)
            // WYC20190911：在输入域为纯文本时才进行这样的处理，否则下拉出不来
            // var editMode = inputElement.getAttribute("dc_innereditstyle");
            // if ((editMode == null || editMode == "Numeric") && IsPC() == false) {
            //     // $(this).remove();
            // }
            if (inputElement.isContentEditable == true && IsPC() == false) {
                $(this).attr("contenteditable", true);
            }
            var _this = this;
            var func33 = function () {
                DCDomTools.MoveCaretToEnd(inputElement.firstChild);
                $(_this).attr("contenteditable", false);
                // DCInputFieldManager.FixInputElementDom(inputElement);
                DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentclick");
            };
            window.setTimeout(func33, 50);
        }
    }
};

// 初始化背景文字标签元素
DCInputFieldManager.CreateBackgroundTextLabel = function (inputElement) {
    var lbl = null;
    if (document.IsIE7 == true) {
        lbl = document.createElement("span");
    }
    else {
        lbl = document.createElement("label");
    }

    lbl.setAttribute("dctype", "backgroundtext");
    lbl.setAttribute("atomicselection", "true");
    lbl.setAttribute("contenteditable", "false");
    if (document.IsIE7 == true) {
        lbl.setAttribute("unselectable", "on");
    }
    lbl.setAttribute("dcignore", "1");
    if (inputElement != null) {
        lbl.style.color = inputElement.getAttribute("rbtc");
    }
    DCInputFieldManager.BindBackgroundLabelEvent(lbl, inputElement);
    //lbl.onfocus = function () {
    //    alert("lbl.focus");
    //};

    return lbl;
};

//伍贻超20190307：获取运行时的输入域边框元素的颜色，先从dc_borderelementcolor中取，取不到或透明，再从bordertextcolor中取
DCInputFieldManager.GetRuntimeBorderColor = function (inputElement) {
    var c = inputElement.getAttribute("dc_borderelementcolor");
    if (c == null || c.length == 0 || c == "transparent") {
        return inputElement.getAttribute("bordertextcolor");
    } else {
        return c;
    }
};

//伍贻超20191021：处理前端select元素的多选下拉输入域的多选数据处理
DCInputFieldManager.HandleMultipleSelectField = function (element) {
    if (element.tagName != "SELECT" || element.getAttribute("dctype") != "XTextInputFieldElement") {
        return;
    }

    var selectedNodes = element.querySelectorAll(":checked");
    var allNodes = element.childNodes;
    for (var i = 0; i < allNodes.length; i++) {
        var selected = "false";
        for (var j = 0; j < selectedNodes.length; j++) {
            if (allNodes[i] === selectedNodes[j]) {
                selected = "true";
                break;
            }
        }
        allNodes[i].setAttribute("selected", selected);
    }
};


//属性值表达式 (TextColor)
//2019-06-05 xuyiming
DCInputFieldManager.propertyexpressions = function (element) {
    //debugger;
    if (!element.getAttribute("dc_propertyexpressions")) {
        return false;
    }
    var dc_propertyexpressions = element.getAttribute("dc_propertyexpressions"); //TextColor:IF([field1]=='阳性','red','blue');ToolTip:IF([field1]=='阳性','阳性','阴性')
    if (dc_propertyexpressions.indexOf(";;") != -1) {
        var expressions = dc_propertyexpressions.split(";;");
    } else if (dc_propertyexpressions.indexOf(";") != -1) {
        var expressions = dc_propertyexpressions.split(";");
    } else {
        var expressions = [dc_propertyexpressions];
    }
    var options = {};
    for (var i = 0; i < expressions.length; i++) {
        var objArr = expressions[i].split(":");
        options[objArr[0]] = objArr[1];
    }
    if (options.hasOwnProperty("TextColor")) {
        var ifStr = options["TextColor"].replace(/['"]/g, "");//清除单引号、双引号
        if (ifStr.indexOf("IF") >= 0) {
            function round(element, ifStr) {
                ifStr = ifStr.substring(3, ifStr.length - 1);//清除IF()
                var firstIndex = ifStr.indexOf(",");
                var secondIndex = ifStr.indexOf(",", firstIndex + 1);
                var firstStr = ifStr.slice(0, firstIndex);
                var secondStr = ifStr.slice(firstIndex + 1, secondIndex);
                var thirdStr = ifStr.slice(secondIndex + 1);
                var next_index = firstStr.indexOf("]");
                var prev_index = firstStr.indexOf("[");
                var id = firstStr.substring(prev_index + 1, next_index);
                var inputElement = document.getElementById(id);
                var val = firstStr.split("=")[firstStr.split("=").length - 1];
                if (DCInputFieldManager.GetFieldText(inputElement) == val) {
                    element.style.color = secondStr;
                } else {
                    if (thirdStr.indexOf("IF") >= 0) {
                        round(element, thirdStr);
                    } else {
                        element.style.color = thirdStr;
                    }
                }
            }
            round(element, ifStr);
        }
    }
}

// 启动快速录入
DCInputFieldManager.ClickStartFastInputMode = function () {
    if (document.WriterControl.DocumentOptions != null) {
        var _FastInputMode = DCDomTools.toBoolean(document.WriterControl.DocumentOptions.BehaviorOptions.FastInputMode, false);
        if (_FastInputMode == true) {
            var field = DCSelectionManager.GetCurrentInputField();
            var eventObject = window.event;
            DCInputFieldManager.moveFocusEvent(field, 1, eventObject);
        }
    }
}

//WYC20200227:引发EventAfterFieldEdit事件
DCInputFieldManager.RaiseAfterFieldContentEditEvent = function () {
    var field = DCSelectionManager.GetCurrentInputField();
    var ctl = document.WriterControl;
    if (ctl != null && ctl.EventAfterFieldContentEdit != null
        && typeof (ctl.EventAfterFieldContentEdit) == "function") {
        ctl.EventAfterFieldContentEdit.call(ctl, field);
    }
};


//WYC20200605:引发EventBeforeFieldEdit事件
DCInputFieldManager.RaiseBeforeFieldContentEditEvent = function () {
    var field = DCSelectionManager.GetCurrentInputField();
    var ctl = document.WriterControl;
    if (ctl != null && ctl.EventBeforeFieldContentEdit != null
        && typeof (ctl.EventBeforeFieldContentEdit) == "function") {
        ctl.EventBeforeFieldContentEdit.call(ctl, field);
    }
};

//xuyiming 20200612:引发EventFieldOnFocus事件
DCInputFieldManager.RaiseFieldOnFocusEvent = function (element) {
    var ctl = document.WriterControl;
    if (FocusElement == element) {
        return;
    }
    FocusElement = element;
    if (ctl != null && ctl.EventFieldOnFocus != null
        && typeof (ctl.EventFieldOnFocus) == "function") {
        ctl.EventFieldOnFocus.call(ctl, element);
    }
};

//xuyiming 20200612:引发EventOnBlurField事件
DCInputFieldManager.RaiseFieldOnBlurEvent = function (element) {
    var ctl = document.WriterControl;
    if (ctl != null && ctl.EventFieldOnBlur != null
        && typeof (ctl.EventFieldOnBlur) == "function") {
        ctl.EventFieldOnBlur.call(ctl, element);
    }
};

//wyc20210121：新增创建并插入标签元素
DCInputFieldManager.InsertLabelElement = function (options) {
    var LabelElement = DCInputFieldManager.createLabelElement(options);
    if (LabelElement == null || DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextLabelElement") == false) {
        return;
    }
    var sel = DCSelectionManager.LastSelectionInfo;
    if (sel == null) {
        sel = DCSelectionManager.getSelection();
    }
    if (sel.currentContainer != null && LabelElement != null) {
        DCWriterControllerEditor.InsertElementAtCurentPosition(LabelElement, true);
    }
};
DCInputFieldManager.createLabelElement = function (options) {
    var txt = "标签文本";
    var label = document.createElement("SPAN");
    //某些属性暂时写死
    label.setAttribute("dctype", "XTextLabelElement");
    label.contentEditable = false;
    if (options) {
        if (options.Bold === true || options.Bold === "true") {
            label.style.fontWeight = "bold";
        }
        if (options.ID) {
            label.id = options.ID.toString();
        }
        if (options.Text) {
            txt = options.Text.toString();
        }
        if (options.Deletable === false || options.Deletable === "false") {
            label.setAttribute("dc_deleteable", "false")
        }
        if (options.TitleLevel != null) {
            var i = parseInt(options.TitleLevel);
            if (i != null && i >= 0 && i <= 7) {
                label.setAttribute("dc_titlelevel", i.toString());
            }
        }
        if (typeof (options.Attributes) == "object") {
            DCDomTools.SetElementCustomAttributes(label, options.Attributes);
        }
    }
    label.setAttribute("dc_text", txt);
    label.innerText = txt;
    return label;
};
//////////////////////////////////////

DCInputFieldManager.keyBoard = function (element) {
    var keyBoardDiv, keyBoard, commit, dialog, input, label, span, table, tbody, tr, td;
    var keyBoardClick, keyBoardDivClick;
    // DCDropdownControlManager.DropdownControl(element, null);
    // var body = document.getElementsByTagName("body")[0];
    var keyModels = {
        SIMPLE: {
            COLS: 3,
            WIDTH: '33.3%',
            TYPE: 1,
            KEYS: [7, 8, 9, 4, 5, 6, 1, 2, 3, '-', 0, '<']
        },
        PLUS: {
            COLS: 4,
            WIDTH: '25%',
            TYPE: 1,
            KEYS: [7, 8, 9, 'C', 4, 5, 6, '↑', 1, 2, 3, '↓', '-', 0, '.', '<']
        }
    };
    var currModel;
    var inputText = "",
        currText, fixed = 0,
        offset = -1;
    return {
        openKeyBoard: openKeyBoard,
        keyModels: keyModels
    };

    function openKeyBoard(notice, initNumber, model, callbackEvery, callbackLast, openCallback) {
        var _this = this;
        // 参数置换
        if (typeof model === "function") {
            closeCallback = openCallback;
            openCallback = callbackLast;
            callbackLast = callbackEvery;
            callbackEvery = model;
            model = undefined;
        }
        // UI
        model = model || keyModels.SIMPLE;
        if (!keyBoardDiv || model !== currModel) {
            inputText = "";
            currModel = model;

            // if (keyBoardDiv) {
            //     body.removeChild(keyBoardDiv);
            // }

            // 键盘上的对话框
            dialog = document.createElement("DIV");
            label = document.createElement("DIV");
            span = document.createElement("SPAN");
            input = document.createElement("SPAN");
            commit = document.createElement("BUTTON");

            dialog.className = 'qs-keyBoard-dialog';
            commit.innerHTML = "完成";
            input.className = "qs-inset-input";
            input.style.textAlign = 'center';
            input.style.overflow = "hidden";
            input.style.textOverflow = "ellipsis";
            label.appendChild(input);
            label.appendChild(commit);
            dialog.appendChild(span);
            dialog.appendChild(label);
            input.innerHTML = inputText = (initNumber + "") || "";
            span.innerHTML = notice || '';
            keyBoardDiv = document.createElement("DIV");

            // 键盘部分
            keyBoard = document.createElement("DIV");
            table = document.createElement("TABLE");
            tbody = document.createElement("TBODY");
            keyBoard.className = "qs-key-board";
            keyBoard.id = 'qs-keyboard-id';
            table.border = '0';
            for (var i = 0; i < currModel.KEYS.length; i++) {
                if (i % currModel.COLS === 0) {
                    tr = document.createElement("TR");
                }
                if (currModel.KEYS[i] || currModel.KEYS[i] === 0) {
                    td = document.createElement("TD");
                    td.style.width = currModel.WIDTH;
                    if (typeof (currModel.KEYS[i]) === "object") {
                        currModel.KEYS[i].icon ? td.className = currModel.KEYS[i].icon : td.innerHTML = currModel.KEYS[i].text;
                        currModel.KEYS[i].rows && td.setAttribute('rowspan', currModel.KEYS[i].rows);
                        td.setAttribute("qs-data-value", currModel.KEYS[i].text);
                    } else {
                        td.innerHTML = currModel.KEYS[i];
                        td.setAttribute("qs-data-value", currModel.KEYS[i]);
                    }
                    tr.appendChild(td);
                }
                if (i % currModel.COLS === currModel.COLS - 1) {
                    tbody.appendChild(tr);
                }
            }
            table.appendChild(tbody);
            keyBoard.appendChild(dialog);
            keyBoard.appendChild(table);
            keyBoardDiv.appendChild(keyBoard);
            var s = ".qs-key-board{background-color:white;width:100%;}.qs-keyBoard-dialog{padding:5px 10px;background-color:white;box-shadow:inset 0px 5px 15px#efefef;}.qs-keyBoard-dialog>div{display:flex;height:30px;}.qs-keyBoard-dialog>div>button{width:6em;}.qs-keyBoard-dialog>span{font-size:14px;display:block;padding:2px;color:#999999;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;}.qs-key-board>table{width:100%;background-color:#efefef;border-spacing:6px;border-collapse:separate;}.qs-key-board tr{height:1.5rem;}.qs-key-board td{width:33.3%;border:solid 1px#dedede;border-radius:6px;-webkit-border-radius:6px;font-size:1.5rem;text-align:center;vertical-align:middle;background-color:white;}.qs-key-board td:active{background-color:#dedede;}.qs-inset-input{position:relative;display:inline-block;border-radius:3px;-webkit-border-radius:3px;margin-right:10px;border:none;font-size:18px!important;width:100%;height:30px!important;line-height:30px;background-color:rgb(238,238,238)!important;}";
            var style = document.createElement("style");
            style.innerHTML = s;
            keyBoardDiv.appendChild(style);
            // body.appendChild(keyBoardDiv);
            var c = DCDropdownControlManager.GetDropdownContainer();
            c.style.width = "220px";
            c.style.height = "auto";
            DCDomTools.removeAllChilds(c);
            c.appendChild(keyBoardDiv);
            // c.style.height = "220px";

        }
        // 监听事件
        keyBoardDivClick = function () {
            inputText = inputText === '-' ? '' : inputText;
            callbackLast && callbackLast(inputText ? Number(inputText) : '');
        };

        keyBoardClick = function (e) {
            switch (e.target.nodeName) {
                case 'TD':
                    DCDomTools.completeEvent(e);
                    doKeys(e);
                    break;
                case 'BUTTON':
                    var value = parseFloat(input.innerHTML);
                    if (isNaN(value) == true) {
                        value = 0;
                    }
                    DCInputFieldManager.SetCurrentInputFieldValue(value, value, true, element, true);
                    DCInputFieldManager.RaiseAfterFieldContentEditEvent();
                    DCInputFieldManager.ClickStartFastInputMode();
                    break;
                default:
                    DCDomTools.completeEvent(e);
                    break;
            }
        };
        function doKeys(e) {
            currText = e.target.getAttribute("qs-data-value");
            inputText = inputText === '0' ? '' : inputText;
            switch (currText) {
                case '-':
                    inputText = inputText.indexOf('-') === -1 ? '-' + inputText : inputText.slice(1);
                    break;
                case '.':
                    inputText = inputText ? inputText === '-' ? inputText = '-0.' : (inputText.indexOf('.') === -1 ? inputText + '.' : inputText) : '0.';
                    break;
                case '<':
                    inputText = inputText ? inputText.slice(0, -1) : '';
                    break;
                case 'C':
                    inputText = '';
                    break;
                case '↑':
                    inputText = calcNumber(inputText, 2);
                    break;
                case '↓':
                    inputText = calcNumber(inputText, 1);
                    break;
                default:
                    inputText = inputText === '-0' ? '-' : inputText;
                    inputText += currText;
                    break;
            }
            input.innerHTML = inputText;
            callbackEvery && callbackEvery(inputText ? parseFloat(inputText) : '');
        }

        function calcNumber(str, type) {
            //xym 20200720 修复数字小键盘逻辑错误
            if (str == '') {
                str = '0';
            }
            str = str === '-' ? "0" : str;
            offset = str.indexOf('.');
            fixed = offset > -1 ? str.length - offset - 1 : 0;
            str = Math.round(parseFloat(str) * Math.pow(10, fixed) + Math.pow(10, fixed) * Math.pow(-1, type)) / Math.pow(10, fixed);
            return str.toString();
        }

        // 注册监听事件
        keyBoard.addEventListener("click", keyBoardClick, false);
        keyBoardDiv.addEventListener("click", keyBoardDivClick, false);
    }
}