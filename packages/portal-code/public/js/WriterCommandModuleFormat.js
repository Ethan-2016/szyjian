// 内容格式处理功能模块
// 袁永福2015-8-10

var WriterCommandModuleFormat = new Object();

// 开始执行格式刷功能
WriterCommandModuleFormat.BeginFormatBrush = function (usePstyle) {
    window.focus();
    document.body.focus();
    WriterCommandModuleFormat.CurrentFormatBrush = null ;
    var sel = DCSelectionManager.getSelection();
    //debugger;
    if (sel != null && sel.currentContainer != null) {
        var element = sel.currentContainer;
        var ownerp = DCDomTools.getParentSpecifyNodeName(element, "P");
        while (element != null) {
            if (element.nodeType == 3) {
                // 记录当前文本样式设置
                var bold = null;
                var border = null;
                var italic = null;
                var fontFamily = null;
                var fontStyle = null;
                var fontSize = null;
                var fontColor = null;
                var fontWeight = null;
                var textDecoration = null;
                var sup = null;
                var sub = null;

                var plineheight = null;
                var pmargintop = null;
                var pmarginbottom = null;
                var ptextindent = null;
                if (ownerp !== null && ownerp.style.lineHeight !== null) {
                    plineheight = ownerp.style.lineHeight;
                    pmargintop = ownerp.style.marginTop;
                    pmarginbottom = ownerp.style.marginBottom;
                    ptextindent = ownerp.style.textIndent;
                }
                while (element != null) {
                    if (element.nodeName == "B") {
                        if (bold == null) {
                            bold = true;
                        }
                    }
                    else if (element.nodeName == "SUP") {
                        if (sup == null) {
                            sup = true;
                        }
                    }
                    else if (element.nodeName == "SUB") {
                        if (sub == null) {
                            sub = true;
                        }
                    }
                    else if (element.nodeName == "I") {
                        if (italic == null) {
                            italic = true;
                        }
                    }
                    else if (element.nodeName == "U") {
                        if (textDecoration == null) {
                            textDecoration = "underline";
                        }
                    }
                    var style = null;
                    if (element.nodeType == 1) {
                        if (element.isContentEditable == false) {
                            break;
                        }
                        if (window.getComputedStyle) {
                            style = window.getComputedStyle(element, null);
                        }
                        else if (element.runtimeStyle) {
                            style = element.runtimeStyle;
                        }
                        else if (element.currentStyle) {
                            style = element.currentStyle;
                        }
                        else {
                            style = element.style;
                        }
                        if (style != null) {
                            if (style.color != null && fontColor == null) {
                                fontColor = style.color;
                            }
                            //if (style.font != null && font == null) {
                            //    font = style.font;
                            //}
                            if (style.fontFamily != null && fontFamily == null) {
                                fontFamily = style.fontFamily;
                            }
                            if (style.fontStyle != null && fontStyle == null) {
                                fontStyle = style.fontStyle;
                            }
                            if (style.fontSize != null && fontSize == null) {
                                fontSize = style.fontSize;
                            }
                            if (style.fontWeight != null && fontWeight == null) {
                                fontWeight = style.fontWeight;
                            }
                            if (style.textDecoration != null
                                && textDecoration == null ) {
                                textDecoration = style.textDecoration;
                            }
                            if (style.border != null
                                && border == null) {
                                border = style.border;
                            }
                        }
                    }
                    element = element.parentNode;
                }//while
                var brush = new Object();
                brush.bold = bold;
                brush.italic = italic;
                //brush.font = font;
                brush.fontFamily = fontFamily;
                brush.fontWeight = fontWeight;
                brush.fontSize = fontSize;
                brush.fontColor = fontColor;
                brush.fontStyle = fontStyle;
                brush.textDecoration = textDecoration;
                brush.sup = sup;
                brush.sub = sub;
                brush.border = border;
                //WYC20190830记录是否处理段落样式
                if (usePstyle === true) {
                    brush.usepstyle = true;
                } else {
                    brush.usepstyle = false;
                }
                //////////////////////////////////
                brush.lineheight = plineheight;
                brush.marginbottom = pmarginbottom;
                brush.margintop = pmargintop;
                brush.textindent = ptextindent;
                window.CurrentFormatBrush = brush;
                var curUrl = "url('" + document.body.getAttribute("servicepageurl") + "?dcwres=FormatBrush2.cur'),pointer";
                element = sel.currentContainer;
                while (element != null) {
                    if (element.parentNode != null
                        && element.parentNode.isContentEditable == false) {
                        if (element.style != null) {
                            brush.Container = element;
                            element.style.cursor = curUrl;
                            break;
                        }
                    }
                    element = element.parentNode;
                }
                //document.body.style.cursor = curUrl;
                break;
            }
            element = element.parentNode;
        }
    }
};


// 取消格式刷功能
WriterCommandModuleFormat.CancelBrushFormat = function () {
    var brush = window.CurrentFormatBrush;
    if (brush != null) {
        window.CurrentFormatBrush = null;
        brush.Container.style.cursor = "";
    }
};

