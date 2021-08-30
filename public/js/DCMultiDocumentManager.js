// 多文档处理功能模块
// 袁永福 2015-7-21

var DCMultiDocumentManager = new Object();

DCMultiDocumentManager.Start = function () {
    var items = this.getAllDocumentInfos();
};

// 判断是否处于一个文档中
DCMultiDocumentManager.isInDocument = function (element) {
    while (element != null) {
        if (this.isXTextDocumentBodyElement(element)) {
            return true;
        }
        element = element.parentNode;
    }
    return false;
};

// 处理文档拖拽事件
DCMultiDocumentManager.handleDocumentDragEvent = function (eveArgs, eventName) {
    if (eveArgs == null) {
        if (window.event) {
            eveArgs = window.event;
        }
    }
    DCDomTools.completeEvent(eveArgs);
    DCDomTools.moveCaretToPoint(eveArgs.clientX , eveArgs.clientY );
    var rootWriterControl = document.WriterControl;
    if (rootWriterControl != null) {
        var callback = rootWriterControl.callbackDocumentDragEvent;
        if (callback != null) {
            callback(eveArgs, eventName);
        }
    }
};


// 获得当前文档编号
DCMultiDocumentManager.getCurrentDocumentIndex = function () {
    var item = DCMultiDocumentManager.getCurrentInfo();
    if (item == null) {
        return -1;
    }
    else {
        return item.index;
    }
};

DCMultiDocumentManager.isXTextDocumentBodyElement = function (element) {
    if (element == null) {
        return false;
    }
    if (element.getAttribute && element.getAttribute("dctype") == "XTextDocumentBodyElement") {
        return true;
    }
    return false;
};

// 获得当前光标所在的文档内容容器元素
DCMultiDocumentManager.getOwnerDocumentContentElement = function (element) {
    while (element != null) {
        if (this.isXTextDocumentBodyElement(element)) {
            return element;
        } //if
        element = element.parentNode;
    } //while
    return null;
}

// 获得当前光标所在的文档内容容器元素
DCMultiDocumentManager.getCurrentDocumentContentElement = function () {
    var sel = DCSelectionManager.getSelection();
    if (sel != null) {
        var e = sel.startContainer;
        while (e != null) {
            if (this.isXTextDocumentBodyElement(e)) {
                return e;
            } //if
            e = e.parentNode;
        } //while
    };
    return null;
};

// 获得当前光标所在的文档信息
DCMultiDocumentManager.getCurrentInfo = function () {
    DCMultiDocumentManager.getAllDocumentInfos();
    var box = this.getCurrentDocumentContentElement();
    if (box != null) {
        return box.documentInfo;
    }
    return null;
};

// 重置状态
DCMultiDocumentManager.reset = function () {
    DCMultiDocumentManager.allDocumentInfos = null;
};

// 获得文档个数
DCMultiDocumentManager.getDocumentCount = function () {
    var list = DCMultiDocumentManager.getAllDocumentInfos();
    return list.length;
};

// 选择文档
DCMultiDocumentManager.selectDocument = function (index) {
    var item = DCMultiDocumentManager.getDocumentInfo(index);
    if (item != null) {
        item.select();
        return true;
    }
    return false;
};

// 获得指定文档信息
DCMultiDocumentManager.getDocumentInfo = function (index) {
    var list = DCMultiDocumentManager.getAllDocumentInfos();
    if (index >= 0 && index < list.length) {
        return list[index];
    }
    else {
        return null;
    }
};

// 修改文档内容修改标记属性
DCMultiDocumentManager.writeModifyAttribute = function () {
    var items = this.getAllDocumentInfos();
    for (var iCount = 0; iCount < items.length; iCount++) {
        var item = items[iCount];
        item.element.setAttribute("dcmodified", item.getModified() == true ? "true" : "false");
    }
};

// 判断文档html内容是否改变
DCMultiDocumentManager.getModified = function () {
    var items = this.getAllDocumentInfos();
    for (var iCount = 0; iCount < items.length; iCount++) {
        var item = items[iCount];
        if (item.getModified() == true) {
            return true;
        }
    }
    return false;
};

