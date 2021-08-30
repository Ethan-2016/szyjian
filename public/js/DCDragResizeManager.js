// 拖拽方式修改对象大小的管理器

var DCDragResizeManager = new Object();

DCDragResizeManager.IDForResizeBox = "divDCResizeBox20150706";

DCDragResizeManager.GetResizeBox = function (autoCreate) {
    var box = document.getElementById("divDCResizeBox20150706");
    if (box == null && autoCreate == false) {
        return null;
    }
    if (box == null) {
        box = document.createElement("div");
        document.body.appendChild(box);
        box.id = "divDCResizeBox20150706";
        box.setAttribute("style", "cursor:default;position:absolute;z-index:10004;border:1px dashed black;display:none;text-align:center");
        box.setAttribute("dcignore", "1");
        box.setAttribute("unselectable", "on");
        box.setAttribute("contenteditable", "false");
        box.ondblclick = function (eventSender) {
            var srcElement = DCDragResizeManager.currentElement;
            if (srcElement != null) {
                if (srcElement.ondblclick != null) {
                    srcElement.ondblclick();
                }
            }
        };

        var lbl = document.createElement("span");
        lbl.setAttribute("style", "font-size:10pt;background-color:lightblue;border:1px solid black;position:relative;top:7px;display:none;width:1px;height:1px");
        lbl.id = box.id + "_label";
        box.appendChild(lbl);
        lbl.appendChild(document.createTextNode("    "));

        var handlerStyle = "position:relative;width:5px;height:5px;background-color:blue;border:1px solid black;";
        var handlerStyle2 = "position:relative;width:5px;height:5px;background-color:white;border:1px solid black;";
        var handler = document.createElement("div");
        handler.id = box.id + "_1";
        handler.setAttribute("handlerindex", "1");
        handler.setAttribute("style", handlerStyle2);
        //handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this ,1);");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 1 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this ,1 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_2";
        handler.setAttribute("handlerindex", "2");
        handler.setAttribute("style", handlerStyle2);
        //handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this ,2 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 2 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 2 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_3";
        handler.setAttribute("handlerindex", "3");
        handler.setAttribute("style", handlerStyle2);
        //handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this , 3 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 3 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 3 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_4";
        handler.setAttribute("handlerindex", "4");
        handler.setAttribute("style", "cursor:e-resize;" + handlerStyle);
        handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this , 4 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 4 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 4 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_5";
        handler.setAttribute("handlerindex", "5");
        handler.setAttribute("style", "cursor:se-resize;" + handlerStyle);
        handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this , 5 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 5);");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 5 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_6";
        handler.setAttribute("handlerindex", "6");
        handler.setAttribute("style", "cursor:s-resize;" + handlerStyle);
        handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this , 6 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 6 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 6 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_7";
        handler.setAttribute("handlerindex", "7");
        handler.setAttribute("style", handlerStyle2);
        //handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this , 7 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 7 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 7 );");
        box.appendChild(handler);

        handler = document.createElement("div");
        handler.id = box.id + "_8";
        handler.setAttribute("handlerindex", "8");
        handler.setAttribute("style", handlerStyle2);
        //handler.setAttribute("onmousedown", "DCDragResizeManager.OnHandlerMouseDown( event , this , 8 );");
        //handler.setAttribute("onmousemove", "DCDragResizeManager.OnHandlerMouseMove( event , this , 8 );");
        //handler.setAttribute("onmouseup", "DCDragResizeManager.OnHandlerMouseUp( event , this , 8 );");
        box.appendChild(handler);


    }
    return box;
};