// 应用格式刷功能
WriterCommandModuleFormat.ApplyBrushFormat = function ( eve ) {
    if (window.CurrentFormatBrush != null) {
        //debugger;
        DCDomTools.completeEvent(eve);
        var brush = window.CurrentFormatBrush;
        window.CurrentFormatBrush = null;
        brush.Container.style.cursor = "";
        var nodes = DCDomTools.GetSelectionNodes(true);
        if (nodes != null && nodes.length > 0) {
            for (var iCount = 0; iCount < nodes.length; iCount++) {
                var node = nodes[iCount];
                if (node.length > 0 && node.parentNode.isContentEditable == true ) {
                    var span = null;
                    if (brush.sub == true) {
                        span = document.createElement("SUB");
                    }
                    else if (brush.sup == true) {
                        span = document.createElement("SUP");
                    }
                    else {
                        span = document.createElement("span");
                    }
                    node.parentNode.insertBefore(span, node);
                    span.appendChild(node);
                    if (brush.bold == true) {
                        span.style.fontWeight = "bold";
                    }
                    if (brush.italic == true) {
                        span.style.fontStyle = "italic";
                    }
                    if (brush.fontWeight != null && brush.fontWeight.length > 0) {
                        span.style.fontWeight = brush.fontWeight;
                    }
                    if (brush.fontSize != null && brush.fontSize.length > 0) {
                        span.style.fontSize = brush.fontSize;
                    }
                    if (brush.fontColor != null && brush.fontColor.length > 0) {
                        span.style.color = brush.fontColor;
                    }
                    if (brush.fontStyle != null && brush.fontStyle.length > 0) {
                        span.style.fontStyle = brush.fontStyle;
                    }
                    if (brush.fontFamily != null && brush.fontFamily.length > 0) {
                        span.style.fontFamily = brush.fontFamily;
                    }
                    if (brush.textDecoration != null && brush.textDecoration.length > 0) {
                        span.style.textDecoration = brush.textDecoration;
                    }
                    if (brush.border != null && brush.border.length > 0) {
                        span.style.border = brush.border;
                    }
                    if (brush.usepstyle && brush.usepstyle === true) {
                        var p = DCDomTools.getParentSpecifyNodeName(span, "P");
                        if (p !== null) {
                            if (brush.lineheight !== null) {
                                p.style.lineHeight = brush.lineheight;
                            }
                            if (brush.marginbottom !== null) {
                                p.style.marginBottom = brush.marginbottom;
                            }
                            if (brush.margintop !== null) {
                                p.style.marginTop = brush.margintop;
                            }
                            if (brush.textindent !== null) {
                                p.style.textIndent = brush.textindent;
                            }
                        } 
                        }
                    }
                }
            }
        return true;
    }
    return false;
};

WriterCommandModuleFormat.ClearSelectionCssAttribute = function (attributeName) {
};

// 执行格式命令
WriterCommandModuleFormat.InnerExecutCommand = function (cmdName, showUI, parameter, cssNameForRemove) {
    window.focus();
    document.body.focus();
    DCDropdownControlManager.CloseDropdownControl();

    //wyc20201209:自带style的输入域元素(非外挂class)，选中内部文本执行underline命令会将输入域截成三段
    //在这里临时处理将输入域的父元素暂时设成只读来避免这个现象
    var backparenteditable = null;
    var backfieldeditable = null;
    var backparentcontenteditable = null;
    var backfieldcontenteditable = null;
    var currentfieldparent = null;
    var currentfield = DCSelectionManager.GetCurrentInputField();
    if (currentfield != null) {
        currentfieldparent = currentfield.parentElement;
        backfieldeditable = currentfield.isContentEditable;
        backparenteditable = currentfieldparent.isContentEditable;
        backparentcontenteditable = currentfieldparent.getAttribute("contenteditable");
        backfieldcontenteditable = currentfield.getAttribute("contenteditable");

        if (backparenteditable == true) {
            currentfieldparent.setAttribute("contenteditable", "false");
            if (backfieldeditable == true) {
                currentfield.setAttribute("contenteditable", "true");
            }
        }
    }
    //BSDCWRIT-13 hulijun 20201207
    if (document.queryCommandSupported && document.queryCommandSupported(cmdName)) {
        // 采用标准浏览器命令
        var result = document.execCommand(cmdName, false, "");
        if (result == true && cssNameForRemove != null && cssNameForRemove.length > 0) {
            // 清除CSS属性
            var allNodes = null;
            var sel = DCDomTools.getSelection();
            if (sel != null) {
                if (sel.anchorNode != null || sel.focusNode != null) {
                    allNodes = DCDomTools.GetAllNodes(sel.anchorNode, sel.focusNode);
                }
                else if (sel.getRangeAt && sel.rangeCount > 0 && sel.isCollapsed != true) {
                    var rng = sel.getRangeAt(0);
                    if (rng != null
                        && rng.startContainer != null
                        && rng.endContainer != null) {
                        allNodes = DCDomTools.GetAllNodes(rng.startContainer, rng.endContainer);
                    }
                }
                else if (sel.createRange) {
                    var rng = sel.createRange();

                }
            }
            cssNameForRemove = cssNameForRemove.toLowerCase();
            if (allNodes != null && allNodes.length > 0) {
                var len = allNodes.length;
                // 获得文档中所有的全局外联样式清单。
                var styles = DCDomTools.GetAllStyleSheet();
                for (var iCount = 0; iCount < len; iCount++) {
                    var node = allNodes[iCount];
                    if (node.nodeName == "#text"
                        || node.getAttribute == null) {
                        // 不处理纯文本元素
                        continue;
                    }
                    if (node.getAttribute("dcignore") == "1") {
                        // 忽略的元素
                        continue;
                    }
                    if (node.isContentEditable == false) {
                        // 节点内容只读
                        continue;
                    }
                    var $node = $(node);
                    var cssValue = $node.css(cssNameForRemove);
                    if (cssValue != null && cssValue.length > 0) {
                        DCDomTools.removeCssAttr(node, cssNameForRemove);
                        var classNames = null;
                        if (node.classList) {
                            classNames = node.classList;
                        }
                        else {
                            if (node.className != null && node.className.length > 0) {
                                classNames = node.className.split(" ");
                            }
                        }
                        if (classNames != null && classNames.length > 0) {
                            for (var iCount2 = 0; iCount2 < classNames.length; iCount2++) {
                                var itemName = classNames[iCount2];
                                if (itemName != null
                                    && itemName.length > 2
                                    && itemName.substring(0, 2) == "ds") {
                                    var styleItem = styles["." + itemName];
                                    if (styleItem == null) {
                                        continue;
                                    }
                                    var len4 = styleItem.length;
                                    for (var iCount4 = 0; iCount4 < len4; iCount4++) {
                                        var pname = styleItem.item(iCount4);
                                        pname = pname.toLowerCase();
                                        if (pname == cssNameForRemove) {
                                            // 发现有指定名称的外联样式，则删掉外联样式，
                                            // 并将其他的外联样式复制到本地。
                                            $node.removeClass(itemName);
                                            node.setAttribute("localclass", "");
                                            for (var iCount5 = 0; iCount5 < len4; iCount5++) {
                                                if (iCount5 != iCount4) {
                                                    var pname2 = styleItem.item(iCount5);
                                                    if (styleItem.setProperty) {
                                                        node.style.setProperty(pname2, styleItem.getPropertyValue(pname2));
                                                    }
                                                    else {
                                                        node.style.setAttribute(pname2, styleItem.getAttribute(pname2));
                                                    }
                                                }//if
                                            }//for
                                            break;
                                        }//if
                                    }//for
                                }//if
                            }//for
                        }//if
                    }
                    if (node.nodeName == "SPAN") {
                        // 修复输入域边界元素
                        var dctype = node.getAttribute("dctype");
                        if (dctype == "start" || dctype == "end") {
                            if (node.firstChild != null && node.firstChild.nodeName != "#text") {
                                var txt = node.innerText;
                                node.innerHTML = txt;
                            }
                            var p = node.parentNode;
                            while (p != null) {
                                if (p.getAttribute("dctype") == "XTextInputFieldElement") {
                                    if (p != node.parentNode) {
                                        node.parentNode.removeChild(node);
                                        if (dctype == "start") {
                                            p.insertBefore(node, p.firstChild);
                                        }
                                        else {
                                            p.appendChild(node);
                                        }
                                    }
                                    break;
                                }
                                p = p.parentNode;
                            }//while
                        }
                    }
                }
            }
        }
        DCDomTools.BubbleRaiseChanged();
        //return result;
    }
    else {
        // 采用UIEDITOR的编辑命令
        document.resultArrayForapplyInlineStyle = null;
        var result = window.uiEditor.execCommand(cmdName, parameter);
        if (cssNameForRemove != null
            && cssNameForRemove.length > 0
            && document.resultArrayForapplyInlineStyle != null) {
            var nodes = document.resultArrayForapplyInlineStyle;
            for (var iCount = 0; iCount < nodes.length; iCount++) {
                DCDomTools.removeChildNodesCssAttribute(nodes[iCount], cssNameForRemove, true);
            }
        }
        //return result;
    }

    //wyc20201209：恢复设置
    if (currentfield != null) {
        if (backparenteditable == true) {
            if (backparentcontenteditable != null) {
                currentfieldparent.setAttribute("contenteditable", "true");
            } else {
                currentfieldparent.removeAttribute("contenteditable");
            }
        }
        if (backfieldeditable == true) {
            if (backfieldcontenteditable != null) {
                currentfield.setAttribute("contenteditable", "true");
            }
        }
    }
    return result;
};

