//**********************************************************************
// 下拉列表控件管理器 袁永福到此一游
//**********************************************************************
var DCDropdownControlManager = new Object();

//@method 判断指定的元素是否在下拉列表中。
DCDropdownControlManager.IsInDropdownControl = function (element) {
    if (element == null) {
        return false;
    }
    var div = DCDropdownControlManager.GetDropdownContainer(false);
    if (div == null) {
        return false;
    }
    while (element != null) {
        if (element == div) {
            return true;
        }
        element = element.parentNode;
    }
    return false;
};

DCDropdownControlManager.StableDropdownControl = function (milliseconds) {
    DCDropdownControlManager.TickStableDropdownControl = new Date().valueOf() + milliseconds;
};

// 临时在指定时间内禁止弹出下拉列表
DCDropdownControlManager.DisableDropdownControlDelay = function (milliseconds) {
    if (milliseconds > 0) {
    }
    DCDropdownControlManager.TickForDisableDropdownControlDelay = DCDomTools.GetDateMillisecondsTick(new Date()) + milliseconds;
};

//// 获得当前调用下拉列表的宿主元素
//DCDropdownControlManager.getCurrentDropdownHostElement = function () {
//    var box = DCDropdownControlManager.GetDropdownContainer();
//    if (box != null && box.style.display != "hidden") {
//        return box.currentElement;
//    }
//    return null;
//};

DCDropdownControlManager.CheckForDisableDropdownControlDelay = function () {
    var tick = DCDropdownControlManager.TickForDisableDropdownControlDelay;
    if (tick != null && tick > 0) {
        var nowTick = DCDomTools.GetDateMillisecondsTick(new Date());
        if (nowTick < tick) {
            return false;
        }
        DCDropdownControlManager.TickForDisableDropdownControlDelay = null;
    }
    return true;
};

//**************************************************************************************************************
DCDropdownControlManager.ShowDropdownControl = function (element, html, handleKeyDown, customOptions ) {
    if (DCDropdownControlManager.CheckForDisableDropdownControlDelay() == false) {
        return null ;
    }
    var div = DCDropdownControlManager.GetDropdownContainer( true );
    if (div != null) {
        //var vleft = DCDomTools.GetViewLeftInDocument(element);
        //var vtop = DCDomTools.GetViewLeftInDocument(element);
        //var vheight = element.scrollHeight;
        //var bodyWidth = document.body.offsetWidth;
        //var bodyHeight = document.body.offsetHeight;
        if (DCDropdownControlManager.DropdownControl(element, html, handleKeyDown, customOptions) == true) {
            return div;
        }
    }
    return null ;
};


////**************************************************************************************************************
//// 获得毫秒为单位的时刻数
//DCDropdownControlManager.GetDateMillisecondsTick = function (dtm) {
//    var v = dtm.getFullYear();
//    v = v * 12 + dtm.getMonth();
//    v = v * 30 + dtm.getDate();
//    v = v * 24 + dtm.getHours();
//    v = v * 60 + dtm.getMinutes();
//    v = v * 60 + dtm.getSeconds();
//    v = v * 1000 + dtm.getMilliseconds();
//    return v;
//};

//**************************************************************************************************************
// 获得下拉列表显示的时刻数，单位毫秒
DCDropdownControlManager.GetDropdownControlDisplayMillisecondsSpan = function () {
    var tick = DCDropdownControlManager.TickForShow;
    if (tick != null) {
        var tick2 = DCDomTools.GetDateMillisecondsTick(new Date());
        return tick2 - tick;
    }
    return 0;
};


//**************************************************************************************************************
// 显示下拉列表

DCDropdownControlManager.DropdownControlCount = 0;