// 预先处理文档案件按下事件
DCDragResizeManager.PreFilterKeyDown = function (eventObject) {
    var box = DCDragResizeManager.GetResizeBox(false);
    if (box != null && box.style.display != "none") {
        // 正在显示拖拽界面
        var targetElement = DCDragResizeManager.currentElement;
        // 37:左光标键 38:上光标键 39:右光标键 40:下光标键 35:End 36:Home 33:PageUp 34:PageDown
        if (targetElement != null) {
            if (eventObject.keyCode == 37
                || eventObject.keyCode == 38
                || eventObject.keyCode == 36
                || eventObject.keyCode == 33) {
                // DCDomTools.MoveCaretTo(targetElement);
                DCDomTools.MoveCaretToIndex(targetElement, 0);
                DCDomTools.completeEvent(eventObject);
                DCDragResizeManager.CloseBox();
                return true;
            }
            if (eventObject.keyCode == 39
                || eventObject.keyCode == 40
                || eventObject.keyCode == 35
                || eventObject.keyCode == 34) {
                DCDomTools.MoveCaretToEnd(targetElement);
                DCDomTools.completeEvent(eventObject);
                DCDragResizeManager.CloseBox();
                return true;
            }
        }
    }
    return false;
};

// 更新各个控制点的位置
DCDragResizeManager.UpdateHandlerPosition = function () {
    var box = DCDragResizeManager.GetResizeBox();
    if (box == null || box.style.display == "hidden") {
        return;
    }
    var srcElement = DCDragResizeManager.currentElement;
    if (srcElement == null) {
        return;
    }

    var rect = DCDomTools.GetAbsBoundsInDocument(srcElement);
    if (typeof (document.body.zoomRate) == "number") {
        // 文档存在缩放
        var rate = document.body.zoomRate;
        //rect.Left =Math.round(rect.Left * rate);
        //rect.Top = Math.round(rect.Top * rate);
        //rect.Width = Math.round(rect.Width * rate);
        //rect.Height = Math.round(rect.Height * rate);
    }
    //var boxLeft = DCDomTools.GetViewLeftInDocument(srcElement);
    //var boxTop = DCDomTools.GetViewTopInDocument(srcElement);
    //var boxWidth = srcElement.offsetWidth;
    //var boxHeight = srcElement.offsetHeight;
    // 20201230 xym 修复图片选中框和图片之间有偏差问题
    box.style.left = rect.Left + "px";
    box.style.top = rect.Top + "px";
    box.style.width = rect.Width + "px";
    box.style.height = rect.Height + "px";

    var lbl = document.getElementById(box.id + "_label");
    if (lbl != null) {
        DCDomTools.SetInnerText(
            lbl,
            document.GetDCWriterString(
                "JS_SizeLabel_Width_Height",
                rect.Width,
                rect.Height));
    }
    var boxLeft = 0; // parseFloat(box.style.left);
    var boxTop = 0; // parseFloat(box.style.top);
    var boxWidth = box.offsetWidth;
    var boxHeight = box.offsetHeight;
    var topFix = 0;
    for (var iCount = 0; iCount < box.childNodes.length; iCount++) {
        var handler = box.childNodes[iCount];
        var handlerindex = handler.getAttribute("handlerindex");
        switch (handlerindex) {
            case "1":
                {
                    handler.style.left = boxLeft + "px";
                    handler.style.top = (boxTop + 1) + "px";
                }
                break;
            case "2":
                {
                    handler.style.left = (boxLeft + (boxWidth - handler.offsetWidth) / 2) + "px";
                    handler.style.top = (boxTop + 1) + "px";
                }
                break;
            case "3":
                {
                    handler.style.left = (boxLeft + boxWidth - handler.offsetWidth) + "px";
                    handler.style.top = (boxTop + 1) + "px";
                }
                break;
            case "4":
                {
                    handler.style.left = (boxLeft + boxWidth - handler.offsetWidth) + "px";
                    handler.style.top = (boxTop + (boxHeight - handler.offsetHeight) / 2) + "px";
                }
                break;
            case "5":
                {
                    handler.style.left = (boxLeft + boxWidth - handler.offsetWidth) + "px";
                    handler.style.top = (boxTop + boxHeight - handler.offsetHeight + 1) + "px";
                }
                break;
            case "6":
                {
                    handler.style.left = (boxLeft + (boxWidth - handler.offsetWidth) / 2) + "px";
                    handler.style.top = (boxTop + boxHeight - handler.offsetHeight + 1) + "px";
                }
                break;
            case "7":
                {
                    handler.style.left = boxLeft + "px";
                    handler.style.top = (boxTop + boxHeight - handler.offsetHeight + 1) + "px";
                }
                break;
            case "8":
                {
                    handler.style.left = boxLeft + "px";
                    handler.style.top = (boxTop + (boxHeight - handler.offsetHeight) / 2) + "px";
                }
                break;
        } //switch
        boxTop -= handler.offsetHeight + topFix;
    } //for
};