// 粗体
WriterCommandModuleFormat.Bold = function (parameter) {
    var isNeedBold = false;//是否需要加粗
    var lastArr = DCDomTools.GetSelectionNodes(false);
    for (var i = 0; i < lastArr.length; i++) {
        var node = lastArr[i];
        if (node.nodeName == "#text") {
            var isBold = $(node).parent().css("font-weight");
            if (isBold <= 400) {
                isNeedBold = true;
            }
        }
    }
    if (isNeedBold == true) {
        WriterCommandModuleFormat.SetCss("font-weight", 700);
    } else {
        WriterCommandModuleFormat.SetCss("font-weight", 400);
    }

    // return WriterCommandModuleFormat.InnerExecutCommand("bold", true, parameter, "font-weight");
    
    //var result = window.uiEditor.execCommand("bold", parameter);
    //if (document.resultArrayForapplyInlineStyle != null) {
    //    var nodes = document.resultArrayForapplyInlineStyle;
    //    for (var iCount = 0; iCount < nodes.length; iCount++) {
    //        DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "font-weight", true);
    //    }
    //}
    //return result;
};

// 斜体
WriterCommandModuleFormat.Italic = function (parameter) {
    var isNeedItalic = false;//是否需要斜体
    var lastArr = DCDomTools.GetSelectionNodes(false);
    for (var i = 0; i < lastArr.length; i++) {
        var node = lastArr[i];
        if (node.nodeName == "#text") {
            var isItalic = $(node).parent().css("font-style");
            if (isItalic != "italic") {
                isNeedItalic = true;
            }
        }
    }
    if (isNeedItalic == true) {
        WriterCommandModuleFormat.SetCss("font-style", "italic");
    } else {
        WriterCommandModuleFormat.SetCss("font-style", "normal");
    }
    // return WriterCommandModuleFormat.InnerExecutCommand("italic", true, parameter, "font-style");
    //document.resultArrayForapplyInlineStyle = null;
    //var result = window.uiEditor.execCommand("italic", parameter);
    //if (document.resultArrayForapplyInlineStyle != null) {
    //    var nodes = document.resultArrayForapplyInlineStyle;
    //    for (var iCount = 0; iCount < nodes.length; iCount++) {
    //        DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "font-style", true);
    //    }
    //}
    //return result;
};