DCDropdownControlManager.UpdateDropdownControlPosition = function (element) {
    if (element == null) {
        return false;
    }
    var div = DCDropdownControlManager.GetDropdownContainer(false);
    if (div == null || div.style.display == "none") {
        return false;
    }
    div.style.zIndex = 100000;
    var targetElement = element;
    var sel = DCSelectionManager.getSelection();
    var tempNode = null;
    var tempSpan = null;
    if (sel.startContainer != null
        && sel.startContainer.nodeName == "#text"
        && sel.startOffset > 0
        && sel.startContainer.splitText) {
        tempNode = sel.startContainer.splitText(sel.startOffset);
        if (tempNode != null) {
            tempSpan = document.createElement("span");
            tempNode.parentNode.insertBefore(tempSpan, tempNode);
            targetElement = tempSpan;
        }
    }
    var elementLeft = DCDomTools.GetViewLeftInDocument(targetElement);
    var elementTop = DCDomTools.GetViewTopInDocument(targetElement);

    var elementLeft2 = DCDomTools.GetViewLeftInDocument(element);
    var elementTop2 = DCDomTools.GetViewTopInDocument(element);
    if (Math.abs(elementTop - elementTop2) < 5) {
        // 大致在同一行
        if (Math.abs(elementLeft - elementLeft2) < 300) {
            // 水平距离也不远，则设置标准插入点区域。
            elementLeft = elementLeft2;
            elementTop = elementTop;
            if (Math.abs(element.offsetHeight - targetElement.offsetHeight) < 10) {
                targetElement = element;
            }
        }
    }
    var elementHeight = targetElement.offsetHeight;
    if (targetElement.childNodes.length > 0) {
        if (elementHeight == 0) {
            // 疑似遇到Microsoft Edge
            var fc = targetElement.firstChild;
            elementTop = DCDomTools.GetViewTopInDocument(fc);
            elementHeight = fc.offsetHeight;
        }
        else {
            elementHeight = targetElement.childNodes[0].offsetHeight;
            if (typeof (elementHeight) == "undefined") {
                elementHeight = targetElement.offsetHeight;
            }
        }
    }

    if (tempSpan != null ) {
        tempNode.parentNode.removeChild(tempSpan);
    }

    //elementHeight = 0;
    var bodyBottom = document.body.scrollTop + DCDomTools.GetDocumentClientHeight();
    var bodyRight = document.body.scrollLeft + DCDomTools.GetDocumentClientWidth();
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;
    if (divWidth == 0) {
        divWidth = parseInt(div.style.width) + 10;
        divHeight = parseInt(div.style.height) + 10;
    }
    var isDownMode = true;
    var divLeft = elementLeft;
    var divTop = elementTop + elementHeight;
    if (divTop + divHeight > bodyBottom) {
        divTop = elementTop - divHeight;
        isDownMode = false;
    }
    if (divLeft + divWidth > bodyRight) {
        divLeft = bodyRight - divWidth;
    }
    div.style.left = divLeft + "px";
    div.style.top = divTop + "px";
    div.style.position = "absolute";
    var sel = DCDomTools.getSelection();
    div.style.display = "";
    return true;
};