// 关闭拖拽框
DCDragResizeManager.CloseBox = function () {
    var box = DCDragResizeManager.GetResizeBox(false);
    if (box != null) {
        if (box.style.display != "none") {
            box.style.display = "none";
        }
    }
    DCDragResizeManager.currentHandler = null;
    DCDragResizeManager.lastX = null;
    DCDragResizeManager.lastY = null;
};

DCDragResizeManager.HandleBodyMouseMove = function (eventObject) {
    //return;
    if (DCDragResizeManager.currentHandler == null) {
        return false;
    }
    var obj = DCDragResizeManager.currentElement;
    if (obj == null) {
        return false;
    }
    var pointIndex = parseInt(DCDragResizeManager.currentHandler.getAttribute("handlerindex"));
    // 鼠标左键按下
    if (DCDragResizeManager.lastX == null) {
        DCDragResizeManager.lastX = eventObject.screenX;
        DCDragResizeManager.lastY = eventObject.screenY;
        DCDragResizeManager.startWidth = obj.offsetWidth;
        DCDragResizeManager.startHeight = obj.offsetHeight;
    }
    var lastX = DCDragResizeManager.lastX;
    var lastY = DCDragResizeManager.lastY;
    if (lastX != null) {
        var dx = eventObject.screenX - lastX;
        var dy = eventObject.screenY - lastY;
        if (pointIndex == 4) {
            dy = 0;
        }
        if (pointIndex == 6) {
            dx = 0;
        }
        if (dx != 0 || dy != 0) {
            if (typeof (document.body.zoomRate) == "number"
                && document.body.zoomRate > 0) {
                dx = dx / document.body.zoomRate;
                dy = dy / document.body.zoomRate;
            }
            var w = DCDragResizeManager.startWidth + dx;
            var h = DCDragResizeManager.startHeight + dy;
            if (w > 20 && h > 20) {
                obj.style.width = w;
                obj.width = w;
                obj.style.height = h;
                obj.height = h;
                DCDragResizeManager.UpdateHandlerPosition();
                DCDomTools.BubbleRaiseChanged(obj);
            }
            if (eventObject.stopPropagation) {
                eventObject.stopPropagation();
            }
            eventObject.cancelBubble = true;
            var box = DCDragResizeManager.GetResizeBox();
            var lbl = document.getElementById(box.id + "_label");
            if (lbl != null) {
                lbl.style.visibility = "";
            }
            // DCDomTools.MoveCaretTo(obj);
            DCDomTools.MoveCaretToIndex(obj, 0);
            return true;
        }
    }
    return false;
};

DCDragResizeManager.HandleBodyMouseUp = function (eventObject) {
    //return;
    if (DCDragResizeManager.currentHandler != null) {
        DCDragResizeManager.lastX = null;
        DCDragResizeManager.lastY = null;
        DCDragResizeManager.currentHandler = null;
        if (DCDragResizeManager.currentElement != null) {
            var element = DCDragResizeManager.currentElement;
            // DCDomTools.MoveCaretTo(element);
            DCDomTools.MoveCaretToIndex(element, 0);
            var box = DCDragResizeManager.GetResizeBox();
            var lbl = document.getElementById(box.id + "_label");
            if (lbl != null) {
                lbl.style.visibility = "hidden";
            }
            DCMedicalExpressionManager.UpdateImageSrc(element);
        }
    }
};