// 下划线
WriterCommandModuleFormat.Underline = function (parameter) {
    var isNeedUnderline = false;//是否需要下划线
    var isunderline = false;//是否外围已有下划线
    var parentnode = null;
    var selectnodes = DCDomTools.selectNodes();
    var lastArr = DCDomTools.GetSelectionNodes(true);//强制拆分节点
    for (var i = 0; i < lastArr.length; i++) {
        var node = lastArr[i];
        if (node.nodeName == "#text") {
            parentnode = node.parentNode;
            var underline = $(parentnode).css("text-decoration");
            if (underline.indexOf("underline") != -1) {
                isunderline = true;
            }
        }
    }
    if (parameter === true || parameter === false) {
        isNeedUnderline = parameter;
    } else {
        isNeedUnderline = !isunderline;
    }
    if (isNeedUnderline == true) {
        WriterCommandModuleFormat.SetCss("text-decoration", "underline");
    } else if (isunderline === true && selectnodes.length == 1 && selectnodes[0].nodeName == "#text") {
        //先不考虑跨元素选择的情况
        var selectiontext = selectnodes[0].textContent;
        if (parentnode != null) {
            for (var i = 0; i < parentnode.childNodes.length; i++) {
                var node = parentnode.cloneNode();
                var txt = parentnode.childNodes[i].textContent;
                node.innerHTML = txt;
                if (selectiontext == txt) {
                    node.style.textDecoration = "none";
                }
                parentnode.parentNode.insertBefore(node, parentnode);
            }
            parentnode.parentNode.removeChild(parentnode);
        }
    } else {
        WriterCommandModuleFormat.SetCss("text-decoration", "none");
    }
    //return WriterCommandModuleFormat.InnerExecutCommand("underline", true, parameter, "font-decoration");
    //var result = window.uiEditor.execCommand("underline", parameter);
    //if (document.resultArrayForapplyInlineStyle != null) {
    //    var nodes = document.resultArrayForapplyInlineStyle;
    //    for (var iCount = 0; iCount < nodes.length; iCount++) {
    //        DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "font-decoration", true);
    //    }
    //}

    //return result;
};

//wyc20210121：输入域下划线
WriterCommandModuleFormat.InputFieldUnderline = function (parameter) {
    if (document.WriterControl != null) {
        var win = document.WriterControl.GetContentWindow();
        if (win != null) {
            var currentinput = null;
            if (parameter != null && win.DCInputFieldManager.IsInputFieldElement(parameter) == true) {
                currentinput = parameter;
            } else {
                currentinput = win.DCSelectionManager.GetCurrentInputField();
            }
            if (currentinput != null) {
                var options = {
                    BorderLeft: false,
                    BorderRight: false,
                    BorderTop: false,
                    BorderBottom: true
                };
                win.DCDomTools.SetElementBorder(currentinput, options);
            }
        }
    }
};

// 删除线
//符良柱 2018-1-6
WriterCommandModuleFormat.Strikethrough = function (parameter) {
    return WriterCommandModuleFormat.InnerExecutCommand("strikethrough", true, parameter, null );
    //document.resultArrayForapplyInlineStyle = null;
    //var result = window.uiEditor.execCommand("strikethrough", parameter);
    //return result;
}

// 字符边框
//符良柱 2018-1-6
WriterCommandModuleFormat.Fontborder = function (parameter) {
    return WriterCommandModuleFormat.InnerExecutCommand("fontborder", true, parameter, null);
    //document.resultArrayForapplyInlineStyle = null;
    //var result = window.uiEditor.execCommand("fontborder", parameter);
    //return result;
};

// 上标
//符良柱 2018-1-6
WriterCommandModuleFormat.Superscript = function (parameter) {
    return WriterCommandModuleFormat.InnerExecutCommand("superscript", true, parameter, null);
    // document.resultArrayForapplyInlineStyle = null;
    //var result = window.uiEditor.execCommand("superscript", parameter);
    //return result;
};

// 下标
//符良柱 2018-1-6
WriterCommandModuleFormat.Subscript = function (parameter) {
    return WriterCommandModuleFormat.InnerExecutCommand("subscript", true, parameter, null);
    // document.resultArrayForapplyInlineStyle = null;
    //var result = window.uiEditor.execCommand("subscript", parameter);
    //return result;
};

// 行间距
//符良柱 2018-1-6
WriterCommandModuleFormat.LineHeight = function (parameter) {
    return WriterCommandModuleFormat.InnerExecutCommand("lineheight", true, parameter, "lineheight");
    // document.resultArrayForapplyInlineStyle = null;
    //var result = window.uiEditor.execCommand("lineheight", parameter);
    //if (document.resultArrayForapplyInlineStyle != null) {
    //    var nodes = document.resultArrayForapplyInlineStyle;
    //    for (var iCount = 0; iCount < nodes.length; iCount++) {
    //        DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "lineheight", true);
    //    }
    //}
    //return result;
};

// 段前后距
//符良柱 2018-1-6
WriterCommandModuleFormat.rowspacing = function (parameter) {

    var jiequ = parameter.split(",");
    var linkwz = jiequ[0];
    var liej = jiequ[1];

    document.resultArrayForapplyInlineStyle = null;
    var result = window.uiEditor.execCommand("rowspacing", linkwz, liej);
    if (document.resultArrayForapplyInlineStyle != null) {
        var nodes = document.resultArrayForapplyInlineStyle;
        for (var iCount = 0; iCount < nodes.length; iCount++) {
            DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "lineheight", true);
        }
    }
    return result;
};

// 输入方向
//符良柱 2018-1-6
WriterCommandModuleFormat.DirectionaLity = function (parameter) {
    return WriterCommandModuleFormat.InnerExecutCommand("directionality", true, parameter, null);
    //var result = window.uiEditor.execCommand("directionality", parameter);
    //return result;
};

//修改字体名称
//修改 徐逸铭 2019-5-24
WriterCommandModuleFormat.FontName = function (parameter) {
    WriterCommandModuleFormat.SetCss("font-family", parameter);

    //return WriterCommandModuleFormat.InnerExecutCommand("fontfamily", true, parameter, "font-family");
    // var result = window.uiEditor.execCommand("fontfamily", parameter);
    //if (document.resultArrayForapplyInlineStyle != null) {
    //    var nodes = document.resultArrayForapplyInlineStyle;
    //    for (var iCount = 0; iCount < nodes.length; iCount++) {
    //        DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "font-family", true);
    //    }
    //}
    //return result; 
};