DCDropdownControlManager.DropdownControl = function (element, html, handleKeyDown, customOptions) {
    if (document.WriterControl.DocumentOptions.BehaviorOptions.DesignMode) {
        return;
    }
    if (DCDomTools.IsMouseDragScrollMode(document.body) == true) {
        return false;
    }
    if (DCDropdownControlManager.CheckForDisableDropdownControlDelay() == false) {
        return false;
    }
    var div = DCDropdownControlManager.GetDropdownContainer(true);
    //if (html == null) {
    //    if (div.firstChild == null) {
    //        // 空白内容，不显示列表
    //        return false;
    //    }
    //}
    DCDropdownControlManager.DropdownControlCount++;
    if (DCDropdownControlManager.DropdownControlCount == 2) {
        var i = 0;
    }
    DCDropdownControlManager.showingDropdownControl = true;
    DCDomTools.clearSelection();
    //var div = DCDropdownControlManager.GetDropdownContainer();
    if (customOptions != null) {
        var hasContent = false;
        if (customOptions.html != null && customOptions.html.length > 0) {
            DCDomTools.SetInnerHTML(div, customOptions.html);
            hasContent = true;
        }
        //else if (customOptions.element != null) {
        //    div.appendChild(customOptions.element);
        //    hasContent = true;
        //}
        //else if (customOptions.elements != null && customOptions.elements.length > 0) {
        //    for (var iCount = 0; iCount < customOptions.elements.length; iCount++) {
        //        div.appendChild(customOptions.elements[iCount]);
        //    }
        //    hasContent = true;
        //}
        //if (hasContent == false) {
        //    return false;
        //}
    }
    else if (typeof (html) == "string") {
        // 为一个字符串
        DCDomTools.SetInnerHTML(div, html);
    }
    else if (html != null && html.nodeName) {
        // 为一个HTML元素对象
        DCDomTools.removeAllChilds(div);
        div.appendChild(html);
    }
    
     
    if (div.firstChild == null) {
        // 空白内容，不显示列表
        return false;
    }
    // 20200422 xuyiming 添加DropDownListItemMaxNum属性控制输入域下拉列表最大显示个数
    if (document.WriterControl.Options.DropDownListItemMaxNum != null) {
        var _DropDownListItemMaxNum = parseInt(document.WriterControl.Options.DropDownListItemMaxNum);
        if (isNaN(_DropDownListItemMaxNum) == false && $(element).attr("dc_innereditstyle") == "DropdownList" && _DropDownListItemMaxNum > 0 && _DropDownListItemMaxNum <= 10) {
            var listitems = $(div).find(">*");
            if ($(element).attr("dc_innermultiselect") == "true") {
                if (listitems.eq(0).find(">*").length > _DropDownListItemMaxNum) {
                    var fourHeg = parseInt(listitems.eq(0).find(">*").eq(0).height()) * _DropDownListItemMaxNum + 10;
                    listitems.eq(0).css({ "height": fourHeg, "overflow-y": "auto" });
                    $(div).css("height", "");
                }
            } else {
                if (listitems.length > _DropDownListItemMaxNum) {
                    var fourHeg = parseInt(listitems.eq(0).height()) * _DropDownListItemMaxNum;
                    $(div).css("height", fourHeg + 10);
                }
            }
            $(div).css("height", $(div).height());
        }
    }
    div.currentElement = element;
    div.style.zIndex = 100000;
    var targetElement = element;
    var sel = DCSelectionManager.getSelection();
    var tempNode = null;
    var tempSpan = null;
    if (sel.startContainer != null
         && sel.startContainer.nodeName == "#text"
         && sel.startOffset > 0
         && sel.startContainer.splitText) {
        tempNode = sel.startContainer.splitText(sel.startOffset);
        if (tempNode != null) {
            tempSpan = document.createElement("span");
            tempNode.parentNode.insertBefore(tempSpan, tempNode);
            targetElement = tempSpan;
        }
    }
    var elementLeft = DCDomTools.GetViewLeftInDocument(targetElement);
    var elementTop = DCDomTools.GetViewTopInDocument(targetElement);

    var elementLeft2 = DCDomTools.GetViewLeftInDocument(element);
    var elementTop2 = DCDomTools.GetViewTopInDocument(element);
    if (Math.abs(elementTop - elementTop2) < 5) {
        // 大致在同一行
        if (Math.abs(elementLeft - elementLeft2) < 300) {
            // 水平距离也不远，则设置标准插入点区域。
            elementLeft = elementLeft2;
            elementTop = elementTop;
            if (Math.abs(element.offsetHeight - targetElement.offsetHeight) < 10) {
                targetElement = element;
            }
        }
    }
    var elementHeight = targetElement.offsetHeight;
    if (targetElement.childNodes.length > 0) {
        if (elementHeight == 0) {
            // 疑似遇到Microsoft Edge
            var fc = targetElement.firstChild;
            elementTop = DCDomTools.GetViewTopInDocument(fc);
            elementHeight = fc.offsetHeight;
        }
        else {
            elementHeight = targetElement.childNodes[0].offsetHeight;
            if (typeof (elementHeight) == "undefined") {
                elementHeight = targetElement.offsetHeight;
            }
        }
    }

    if (tempSpan != null ) {
        tempNode.parentNode.removeChild(tempSpan);
    }

    //elementHeight = 0;
    // 20191029 xuyiming 修复下拉框显示不全问题
    var zoomNum = isNaN(parseFloat($(document.body).css("zoom"))) ? 1 : parseFloat($(document.body).css("zoom"));
    if (document.body.getAttribute("browser") == "FireFox") {
        zoomNum = 1;
    }
    if (zoomNum > 1 && element.getAttribute("dc_innereditstyle") != null && element.getAttribute("dc_innereditstyle") != "DropdownList") {
        var bodyBottom = DCDomTools.GetDocumentClientHeight() / zoomNum;
        if(bodyBottom / 2 <= $(div).height()){
            var zoom = zoomNum >= 2 ? 0.6 : 0.7;
            $(div).find(">*").css("zoom", zoom);
            $(div).width($(div).width() * zoom);
            if (element.getAttribute("dc_innereditstyle") != "Numeric") {
                $(div).height($(div).height() * zoom);
            }
        }
    }
    var bodyBottom = (document.body.scrollTop + DCDomTools.GetDocumentClientHeight()) / zoomNum;
    var bodyRight = (document.body.scrollLeft + DCDomTools.GetDocumentClientWidth()) / zoomNum;
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;
    if (divWidth == 0) {
        // divWidth = parseInt(div.style.width) + 10;
        // divHeight = parseInt(div.style.height) + 10;
        divWidth = parseInt($(div).width()) + 10;
        divHeight = parseInt($(div).height()) + 10;
    }
    var isDownMode = true;
    var divLeft = elementLeft;
    var divTop = elementTop + elementHeight;
    if (divTop + divHeight > bodyBottom) {
        divTop = elementTop - divHeight;
        isDownMode = false;
    }
    if (divLeft + divWidth > bodyRight) {
        divLeft = bodyRight - divWidth;
    }
    if (document.body.getAttribute("browser") == "FireFox" && document.body.getAttribute("autozoom") == "true") {
        var dctable_AllContent = document.getElementById("dctable_AllContent");
        if (divTop + divHeight > dctable_AllContent.offsetTop + dctable_AllContent.offsetHeight) {
            divTop = elementTop - divHeight;
            isDownMode = false;
        }
        if (divLeft + divWidth > dctable_AllContent.offsetLeft + dctable_AllContent.offsetWidth + $(dctable_AllContent).offset().left) {
            divLeft = dctable_AllContent.offsetLeft + dctable_AllContent.offsetWidth + $(dctable_AllContent).offset().left - divWidth;
        }
    }
    div.style.left = divLeft + "px";
    div.style.top = divTop + "px";
    div.style.position = "absolute";
    var sel = DCDomTools.getSelection();
    div.style.display = "";
    DCDropdownControlManager.TickForShow = DCDomTools.GetDateMillisecondsTick(new Date());

    if (isDownMode == true) {
        div.style.borderTopColor = "red";
        div.style.borderBottomColor = "#666666";
    }
    else {
        div.style.borderBottomColor = "red";
        div.style.borderTopColor = "#666666";
    }
    //debugger;
    var btn = document.getElementById("btnCancelDropdown");
    if (btn == null) {
        DCDomTools.setActive(div);
    }
    else {
        DCDomTools.setActive(btn);
    }
    //            var btn = document.getElementById("btnCancelDropdown");
    //            if (btn != null) {
    //                btn.focus();
    //            }
    //var div = document.getElementById("divAllContainer");

    //alert(html);
    //div.setActive();
    var cur = document.getElementById("selecteddropdownlistitem");
    //alert(cur);
    if (cur != null) {
        DCDomTools.ScrollIntoView(cur);
        //cur.scrollIntoView(false);
        //cur.setActive();
    }
    DCDropdownControlManager.showingDropdownControl = false;
    var result = DCDropdownControlManager.isDropdownControlVisible();
    if (result == true) {
        DCDropdownControlManager.EventKeyDown = handleKeyDown;
        //20200619 xuyiming 添加DropdownControlPress事件来进行加载下拉列表回调
        var ctl = document.WriterControl;
        if (ctl != null && ctl.DropdownControlPress != null
            && typeof (ctl.DropdownControlPress) == "function") {
            ctl.DropdownControlPress.call(ctl, element, div);
        }
    }
    if (result == false) {
        //alert("zzz");
    }
    return result;
};