// 重置html修改标记
DCMultiDocumentManager.resetModified = function () {
    var items = this.getAllDocumentInfos();
    for (var iCount = 0; iCount < items.length; iCount++) {
        var item = items[iCount];
        item.resetModify();
        return true;
    }
    return false;
};

// 判断文档text内容是否改变
DCMultiDocumentManager.getTextModified = function () {
    var items = this.getAllDocumentInfos();
    for (var iCount = 0; iCount < items.length; iCount++) {
        var item = items[iCount];
        if (item.getTextModified() == true) {
            return true;
        }
    }
    return false;
};

// 重置text修改标记
DCMultiDocumentManager.resetTextModified = function () {
    var items = this.getAllDocumentInfos();
    for (var iCount = 0; iCount < items.length; iCount++) {
        var item = items[iCount];
        item.resetTextModify();
        return true;
    }
    return false;
};

// 获得所有文档信息列表
DCMultiDocumentManager.getAllDocumentInfos = function () {
    var result = DCMultiDocumentManager.allDocumentInfos;
    if (result != null) {
        return result;
    }
    var rootDiv = DCWriterControllerEditor.getdivAllContainer();
    if (rootDiv == null) {
        return null;
    }
    result = new Array();
    DCMultiDocumentManager.allDocumentInfos = result;
    var docIndex = -1;
    for (var iCount = 0; iCount < rootDiv.childNodes.length; iCount++) {
        var div = rootDiv.childNodes[iCount];
        if (div.getAttribute && div.getAttribute("dctype") == "XTextDocumentBodyElement") {
            docIndex++;
            if (div.style.display == "none") {
                //  元素是隐藏的
                continue;
            }
            var info = new Object();
            div.documentInfo = info;
            result.push(info);
            info.index = docIndex;
            info.title = div.getAttribute("documenttitle");
            info.element = div;
            info.readonly = div.getAttribute("readonly") == "true";
            info.innerHtmlBack = DCDomTools.GetInnerHTML(div);
            info.innerTextBack = $(div).text();
            // 重置html修改标记
            info.resetModify = function () {
                this.innerHtmlBack = DCDomTools.GetInnerHTML(this.element);
            }
            // 重置text修改标记
            info.resetTextModify = function () {
                this.innerTextBack = $(this.element).text();
            }
            // 获得文档html内容是否被修改了
            info.getModified = function () {
                var html = DCDomTools.GetInnerHTML(this.element);
                if (html != this.innerHtmlBack) {
                    return true;
                }
                return false;
            }
            // 获得文档text内容是否被修改了
            info.getTextModified = function(){
                // 20210201 xym 修复编辑器被隐藏时获取‘控件文档内容是否改变’不对问题(BSDCWRIT-113)
                var html = $(this.element).text();
                if (html != this.innerTextBack) {
                    return true;
                }
                return false;
            }
            info.select = function () {
                if (this.readonly) {
                    // 只读的无法选择
                    return;
                }
                if (DCMultiDocumentManager.getCurrentInfo() != this) {
                    DCWriterControllerEditor.SetFocus(this.element);
                    DCDomTools.selectContent(
                        this.element,
                        0,
                        this.element,
                        this.element.childNodes.length
                        );
                    if (this.element.scrollIntoView) {
                        this.element.scrollIntoView();
                    }
                }
            };
            info.locked = div.getAttribute("locked") == "true";
            info.setReadonly = function (readonly) {
                if (this.locked == true) {
                    // 文档被锁定，无法执行操作
                    return false;
                }
                resul.readonly = readonly;
                if (readonly == true) {
                    div.setAttribute("contenteditable", "false");
                    return true;
                }
                else {
                    if (document.body.getAttribute("readonly") != "true") {
                        div.setAttribute("contenteditable", "true");
                        return true;
                    }
                }
                return false;
            };
        } //if
    } //for
    return result;
};