//修改字体大小
//修改 徐逸铭 2019-5-17
WriterCommandModuleFormat.FontSize = function (parameter) {
    WriterCommandModuleFormat.SetCss("font-size", parameter);

    //return WriterCommandModuleFormat.InnerExecutCommand("fontsize", true, parameter, "font-size");
    //var result = window.uiEditor.execCommand("fontsize", parameter);
    //return result;
    //var result = window.uiEditor.execCommand("fontsize", parameter);
    //if (document.resultArrayForapplyInlineStyle != null) {
    //    var nodes = document.resultArrayForapplyInlineStyle;
    //    for (var iCount = 0; iCount < nodes.length; iCount++) {
    //        DCDomTools.removeChildNodesCssAttribute(nodes[iCount], "font-size", true);
    //    }
    //}
    //return result;
};

//返回字体大小
//徐逸铭 20190522
WriterCommandModuleFormat.getFontSize = function () {
    if (window.getSelection || document.getSelection) {
        var userselection = window.getSelection();
        // xuyiming 20201125 修复可能报错问题
        var rangeCount = userselection.rangeCount;
        if (rangeCount == 0) {
            return undefined;
        }
        var range = userselection.getRangeAt(0);
        var dom = range.commonAncestorContainer; //dom节点
        if (dom.nodeName == "#text") {
            return $(dom.parentElement).css("font-size");
        } else {
            var flag = true;
            for (var i = 0; i < dom.children.length - 1; i++) {
                if ($(dom.children[i]).css("font-size") == $(dom.children[i + 1]).css("font-size")) {
                    flag = true;
                } else {
                    flag = false;
                }
            }
            if (flag) {
                return $(dom.children[0]).css("font-size");
            } else {
                return $(dom).css("font-size");
            }
        }
    }
}

// 清除字号
//符良柱 2018-1-6
//修改 徐逸铭 2019-5-16
WriterCommandModuleFormat.RemoveFontSize = function () {
    var result = this.FontSize("inherit");
    return result;
    //var result = window.uiEditor.execCommand("fontsize", parameter);
    //return result;
};

// 清除字体名称
//符良柱 2018-1-6
//修改 徐逸铭 2019-5-24
WriterCommandModuleFormat.RemoveFontFamily = function () {
    return WriterCommandModuleFormat.FontName("inherit");
    //var result = window.uiEditor.execCommand("fontfamily", parameter);
    //return result;
};

// 清除字体
//伍贻超 2019-3-27
WriterCommandModuleFormat.RemoveFormat = function (parameter) {
    var result = window.uiEditor.execCommand("removeformat", parameter);
    return result;
};

// 字体颜色
WriterCommandModuleFormat.Color = function(showUI,parameter){
    // 20210226 xym 修复BSDCWRIT-170
    var selectNodes = DCDomTools.selectNodes();
    var arr = [];
    for (var i = 0; i < selectNodes.length; i++) {
        var node = selectNodes[i];
        var parNode = $(node).parents("[dcignore]");
        if (parNode.length == 1) {
            var obj = {
                "node": parNode,
                "colorString": parNode.css("color")
            };
            arr.push(obj);
        }
    }
    var result = DCWriterCommandMananger.SelectionExecuteCommand("ForeColor", showUI, parameter);
    for (var i = 0; i < arr.length; i++) {
        var node = arr[i].node;
        var colorString = arr[i].colorString;
        var dctype = node.attr("dctype");
        switch (dctype) {
            case "backgroundtext":
                node.css("color", colorString);
                break;
            case "start":
            case "end":
                break;
            default:
                break;
        }
    }
    return result;
}

// 特殊字符
//符良柱 2018-1-6
WriterCommandModuleFormat.Spechars = function (parameter) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextInputFieldElement") == false) {
        //alert("当前位置无法插入");
        if (document.WriterControl) {
            var eventObject = new Object();
            eventObject.Message = "当前位置无法插入";
            eventObject.State = document.WriterControl.ErrorInfo.Error;
            document.WriterControl.MessageHandler(eventObject);
        }
        return null;
    }
    if (parameter !== null && parameter !== undefined && parameter !== "") {
        var str = parameter.toString();
        str = WriterCommandModuleFormat.clearNoNeedText(str, false);
        var tszf = "<div>" + str + "</div>";
        // var result = window.uiEditor.execCommand("inserthtml", tszf);
        // 20191114 xuyiming 解决移动端字符串页面滑动问题
        var node = $(tszf)[0];
        if(node.firstChild == null){
            return false;
        }
        var lastNode = node.firstChild;
        var moveNode = document.createElement("span");
        DCWriterControllerEditor.InsertElementAtCurentPosition(lastNode, true);
        $(lastNode).before($(moveNode));
        while (node.firstChild != null) {
            var c = node.firstChild;
            $(lastNode).after($(c));
            lastNode = c;
        }
        var a = $(moveNode).offset().top;
        var b = $(window).scrollTop();
        var zoom = document.body.getAttribute("browser") == "FireFox" ? 1 : document.body.style.zoom;
        var c = $(window).height() / (zoom || 1);
        setTimeout(function () {
            DCDomTools.MoveCaretToEnd(lastNode);
            var sel = DCSelectionManager.getSelection();
            if (sel.startContainer != null) {
                // 记录最后一次有效的当前状态
                DCSelectionManager.LastSelectionInfo = sel;
                DCSelectionManager.LastSelectionInfoWithFix = DCSelectionManager.getSelectionWithFix();//wyc20200217：补充更新当前光标所在位
            }
        }, 10);
        if (a >= b && a < (b + c)) {
        } else {
            moveNode.scrollIntoView();
        }
        $(moveNode).remove();
        DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
        return true;
    } else {
        return null;
    }

};