DCDropdownControlManager.GetCurrentEditInputField = function () {
    var divPopup = this.GetDropdownContainer(false);
    if (divPopup != null
        && divPopup.style.display != "none"
        && divPopup.currentElement != null) {
        return divPopup.currentElement;
    }
    return null;
};

//**************************************************************************************************************
// 判断下拉列表是否可见
DCDropdownControlManager.isDropdownControlVisible = function () {
    var div = this.GetDropdownContainer(false);
    if (div != null && div.style.display != "none") {
        return true;
    }
    return false;
};

//**************************************************************************************************************
// 检查下拉列表显示时间长度的关闭下拉列表
DCDropdownControlManager.CloseDropdownControlWithCheckTimeSpan = function () {
    var tickSpan = DCDropdownControlManager.GetTickSpan();
    if (tickSpan > 60) {
        DCDropdownControlManager.CloseDropdownControl();
    }
};
//**************************************************************************************************************
// 关闭下拉列表
// 20191104 xuyiming 添加autofocus参数来控制关闭下拉列表时是否将光标移到引发下拉列表的输入域，默认为不移动
DCDropdownControlManager.CloseDropdownControl = function (specifyType, autofocus) {
    var autoFocus = autofocus != null ? autofocus : false;
    //return;
    //this.contentEditable = true;
    //return;
    if (DCDropdownControlManager.showingDropdownControl == true) {
        return;
    }
    if (DCDropdownControlManager.TickStableDropdownControl != null) {
        var v = new Date().valueOf() - DCDropdownControlManager.TickStableDropdownControl;
        if (v >= 0) {
            DCDropdownControlManager.TickStableDropdownControl = null;
        }
        else {
            return false;
        }
    }
    //debugger;
    var div = document.getElementById("divDropdownContainer"); // this.GetDropdownContainer();
    if (div != null && div.style.display != "none") {
        //var rng9 = DCDomTools.getSelectionRange();
        //var e3 = DCWriterControllerEditor.CurrentElement();
        //debugger;
        //var e2 = DCWriterControllerEditor.CurrentElement();
        if (specifyType != null
            && div.specifyType != specifyType) {
            return false;
        }
        div.specifyType = null;
        DCDropdownControlManager.EventKeyDown = null;
        //debugger;
        var tickSpan = DCDropdownControlManager.GetTickSpan();
        if (tickSpan < 1000) {
            var a = "";
        }
        //debugger;
        //Debug.writeln("DCWriterControllerEditor.CloseDropdownControl");
        if (typeof (div.beforeCloseOnce) == "function") {
            var f = div.beforeCloseOnce;
            div.beforeCloseOnce = null;
            f();
        }
        var currentElement = div.currentElement;
        div.currentElement = null;
        div.style.display = "none";
        div.style.backgroundColor = "white";
        var funcClear = function () {
            var div2 = DCDropdownControlManager.GetDropdownContainer();
            if (div2.style.display == "none") {
                DCDomTools.removeAllChilds(div2);
                //DCDomTools.SetInnerHTML(div, "");
            }
        };
        DCDomTools.removeAllChilds(div)
        //window.setTimeout(funcClear, 1000);
        //DCSelectionManager.DelayDetectSelectionChanged(2);
        if (currentElement != null && autoFocus == true) {
            //window.setTimeout("DCWriterControllerEditor.SetFocus('" + currentElement.id + "');", 100);
            DCWriterControllerEditor.SetFocus(currentElement);
        }

    }
};

