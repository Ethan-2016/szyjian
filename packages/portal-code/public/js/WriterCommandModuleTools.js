//********************************************************
// 工具相关的编辑命令功能
//********************************************************

var WriterCommandModuleTools = new Object();

//********************************************************
//获取文档导航 2019-07-03 hulijun
WriterCommandModuleTools.GetNavigator = function () {
    function creatObj(o) {
        var obj = new Object();
        obj.Element = o;
        obj.TitleLevel = Number(o.getAttribute("dc_titlelevel"));
        obj.Text = o.innerText;
        obj.Nodes = new Array();
        return obj;
    };

    var navigateNode = new Object();
    navigateNode.TitleLevel = -1;
    navigateNode.Nodes = new Array();
    navigateNode.Parent = null;
    
    var flag = null;

    $("span[dc_titlelevel],div[dc_titlelevel]").each(function (i, o) {
        var titlelevel = Number(o.getAttribute("dc_titlelevel"));
        var obj = creatObj(o);
        addNode(obj);
    });

    //$("div[dc_titlelevel]").each(function (i, o) {
    //    var titlelevel = Number(o.getAttribute("dc_titlelevel"));
    //    var obj = creatObj(o);
    //    addNode(obj);
    //});

    function addNode(node) {
        if (flag == null) {
            navigateNode.Nodes.push(node);
            node.Parent = navigateNode;
        } else {
            if (flag.TitleLevel < node.TitleLevel) {
                flag.Nodes.push(node);
                node.Parent = flag;
            } else if (flag.TitleLevel == node.TitleLevel) {
                flag.Parent.Nodes.push(node);
                node.Parent = flag.Parent;
            } else {
                var tempNode = flag.Parent;
                var finded = false;
                while (tempNode.TitleLevel > -1) {
                    if (tempNode.TitleLevel == node.TitleLevel) {
                        tempNode.Parent.Nodes.push(node);
                        node.Parent = tempNode.Parent;
                        finded = true;
                        break;
                    } else if (tempNode.TitleLevel < node.TitleLevel) {
                        tempNode.Nodes.push(node);
                        node.Parent = tempNode;
                        finded = true;
                        break;
                    }
                    tempNode = tempNode.Parent;
                }
                if (finded==false) {
                    navigateNode.Nodes.push(node);
                    node.Parent = navigateNode;
                }
            }
        }
        flag = node;
    }
    return navigateNode.Nodes;
}
//********************************************************
// 文档整体内容校验 袁永福2015-6-26
WriterCommandModuleTools.DocumentValueValidate = function (showUI) {
    var result = new Array();
    // 违禁关键字校验
    var excludeKeywords = document.body.getAttribute("excludekeywords");
    if (excludeKeywords != null && excludeKeywords.length > 0) {
        var keywords = excludeKeywords.split(',');
        var rangeBack = null;
        var sel4 = DCDomTools.getSelection();
        if (sel4 != null && sel4.rangeCount > 0) {
            rangeBack = sel4.getRangeAt(0);
        }
        var setRangeBack = false;
        for (var iCount = 0; iCount < keywords.length; iCount++) {
            var word = keywords[iCount];
            if (word.length == 0) {
                continue;
            }
            if (document.body.createTextRange) {
                var range = document.body.createTextRange();
                var index = 0;
                while (true) {
                    if (range.findText(word, 1, 0) == true) {
                        var obj = new Object();
                        obj.Element = null;
                        obj.ElementID = null;
                        obj.Message = document.GetDCWriterString("JS_ExcludeKeyword") + word;
                        obj.Type = "ExcludeKeyword";
                        obj.ExcludeKeywordText = word;
                        obj.Index = indexCount++;
                        obj.Range = range.duplicate();
                        obj.Select = function () {
                            DCDomTools.FoucsDocument();
                            this.Range.scrollIntoView();
                            this.Range.select();
                            if (this.Range.getBoundingClientRect) {
                                var rect = this.Range.getBoundingClientRect();
                                var fhh = DCWriterControllerEditor.getFixedHeaderHeight();
                                if (fhh > 0 && rect.top < fhh) {
                                    document.body.scrollTop -= fhh - rect.top;
                                }
                            }
                            //DCWriterControllerEditor.fixScrollPositionForFixedHeader();
                        };
                        result.push(obj);
                        range.move("character", 1); //range.text.length);
                    }
                    else {
                        break;
                    }
                } //while
            } //if
            else if (window.find) {
                // DCDomTools.MoveCaretTo(document.body);
                DCDomTools.MoveCaretToIndex(document.body, 0);
                while (window.find(word) == true) {
                    setRangeBack = true;
                    var sel = DCDomTools.getSelection();
                    if (sel.rangeCount > 0) {
                        var range = sel.getRangeAt(0);
                        var obj = new Object();
                        obj.Element = null;
                        obj.ElementID = "";
                        obj.Message = document.GetDCWriterString("JS_ExcludeKeyword") + word;
                        obj.Type = "ExcludeKeyword";
                        obj.ExcludeKeywordText = word;
                        obj.Index = indexCount++;
                        if (range.duplicate) {
                            obj.Range = range.duplicate();
                        }
                        else if (range.cloneRange) {
                            obj.Range = range.cloneRange();
                        }
                        else {
                            obj.Range = range;
                        }
                        obj.Select = function () {
                            DCDomTools.FoucsDocument();
                            var sel2 = DCDomTools.getSelection();
                            if (sel2.rangeCount > 0) {
                                sel2.removeAllRanges();
                            }
                            sel2.addRange(this.Range);
                            var node2 = this.Range.startContainer;
                            if (node2 != null && !node2.scrollIntoView) {
                                node2 = node2.parentNode;
                            }
                            if (node2 != null && node2.scrollIntoView) {
                                node2.scrollIntoView();
                            }
                            DCWriterControllerEditor.fixScrollPositionForFixedHeader();
                        };
                        result.push(obj);
                    }
                }
            }

        } //for
        if (setRangeBack == true && rangeBack != null) {
            var sel5 = DCDomTools.getSelection();
            if (sel5.rangeCount > 0) {
                sel5.removeAllRanges();
            }
            sel5.addRange(rangeBack);
        }
    } //if

    // 对输入域进行数据校验
    var fields = DCInputFieldManager.getAllInputFields(false);// 开放只读输入域的数据校验
    var indexCount = 0;
    if (fields != null && fields.length > 0) {
        for (var iCount = 0; iCount < fields.length; iCount++) {
            var field = fields[iCount];
            if (field.nodeName != "SPAN" && field.nodeName != "INPUT") {
                continue;
            }
            // 判断元素是否可见
            var visible = true;
            var node = field;
            while (node != null && node.style) {
                if (node.style.display == "none" || node.style.visibility == "hidden") {
                    visible = false;
                    break;
                }
                node = node.parentNode;
            }
            if (visible == false) {
                // 元素不可见
                continue;
            }
            var msg = DCInputFieldManager.ValueValidate(field);
            if (msg != null && msg.length > 0) {
                var obj = new Object();
                obj.Element = field;
                obj.ElementID = field.id;
                obj.Message = msg;
                obj.Type = "ValueValidate";
                obj.ExcludeKeywordText = null;
                obj.Index = indexCount++;
                obj.Select = function () {
                    DCDomTools.FoucsDocument();
                    DCWriterControllerEditor.SetFocus(this.Element);
                    if (this.Element.scrollIntoView) {
                        this.Element.scrollIntoView();
                    }
                    else {
                        DCDomTools.ScrollIntoView(this.Element);
                    }
                    DCWriterControllerEditor.fixScrollPositionForFixedHeader();
                };
                result.push(obj);
            } //if
        } //for
    } //if
    // 校验单选框、复选框必填项
    var requriedNames = new Array();
    var elements = document.getElementsByTagName("INPUT");
    for (var iCount = 0; iCount < elements.length; iCount++) {
        var element = elements[iCount];
        if (element.type == "radio" || element.type == "checkbox") {
            if (element.getAttribute("dc_requried") == "true") {
                var bolMatch = false;
                for (var i2 = 0; i2 < requriedNames.length; i2++) {
                    if (requriedNames[i2] == element.name) {
                        // 已经包含了该名称
                        bolMatch = true;
                        break;
                    }
                }
                if (bolMatch == false) {
                    requriedNames.push(element.name);
                    var es2 = document.getElementsByName(element.name);
                    var bolHasChecked = false;
                    for (var i3 = 0; i3 < es2.length; i3++) {
                        if (es2[i3].checked == true) {
                            bolHasChecked = true;
                            break;
                        }
                    } //for
                    if (bolHasChecked == false) {
                        // 必勾选信息
                        var obj = new Object();
                        obj.Element = element;
                        obj.ElementID = element.name;
                        var title2 = element.title;
                        if (title2 == null || title2.length == 0) {
                            title2 = element.name;
                        }
                        if (title2 == null || title2.length == 0) {
                            title2 = element.id;
                        }
                        obj.Message = document.GetDCWriterString("JS_RequriedChecked_Name", title2);
                        obj.Type = "ValueValidate";
                        obj.ExcludeKeywordText = null;
                        obj.Index = indexCount++;
                        obj.Select = function () {
                            //xuyiming 20190904 修改单复选框的select方法，跳转到单复选框的label元素
                            var label=$("label[for='"+this.Element.id+"']")[0];
                            DCDomTools.FoucsDocument();
                            DCWriterControllerEditor.SetFocus(label);
                            if (label.scrollIntoView) {
                                label.scrollIntoView();
                            }
                            else {
                                DCDomTools.ScrollIntoView(label);
                            }
                            DCWriterControllerEditor.fixScrollPositionForFixedHeader();
                        };
                        result.push(obj);
                    } //if
                } //if
            } //if
        } //if
    } //for
    if (showUI == true) {
        if (result != null && result.length > 0) {
            var message = document.GetDCWriterString("JS_ValueValidateResult_ItemCount", result.length);
            for (var iCount = 0; iCount < result.length; iCount++) {
                var item = result[iCount];
                var name = "";
                if (item.Element != null) {
                    name = item.Element.getAttribute("name");
                    if (name == null || name.length == 0) {
                        name = item.Element.getAttribute("title");
                    }
                    if (name == null || name.length == 0) {
                        name = item.Element.id;
                    }
                }
                message = message + "\r\n" + name + ":" + item.Message;
                if (iCount > 10) {
                    // 只显示前10条信息
                    break;
                } //if
            } //for
            //alert(message);
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = message;
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
    }
    return result;
};                                            //