// 插入超链接
//符良柱 2018-1-6
WriterCommandModuleFormat.Link = function (parameter) {
    var jiequ = parameter.split(",");
    var linkwz = jiequ[0];
    var liej = jiequ[1];
    var linka = "<a target='_blank' onclick='demo(this)' href='" + liej + "'>" + linkwz + "<a>";
    var result = window.uiEditor.execCommand("inserthtml", linka);
    // DCWRITER2282
    DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
    return result;
};
function demo(obj) {
    window.open(obj.getAttribute("href"));
};

// 设置单个段落的对齐样式
WriterCommandModuleFormat.AlignSingleParagraph = function (alignValue) {
    var sel = DCDomTools.getSelection();
    if (sel.getRangeAt && sel.rangeCount > 0) {
        var rng = sel.getRangeAt(0);
        if (rng.startContainer == rng.endContainer && rng.startOffset == rng.endOffset) {
            // 没有选中任何元素
            var p = rng.startContainer;
            while (p != null) {
                if (p.nodeName == "P") {
                    //p.align = alignValue; 
                    //DCWRITER-3674 hulijun 20210219
                    p.style.textAlign = alignValue; 
                    return true;
                }
                p = p.parentNode;
            }
        }
    }
    return false;
};

// 获得要操作的段落对象
WriterCommandModuleFormat.getParagraphs = function () {
    var sel = DCDomTools.getSelection();
    var result = new Array();
    if (sel.getRangeAt && sel.rangeCount > 0) {
        var rng = sel.getRangeAt(0);

    }
    else {
    }
};

//返回字体名称
WriterCommandModuleFormat.getFontFamily = function () {
    //var arr = DCDomTools.GetSelectionNodes(true);
    if (window.getSelection || document.getSelection) {
        var userselection = window.getSelection();
        // xuyiming 20201125 修复可能报错问题
        var rangeCount = userselection.rangeCount;
        if (rangeCount == 0) {
            return undefined;
        }
        var range = userselection.getRangeAt(0);
        var dom = range.commonAncestorContainer; //dom节点
        //console.log(dom);
        if (dom.nodeName == "#text") {
            return $(dom.parentElement).css("font-family");
        } else {
            var flag = true;
            for (var i = 0; i < dom.children.length - 1; i++) {
                if ($(dom.children[i]).css("font-family") == $(dom.children[i + 1]).css("font-family")) {
                    flag = true;
                } else {
                    flag = false;
                }
            }
            if (flag) {
                return $(dom.children[0]).css("font-family");
            } else {
                return $(dom).css("font-family");
            }

        }
    }
}

//hangingIndent 悬挂缩进
WriterCommandModuleFormat.setHangingIndent = function (parameter) {
    // debugger;
    var range = DCDomTools.getSelectionRange();
    var pArr = [];
    // if (range.collapsed) {
    //     var p = range.startContainer;
    //     while (p != null) {
    //         if (p.nodeName == "P") {
    //             pArr.push(p);
    //         }
    //         p = p.parentNode || p.parentElement;
    //     }
    // }else{
    var doms = DCDomTools.GetSelectionNodes(false);
    for (var i = 0; i < doms.length; i++) {
        var p = doms[i];
        while (p != null) {
            if (p.nodeName == "P") {
                if (pArr.indexOf(p) < 0) {
                    pArr.push(p);
                }
                break;
            }
            p = p.parentNode || p.parentElement;
        }
    }
    // }
    for (var j in pArr) {
        pArr[j].style.marginLeft = parameter.marginLeft;
        pArr[j].style.textIndent = parameter.textIndent;
    }
}

// 设置选中内容的样式
WriterCommandModuleFormat.SetCss = function (cssName, parameter) {
    if (parameter == null) {
        return false;
    }
    var needChangeArr = DCDomTools.selectNodes();
    var clonArr = [];//needChangeArr存储选中的文本节点，clonArr存储选中的输入域前后边框
    for (var i = 0; i < needChangeArr.length; i++) {
        var node = needChangeArr[i];
        var a = DCDomTools.allChildNodes($(node).parent()[0], 3);
        var flag = true;//是否全选
        for (var j = 0; j < a.length; j++) {
            if ($.inArray(a[j], needChangeArr) == -1) {
                flag = false;
            }
        }
        if (flag) {
            var parentNode = $(node).parent();
            parentNode.css(cssName, parameter);
            if (parentNode.attr("dctype") == "start" || parentNode.attr("dctype") == "end") {
                clonArr.push(parentNode[0]);
            } else if (parentNode.attr("dctype") == "XTextCheckBoxElementBaseLabel") {
                // 20210409 xym 修复修改单复选框字体大小无法保存问题
                var forName = parentNode.attr("for");
                var input = $("input#" + forName);
                input.css(cssName, parameter);
            }
        } else {
            var span = $("<span></span>");
            span.css(cssName, parameter);
            $(node).wrap(span);
        }
    }
    for (var i = 0; i < clonArr.length; i++) {
        var node = clonArr[i];
        if ($(node).attr("dctype") && DCInputFieldManager.IsInputFieldElement($(node).parent()[0]) == true) {
            if ($(node).attr("dctype") == "start") {
                var $endNode = $(node).parent().find(">[dctype='end']");
            } else if ($(node).attr("dctype") == "end") {
                var $endNode = $(node).parent().find(">[dctype='start']");
            }
            if ($.inArray($endNode[0], clonArr) == -1) {//同时选中输入域前后边框就表示选中整个输入域
                $endNode.css(cssName, $endNode.css(cssName));
            }
            $(node).parent().css(cssName, parameter);
        }
    }
    // 20200302 xuyiming 修复修改样式时可能失去选中问题
    if (needChangeArr.length == 1) {
        DCDomTools.selectContent(needChangeArr[0], 0, needChangeArr[needChangeArr.length - 1], needChangeArr[needChangeArr.length - 1].textContent.length);
    }
}