// 处理文档正文鼠标点击事件
// 如果处理了事件，无需其他模块后续处理则返回true，如果没有处理则返回false.
DCDragResizeManager.HandleBodyClick = function (eventObject) {
    //return;
    if (DCDomTools.isIE == true
        //|| DCDomTools.isFirefox == true
    ) {
        // 对于IE和Firefox，内置这种功能，无需处理
        return false;
    }
    if (document.body.getAttribute("readonly") == "true") {
        // 控件只读
        return false;
    }
    if (document.body.getAttribute("ismobiledevice") == "true") {
        // 运行在移动平台上，该功能无效
        return false;
    }
    var srcElement = null;
    if (eventObject.srcElement) {
        srcElement = eventObject.srcElement;
    }
    else if (eventObject.target) {
        srcElement = eventObject.target;
    }
    if (srcElement == null) {
        DCDragResizeManager.CloseBox();
        return false;
    }
    // 判断当前是否点击了拖拽框本身
    var box = DCDragResizeManager.GetResizeBox();
    var p = srcElement;
    while (p != null) {
        if (p == box) {
            return true;
        }
        p = p.parentNode;
    }
    if (srcElement.nodeName != "IMG") {
        //        && srcElement.nodeName != "OBJECT"
        //        && srcElement.nodeName != "VIDEO") {
        DCDragResizeManager.CloseBox();
        return false;
    }
    if (srcElement.isContentEditable != true) {
        DCDragResizeManager.CloseBox();
        return false;
    }
    box.style.display = "";
    // DCDomTools.MoveCaretTo(srcElement);
    DCDomTools.MoveCaretToIndex(srcElement, 0);
    DCDragResizeManager.currentElement = srcElement;
    DCDragResizeManager.UpdateHandlerPosition();
    //window.setTimeout(function () { DCDomTools.MoveCaretTo(srcElement); }, 50);
    return true;
};

DCDragResizeManager.OnHandlerMouseDown = function (eventObject, element, handlerIndex) {
    //return;
    if (document.body.getAttribute("readonly") == "true") {
        // 控件只读
        return;
    }
    DCDragResizeManager.currentHandler = element;
    if (eventObject.stopImmediatePropagation) {
        eventObject.stopImmediatePropagation();
    }
    if (eventObject.preventDefault) {
        eventObject.preventDefault();
    }


    var btn = eventObject.button;
    //    if (element.setCapture) {
    //        element.setCapture(true);
    //    }
};

DCDragResizeManager.OnHandlerMouseMove = function (eventObject, element, handlerIndex) {
    //    if (DCDragResizeManager.currentHandler != element) {
    //        return;
    //    }
    //    if (eventObject.button != 0) {
    //        var a = "";
    //    }
    //    //if (eventObject.button == 1) 
    //    {
    //        var obj = DCDragResizeManager.currentElement;
    //        if (obj == null) {
    //            return;
    //        }
    //        // 鼠标左键按下
    //        var lastX = element.lastX;
    //        var lastY = element.lastY;
    //        element.lastX = eventObject.screenX;
    //        element.lastY = eventObject.screenY;
    //        if (lastX != null) {
    //            element.lastX = eventObject.screenX;
    //            element.lastY = eventObject.screenY;
    //            var dx = eventObject.screenX - lastX;
    //            var dy = eventObject.screenY - lastY;
    //            if (dx != 0 && dy != 0) {
    //                var w = obj.offsetWidth + dx;
    //                var h = obj.offsetHeight + dy;
    //                obj.style.width = w;
    //                obj.style.height = h;
    //                DCDragResizeManager.UpdateHandlerPosition();
    //            }
    //        }
    //    }
};

DCDragResizeManager.OnHandlerMouseUp = function (eventObject, element, handlerIndex) {
    //    element.lastX = null;
    //    element.lastY = null;
    //    DCDragResizeManager.currentElement = null;
    //    DCDragResizeManager.currentHandler = null;
};