DCDropdownControlManager.PreFilterKeyDown = function (eventObject) {
    if (DCDropdownControlManager.isDropdownControlVisible() == true) {
        if (eventObject.keyCode == 27) {
            // ESC鍵，關閉下拉列表
            DCDropdownControlManager.CloseDropdownControl();
            return true;
        }
        if (typeof (DCDropdownControlManager.EventKeyDown) == "function") {
            if (DCDropdownControlManager.EventKeyDown.call(
                    DCDropdownControlManager.GetDropdownContainer( true ),
                    eventObject) == true) {
                return true;
            }
        }
    }
    return false;
};

// 获得下拉列表已经显示出来的时刻
DCDropdownControlManager.GetTickSpan = function () {
    var tickSpan = DCDomTools.GetDateMillisecondsTick(new Date()) - DCDropdownControlManager.TickForShow;
    return tickSpan;
};

//**************************************************************************************************************
DCDropdownControlManager.DetectCloseDropdownControl = function () {
    var div = DCDropdownControlManager.GetDropdownContainer(false);
    if (div != null) {
        var curElement = document.activeElement;
        while (curElement != null) {
            if (curElement == div) {
                return false;
            }
            curElement = curElement.parentNode;
        }
    }
    DCDropdownControlManager.CloseDropdownControl();
    return true;
};