// 设置全部内容的样式
WriterCommandModuleFormat.SetAllDomCss = function (cssName, parameter, headerfootereditable) {
    if (parameter == null || document.body.getAttribute("contentrendermode") == "PagePreviewHtml") {
        return false;
    }
    var doms = $(document).find("#divDocumentBody_0");
    if (document.WriterControl.Options.HeaderFooterEditable == "true" && (headerfootereditable === true || headerfootereditable.toString().toLowerCase() == "true")) {
        doms = $(document).find("#divXTextDocumentHeaderElement,#divDocumentBody_0,#divXTextDocumentFooterElement,#divXTextDocumentHeaderForFirstPageElement,#divXTextDocumentFooterForFirstPageElement");
    }
    if (cssName == "line-height") {
        doms.find("p").css(cssName, parameter);
    } else {
        doms.css(cssName, parameter).find("*").css(cssName, parameter);
    }
    return true;
}

WriterCommandModuleFormat.DCPaste = function () {
    // 添加禁止事件
    if (document.WriterControl != null
        && document.WriterControl.EventBeforePaste != null
        && typeof (document.WriterControl.EventBeforePaste) == "function") {
        var result = document.WriterControl.EventBeforePaste(window.event);
        if (result === false) {
            return false;
        }
    }
    var copyText = document.WriterControl.copyText;//数据
    if (copyText != null && copyText.length > 0) {
        var acceptDataFormats = null;
        var supportText = true; // 支持粘贴纯文本
        var supportHtml = true; // 支持粘贴HTML文本
        if (document.WriterControl != null && document.WriterControl.DocumentOptions != null && document.WriterControl.DocumentOptions.BehaviorOptions != null) {
            acceptDataFormats = document.WriterControl.DocumentOptions.BehaviorOptions.AcceptDataFormats;
        }
        if (acceptDataFormats == null) {
            acceptDataFormats = "All";
        }
        if (acceptDataFormats != null && acceptDataFormats.length > 0) {
            supportText = acceptDataFormats == "All" || acceptDataFormats.indexOf("Text") >= 0;
            supportHtml = acceptDataFormats == "All" || acceptDataFormats.indexOf("Html") >= 0;
        }
        copyText = WriterCommandModuleFormat.clearNoNeedText(copyText, supportHtml == true ? false : true, result, true);//传输值
        if (copyText == null || copyText.length == 0) {
            return;
        }
        //处理输入域内的粘贴操作
        var curField = DCSelectionManager.GetCurrentInputField();
        if (curField != null && curField.nodeName == "INPUT") {
            WriterCommandModuleFormat.insertAtCursor(curField, copyText);//初步上传粘贴时插入input输入域
            return;
        }
        DCDomTools.delectNode();
        DCWriterControllerEditor.InsertHtmlAtCurentPosition(copyText);
        // DCWriterControllerEditor.InsertElementAtCurentPosition(copyText, false);
    }
}

WriterCommandModuleFormat.insertAtCursor = function(myField, myValue) {
    var doc = myField.ownerDocument;
    var moveIndex;
    //IE support
    if (doc.selection) {
        myField.focus();
        sel = doc.selection.createRange();
        sel.text = myValue;
    }
    //FF, hopefully others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        moveIndex = startPos + myValue.length;
    }
    // fallback to appending it to the field
    else {
        myField.value += myValue;
        moveIndex = myField.value.length;
    }
    if(isNaN(moveIndex) == false){
        DCDomTools.MoveCaretToIndex(myField, moveIndex);
    }else{
        DCDomTools.MoveCaretToEnd(myField);
    }
}

//string 文本
//onlyText 是否返回纯文本
//RegExp 正则表达式,清空输入域前后边框（onlyText==true有效）
//clearLastBr 如果最后一个元素是BR时,是否清除最后一个BR
//isInTextInput 是否判断在不在输入域中
WriterCommandModuleFormat.clearNoNeedText = function (string, onlyText, RegExp, clearLastBr, isInTextInput) {
    if (typeof (string) != "string") {
        return string;
    }
    if (string == null || string.length <= 0) {
        return null;
    }
    if(string.slice(0,5) == "<html"){
        string = string.replace(/\r\n/g, '');
    }
    var div = $("<div></div>");
    div.html(string);
    div.find("[user-select='none']").remove();//清除不可选中元素
    div.find("*").each(function(){
        var isRemove = $(this).css("display") == "none" || $(this).css("opacity") == 0;
        //清除隐藏元素
        if(isRemove){
            $(this).remove()
        }
    })
    // 清除输入域前后边框不需要内容
    if (onlyText && RegExp) {
        // 20210301 xym EventBeforePaste返回noNeedBorder时粘贴清除输入域边框
        if (typeof(RegExp) == "string" && RegExp.toLowerCase() == "noneedborder") {
            div.find("[dctype='XTextInputFieldElement']").each(function () {
                var stdStartText = $(this).attr("dc_startbordertext") || "[";
                var stdEndText = $(this).attr("dc_endbordertext") || "]";
                var startNode = $(this).find(">[dctype='start']");
                if(startNode.length == 1){
                    startNode.html(startNode.html().replace(stdStartText, ""));
                }
                var endNode = $(this).find(">[dctype='end']");
                if(endNode.length == 1){
                    endNode.html(endNode.html().replace(stdEndText, ""));
                }
            })
        }else{
            div.find("[dctype='start'],[dctype='end']").each(function () {
                $(this).html($(this).html().replace(RegExp, ""));
            });
        }
    }
    // 空格替换&ensp;
    var textNodes = DCDomTools.allChildNodes(div[0], 3);
    for (var i = 0; i < textNodes.length; i++) {
        if(textNodes[i].nodeName = "#text"){
            var span = $("<span></span>");
            span.html(textNodes[i].textContent.replace(/[\r\n]{1,}/g, "<br dcpf='1'/>").replace(String.fromCharCode(160), "&ensp;"));
            while (span[0].firstChild != null) {
                $(textNodes[i]).before($(span[0].firstChild));
            }
            $(textNodes[i]).remove();
        }
    }
    if(clearLastBr && div[0].lastChild){//是否清除最后一个BR
        if(div[0].lastChild.nodeName == "BR"){
            $(div[0].lastChild).remove();
        }
    }
    if (onlyText == true) {//返回纯文本
        // 20210128 xym 修复BSDCWRIT-124
        div.find("meta,link,script,style,title").each(function () {
            $(this).remove();
        });
        var TextStr = GetElementText(div[0]);
        function GetElementText(element) {
            var TextStr = "";
            // 清除不必要的内容
            for (var iCount1 = 0; iCount1 < element.childNodes.length; iCount1++) {
                var node = element.childNodes[iCount1];
                if (node.nodeType != 1 && node.nodeType != 3) {
                    $(node).remove();
                    iCount1--;
                }
            }
            for (var iCount2 = 0; iCount2 < element.childNodes.length; iCount2++) {
                var node = element.childNodes[iCount2];
                if (node.nodeName == "#text") {
                    TextStr += node.nodeValue;
                } else if (node.nodeName == "BR") {
                    TextStr += "<br dcpf='1'/>";
                } else if ((node.nodeName == "P" || node.nodeName == "DIV") && node.innerText != "") {
                    TextStr += GetElementText(node);
                    if (iCount2 != element.childNodes.length - 1) {
                        TextStr += "<br dcpf='1'/>";
                    }
                } else {
                    TextStr += GetElementText(node);
                }
            }
            return TextStr;
        }
        return TextStr;
    }
    // 清除多余内容
    var divTem2 = $("<div></div>");
    var startIndex, endIndex;
    for (var i = 0; i < div[0].childNodes.length; i++) {
        var _node = div[0].childNodes[i];
        if (_node.nodeName == "#comment") {
            if (_node.data == "StartFragment") {
                startIndex = i;
            } else if (_node.data == "EndFragment") {
                endIndex = i;
            }
        }
    }
    if (startIndex != null && endIndex != null) {
        for (var i = 0; i < div[0].childNodes.length; i++) {
            var _node = div[0].childNodes[i];
            if (i > startIndex && i < endIndex) {
                divTem2.append(_node.cloneNode(true));
            }
        }
        div = divTem2;
    }
    // 不包括编辑器的主要表格 
    div.find("#dctable_AllContent td#dcGlobalRootElement").each(function(){
        while (this.firstChild != null) {
            $(this).parents("table#dctable_AllContent").before($(this.firstChild));
        }
        $(this).parents("table#dctable_AllContent").remove();
    });
    // 清空class名称
    div.find("*").removeAttr("class");
    // 清空一些东西
    div.find("meta,link,script,comment,title").each(function () {
        $(this).remove();
    });
    // div转为p
    div.find("div:not['dctype']").each(function () {
        this.outerHTML = this.outerHTML.replace(/\<div/g, "<p").replace(/\<\/div\>/g, "</p>");
    });
    // 20200831 xym 修改粘贴只读状态下的输入域，输入域还是只读的问题
    div.find("*").each(function(){
        var _dctype = $(this).attr("dctype");
        if(_dctype == "XTextInputFieldElement"){//输入域
            $(this).css({
                "background-color": "",
                "background-image": "",
                "background-position": "",
                "background-repeat": ""
            });
            if($(this).attr("dc_contentreadonly") == null){
                $(this).removeAttr("ircr").attr("eventlist","onmousedown|onmouseenter|onmouseleave|onfocus|onblur|onclick|ondblclick|onkeydown|onkeypress");
                $(this).removeAttr("contenteditable");
            }
            $(this).removeAttr("localclass").addClass("InputFieldNormal");
            DCInputFieldManager.UpdateInputFieldClassName(this);
        }
    });
    var curField = DCSelectionManager.GetCurrentInputField();
    if(isInTextInput && isInTextInput == true){
        curField == null;
    }
    if(DCWriterControllerEditor.IsFormView() && curField == null){
        curField = document.createElement("span");
    }
    if (curField != null) {//处理输入域内的
        div.find("p").each(function () {
            while (this.firstChild != null) {
                $(this).before($(this.firstChild));
            }
            $(this).replaceWith($("<br dcpf='1'/>"));
        });
        if(clearLastBr && div[0].lastChild){//是否清除最后一个BR
            if(div[0].lastChild.nodeName == "BR"){
                $(div[0].lastChild).remove();
            }
        }
        if (curField.nodeName == "SPAN") {
            return div.html();
        } else if (curField.nodeName == "INPUT") {
            return div.text();
        }

    } else {
        return div.html();
    }
}

//// 设置字体大小
//WriterCommandModuleFormat.FontSize = function (fontSize) {
//    if (fontSize == null) {
//        return false;
//    }
//    fontSize = fontSize.toLowerCase();
//    if (DCStringUtils.endsWith(fontSize, "px") || DCStringUtils.endsWith.endsWith(fontSize, "pt")) {
//        // 指定了字体大小
//        var sel = DCDomTools.getSelection();
//        if (sel != null) {
//            if (sel.rangeCount && sel.getRangeAt && sel.rangeCount > 0) {
//                var rng = sel.getRangeAt(0);
//                if (rng.surroundContents) {
//                    var span = document.createElement("span");
//                    span.setAttribute("style", "font-size:" + fontSize);
//                    rng.surroundContents(span);
//                    if (sel.addRange) {
//                        rng = document.createRange();
//                        rng.selectNode(span);
//                        sel.removeAllRanges();
//                        sel.addRange(rng);
//                    }
//                    return true;
//                }
//            }
//            else if (sel.createRange) {
//                var rng = sel.createRange();
//                
//            }
//        }
//    }
//    else {
//        var fs = parseInt(fontSize);
//        if (isNaN(fs) == false) {
//            if (document.queryCommandSupported) {
//                if (document.queryCommandSupported("FontSize")) {
//                    return document.execCommand("FontSize", false, fs);
//                }
//            }
//        }
//    }
//    return false;
//}