//**************************************************************************************************************
DCDropdownControlManager.GetDropdownContainer = function (autoCreate) {
    if (document.body == null) {
        return null;
    }
    var id = "divDropdownContainer";
    var div = document.getElementById(id);
    if (div == null) {
        if (autoCreate == false) {
            return null;
        }
        div = document.createElement("div");
        document.body.appendChild(div);
        div.setAttribute("id", id);

        //        //div.setAttribute("onclick", "window.event.cancelBubble=true;");
        //        div.onblur = function (eventObject) {
        //            //debugger;
        //            //DCWriterControllerEditor.DetectCloseDropdownControl();
        //        };
        div.setAttribute("dcignore", "1");
        //div.setAttribute("CONTENTEDITABLE", "false");
        //div.setAttribute("UNSELECTABLE", "on");
        div.className = "";
        div.style.position = "absolute";
        div.style.backgroundColor = "window";
        div.style.borderColor = "#666666";
        div.style.borderWidth = "2px";
        div.style.borderStyle = "solid";
        div.style.cursor = "default";
        div.style.fontSize = "9pt";
        div.style.borderRadius = "4px";
        div.style.paddingTop = "3px";
        div.style.paddingBottom = "3px";
        div.style.boxShadow = "0px 3px 12px 0px #999999";
        div.style.display = "none";
        //div.setAttribute("onblur", " document.body.DetectCloseDropdownControl();");
        var wheelFunc = function (eventObject) {
            //debugger;
            //eventObject.cancelBubble = true;
            //eventObject.returnValue = false;
            //return false;
            if (eventObject.wheelDelta > 0) {
                if (document.body.scrollTop <= 0) {
                    eventObject.cancelBubble = true;
                    eventObject.returnValue = false;
                    return false;
                }
            }
            else {
                //alert(this.scrollTop);
                if (document.body.scrollTop + document.body.offsetHeight > document.body.scrollHeight) {
                    eventObject.cancelBubble = true;
                    eventObject.returnValue = false;
                    return false;
                }
            }
            return true;
        };
        DCDomTools.addEventHandler(div, "mousewheel", wheelFunc);
        //div.setAttribute("onmousewheel", "window.event.cancelBubble=true;return false;");
        div.setAttribute("oncontextmenu", "return false");
        div.close = function () {
            DCDropdownControlManager.CloseDropdownControl();
            //            //this.contentEditable = true;
            //            //debugger;
            //            this.currentElement = null;
            //            this.style.display = "none";
            //            DCDomTools.SetInnerHTML(this, "");
        };
        var onKeyDown = function (eventObject) {
            if (eventObject.keyCode == 27) {
                // 处理esc键,关闭列表
                this.close();
            }
        };
        var closeFunc = function () {
            DCDropdownControlManager.CloseDropdownControl();
        };
        div.onclick = function (e) {
            e = e || window.event;
            if (e != null) {
                DCDomTools.completeEvent(e);
            }
        };
        DCDomTools.addEventHandler(div, "keydown", onKeyDown);

        //DCDomTools.addEventHandler(this, "click", closeFunc);
        //DCDomTools.addEventHandler(div, "blur", "this.close();");
    }
    return div;
};