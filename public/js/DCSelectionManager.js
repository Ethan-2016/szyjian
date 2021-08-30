//****************************************************************************
// 文档选择区域管理器 袁永福到此一游
//****************************************************************************
var DCSelectionManager = new Object();

//****************************************************************************
// 开始启动模块
DCSelectionManager.Start = function () {
    DCSelectionManager.CurrentInputField = null;

    DCSelectionManager.EventSelectionChanged = null;

    // 开始每隔300毫秒检测一次选择区域是否改变
    var funcDetect = function () {

        if (document.body == null) {
            // 文档状态不对，不处理。
            return;
        }
        if (document.getElementById("OverloadMaxWebOnlineNumber") != null) {
            // 文档状态不对，超出并发数限制，不处理。
            return;
        }
        var field = DCSelectionManager.GetCurrentInputField();
        if (field != DCSelectionManager.LastInputFieldElement) {
            // 当前输入域发生改变
            if (DCSelectionManager.LastInputFieldElement != null) {
                // 修正上一个输入域的DOM状态
                //DCInputFieldManager.FixInputElementDom(DCSelectionManager.LastInputFieldElement);
            }
            DCSelectionManager.LastInputFieldElement = field;
        }
        var sel = DCSelectionManager.getSelection();
        var oldSel = DCSelectionManager.oldSelection;
        if (DCSelectionManager.KeyPressFlagOnce == true
            || sel.EqualsInfo(oldSel) == false) {
            // 选择状态发生改变了
            if (DCDropdownControlManager.showingDropdownControl == true) {
                // 正在打开下拉列表的过程中
                return;
            }
            if (DCDropdownControlManager.isDropdownControlVisible() == true) {
                // 下拉列表正在显示，尚未关闭
                return;
            }
            DCSelectionManager.KeyPressFlagOnce = false;
            if (oldSel != null) {

            }
            DCSelectionManager.oldSelection = sel;
            DCSelectionManager.OnSelectionChanged(false);
        }
    };
    if (document.body.getAttribute("ismobilelayout") != "true") {
        window.setInterval(funcDetect, 300);
    }

    if (document.selection && document.selection.createRange) {
        // 为IE的兼容性模式
        //        window.blurCount = 0;
        //        window.onblur = function () {
        //            DCSelectionManager.selectionRangeBack = document.selection.createRange();
        //            window.status = window.blurCount + " " + new Date().toTimeString();
        //            if (window.blurCount++ > 5 && window.blurCount < 10) {
        //                debugger;
        //            }
        //        };
        //        window.onfocus = function () {
        //            var rng = DCSelectionManager.selectionRangeBack;
        //            if (rng != null) {
        //                DCSelectionManager.selectionRangeBack = null;
        //                if (rng.select) {
        //                    rng.select();
        //                }
        //            }
        //        };
    }
};
 

// 判断当前位置所在的可编辑区域
DCSelectionManager.getCurrentEditableNode = function () {
    var sel = this.getSelection();
    var node = sel.currentContainer;
    while (node != null) {
        if (node.isContentEditable && node.isContentEditable == true) {
            return node;
        }
        if (node.getAttribute && node.getAttribute("contenteditable") == "true") {
            return node;
        }
        if (node.nodeName == "BODY") {
            return null;
        }
        node = node.parentNode;
    }
    return null;
};

// 让第一个可编辑区域获得焦点
DCSelectionManager.focusFirstEditableArea = function () {
    var div = DCWriterControllerEditor.getdivAllContainer();
    if (div != null) {
        for (var iCount = 0; iCount < div.childNodes.length; iCount++) {
            var node2 = div.childNodes[iCount];
            if (node2.nodeName == "DIV"
                && node2.getAttribute("contenteditable") == "true") {
                DCDomTools.setActive(node2);
                return true;
            } //if
        } //for
    } //if
    return false;
};

// 获得指定节点名称的当前文档元素
DCSelectionManager.getCurrentElementSpecifyNodeName = function (nodeName) {
    var sel = this.getSelection();
    if (sel != null && sel.startContainer) {
        var node = sel.startContainer;
        while (node != null) {
            if (node.nodeName == nodeName) {
                return node;
            }
            if (node.nodeName == "BODY") {
                break;
            }
            node = node.parentNode;
        }
    }
    return null;
};

//**************************************************************************************************************
// 获得原始选择信息对象
DCSelectionManager.getSelectionAndUpdateLastSelectionInfo = function () {
    var sel = DCSelectionManager.getSelection();
    if (DCSelectionManager.LastSelectionInfo != null && (sel.startContainer == null || $(sel.startContainer).parents("body")[0] != document.body)) {
        sel = DCSelectionManager.LastSelectionInfo;
    }
    DCSelectionManager.LastSelectionInfo = sel;
    return sel;
};
//**************************************************************************************************************
// 获得原始选择信息对象
DCSelectionManager.getSelection = function () {
    var ae = document.activeElement;
    if (ae != null) {
    }
    var sel = DCDomTools.getSelection(null);
    var rng = null;
    if (sel != null && sel.rangeCount > 0) {
        rng = sel.getRangeAt(0);
    }
    //if (rng == null && sel.createRange) {
    //    if (document.IsIE7 == true) {
    //        document.body.focus();
    //    }
    //    rng = sel.createRange();
    //}
    var result = new Object();
    result.instance = sel;
    result.startContainer = null;
    result.startOffset = 0;
    result.currentContainer = null;
    result.currentOffset = 0;
    result.clear = null;
    if (sel !== null) {
        result.isCollapsed = sel.isCollapsed;
    }  
    result.mainRange = null;
    result.oldType = false;
    if (sel != null && sel.anchorNode) {
        var div = DCDropdownControlManager.GetDropdownContainer(false);
        if (sel.anchorNode == div && div != null) {
            result.startContainer = div.currentElement;
            result.startOffset = 0;
            result.currentContainer = div.currentElement;
            result.currentOffset = 0;
        }
        else {
            if (sel.anchorOffset == sel.focusOffset
                && sel.anchorNode == sel.focusNode
                && sel.anchorNode.nodeName != "#text"
                && sel.anchorOffset >= 0
                && sel.anchorOffset < sel.anchorNode.childNodes.length) {
                var node = sel.anchorNode.childNodes[sel.anchorOffset];
                if (node != null && node.nodeName == "INPUT" || node.nodeName == "TEXTAREA") {
                    result.startContainer = node;
                    try {
                        result.startOffset = node.selectionStart; // 在IE下该属性可能报错。
                    }
                    catch (e8) {
                        result.startOffset = 0;
                    }
                    result.currentContainer = node;
                    try {
                        result.currentOffset = node.selectionEnd; // 在IE下该属性可能报错。
                    }
                    catch (e8) {
                        result.currentOffset = 0;
                    }
                }
            }
            if (result.startContainer == null) {
                result.startContainer = sel.anchorNode;
                result.startOffset = sel.anchorOffset;
                result.currentContainer = sel.focusNode;
                result.currentOffset = sel.focusOffset;
                if (typeof (result.isCollapsed) != "boolean") {
                    result.isCollapsed = (sel.anchorNode == sel.focusNode
                        && sel.currentContainer == sel.focusNode);
                }
            }
        }
    }
    else if (sel != null && sel.createRange) {
        var rng = sel.createRange();
        if (rng != null && rng.parentElement) {
            result.currentContainer = rng.parentElement();
            if (result.currentContainer == document.body) {
                if (document.activeElement != null ) {
                    result.currentContainer = document.activeElement;
                }
            }
            result.currentOffset = 0;
            result.startContainer = result.currentContainer;
            result.startOffset = 0;
            if (typeof (result.isCollapsed) != "boolean") {
                result.isCollapsed = rng.collapsed;
                if (typeof (result.isCollapsed) != "boolean") {
                    result.isCollapsed = (rng.startContainer == rng.endContainer
                        && rng.startOffset == rng.endOffset);
                }
            }
            result.oldType = true;
        }
    }

    //@method 从文档中删除被选中的内容。
    result.deleteFromDocument = function () {
        if (this.instance != null && this.instance.deleteFromDocument) {
            this.instance.deleteFromDocument();
            return true;
        }
        return false;
    };

    // @method 比较两个对象的信息是否完全一致
    result.EqualsInfo = function (obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (this.startContainer == obj.startContainer
            && this.startOffset == obj.startOffset
            && this.currentContainer == obj.currentContainer
            && this.currentOffset == obj.currentOffset) {
            return true;
        }
        return false;
    };
    // 是否高亮度选中了内容.
    result.hasSelection = true ;
    if (this.startContainer == this.currentContainer
        && this.startOffset == this.currentOffset) {
        result.hasSelection = false;
    }
    // @method 获得当前输入域
    result.GetCurrentInputField = function () {
        if (this.currentContainer == null) {
            return null;
        }
        var node = this.startContainer;
        if (node == null) {
            node = this.currentContainer;
        }
        while (node != null) {
            if (node.getAttribute && node.getAttribute("dctype") == "XTextInputFieldElement") {
                return node;
            }
            node = node.parentNode;
        }
    };
    //@methdo 获取插入点前面的元素
    result.GetPreNode = function () {
        if (this.currentContainer == null) {
            return null;
        }
        var node = this.startContainer;
        if (this.startOffset == 0) {
            while (node != null) {
                var node2 = node.previousSibling;
                if (node2 != null) {
                    return node2;
                }
                node = node.parentNode;
            }
            return null;
        } else if (this.startOffset != 1 && node.nodeName == "P") {
            return node.childNodes[this.startOffset - 1];
        }
        else {
            return this.startContainer;
        }
    };
    result.GetNextNode = function () {
        if (this.currentContainer == null) {
            return null;
        }
        var node = this.currentContainer;
        if (this.currentOffset > 0) {
            if (node != null && node.nodeName == "#text") {
                var len = node.nodeValue.length;
                if (this.currentOffset < len) {
                    // 插入点在文本节点中间，则返回文本节点本身
                    return node;
                }
            }
            while (node != null) {
                var node2 = node.nextSibling;
                if (node2 != null) {
                    return node2;
                }
                node = node.parentNode;
            }
            return null;
        }
        else {
            return this.currentContainer;
        }
    };
    result.Select = function () {
        if (this.startContainer != null) {
            DCDomTools.selectContent(
                this.startContainer,
                this.startOffset,
                this.currentContainer,
                this.currentOffset);
        }
    }
    return result;
};

//**************************************************************************************************************
DCSelectionManager.getSelectionWithFix = function () {
    if (document.body.getAttribute("freeselection") == "true") {
        // 自由选择模式
        return DCSelectionManager.getSelection();
    }
    if (document.activeElement) {
        var e = document.activeElement;
        if (e != null && ( e.nodeName == "INPUT") || e.nodeName == "TEXTAREA" ) {
            // 当前焦点在一个文本输入框中，没啥好修正的。
            return DCSelectionManager.getSelection();
        }
    }
    if (DCDropdownControlManager.showingDropdownControl == true) {
        // 正在显示下拉列表
        return DCSelectionManager.getSelection();
    }
    var sel = DCDomTools.getSelection(document);
    //    if (!sel.anchorNode) {
    //        DCDomTools.FoucsDocument();
    //        sel = DCDomTools.getSelection(document);
    //    }
    var result = new Object();
    result.startContainer = null;
    result.startOffset = 0;
    result.currentContainer = null;
    result.currentOffset = 0;
    result.clear = null;
    if (sel.anchorNode) {
        result.startContainer = sel.anchorNode;
        result.startOffset = sel.anchorOffset;
        result.currentContainer = sel.focusNode;
        result.currentOffset = sel.focusOffset;
        var sameRoot = DCDomTools.GetSameRootNode(result.startContainer, result.currentContainer);
        var falg = false;
        while (sameRoot != null) {
            if (sameRoot.isContentEditable) {
                falg = true;
            }
            sameRoot = sameRoot.parentNode;
        }
        if (falg == false) {
            // 选择区域超出了可编辑区域,修正选择区域
            // 首先计算startContainer和currentContainer在DOM树上的先后顺序

            sameRoot = DCDomTools.GetSameRootNode(result.startContainer, result.currentContainer);
            var rootStart = result.startContainer;
            while (rootStart != null) {
                if (rootStart.parentNode == sameRoot) {
                    break;
                }
                rootStart = rootStart.parentNode;
            }
            var rootCurrent = result.currentContainer;
            while (rootCurrent != null) {
                if (rootCurrent.parentNode == sameRoot) {
                    break;
                }
                rootCurrent = rootCurrent.parentNode;
            }
            if (rootStart == null) {
                rootStart = DCWriterControllerEditor.getdivAllContainer();
                if (rootStart != null) {
                    rootStart = rootStart.firstChild;
                }
                if (rootStart == null) {
                    return null;
                }
                result.currentContainer = rootStart;
                result.currentOffset = 0;
                result.startContainer = rootStart;
                result.startOffset = 0;
            }
            // 判断startNode是否在前
            var startNodeAtBefore = DCDomTools.GetNodeIndex(rootStart) > DCDomTools.GetNodeIndex(rootCurrent);
            //sel.collapseToStart();
            if (sel.anchorNode != null && sel.anchorNode.nodeName != "TR") {
                try {
                    sel.removeAllRanges();
                }
                catch (e) {
                }
            }
            var range = document.createRange();
            var newRootNode = null;
            // 根据开始位置获得新的可边界区域根节点
            var node2 = result.startContainer;
            while (node2 != null) {
                if (node2.isContentEditable) {
                    newRootNode = node2;
                }
                node2 = node2.parentNode;
            }
            var newRange = null;
            if (newRootNode == null) {
                // 根据结束位置获得新的可编辑区域根节点
                node2 = result.currentContainer;
                while (node2 != null) {
                    if (node2.parentNode != null && node2.parentNode.isContentEditable) {
                        newRootNode = node2;
                    }
                    node2 = node2.parentNode;
                }
                if (newRootNode != null) {
                    newRange = document.createRange();
                    if (startNodeAtBefore) {
                        newRange.setStart(newRootNode, 0);
                        newRange.setEnd(result.currentContainer, result.currentOffset);
                    }
                    else {
                        newRange.setStart(result.currentContainer, result.currentOffset);
                        newRange.setEnd(newRootNode, newRootNode.childNodes.length);
                    }
                }
            }
            else {
                // 基于startContainer重新计算选择区域
                newRange = document.createRange();
                if (startNodeAtBefore) {
                    newRange.setStart(result.startContainer, result.startOffset);
                    newRange.setEnd(newRootNode, 0); //newRootNode.childNodes.length);
                }
                else {
                    newRange.setStart(newRootNode, 0);
                    newRange.setEnd(result.startContainer, result.startOffset);
                }
            }
            if (newRange != null) {
                //sel.collapseToStart();
                if (sel.anchorNode != null && sel.anchorNode.nodeName != "TR") {
                    try {
                        // 在IE中这里有可能报错，在此忽略掉错误。
                        sel.removeAllRanges();
                    }
                    catch (e) {

                    }
                }
                sel.addRange(newRange);
                result.startContainer = sel.anchorNode;
                result.startOffset = sel.anchorOffset;
                result.currentContainer = sel.focusNode;
                result.currentOffset = sel.focusOffset;
            }
        }
        // 进行输入域边界元素的修正
        var isSame = result.startContainer == result.currentContainer && result.startOffset == result.currentOffset;
        var node = sel.anchorNode;
        while (node != null) {
            if (node.nodeName == "SPAN") {
                var dcType = node.getAttribute("dctype");
                if (dcType == "start") {
                    if (sel.anchorOffset == 0) {
                        // 在输入域开始边界元素之前
                        var fieldNode = node.parentNode;
                        var pn = fieldNode.parentNode;
                        result.startContainer = pn;
                        result.startOffset = DCDomTools.IndexOfChildNode(pn, fieldNode) - 1;
                        if (result.startOffset < 0) {
                            result.startOffset = 0;
                        }
                    }
                    break;
                }
                else if (dcType == "end") {
                    if (sel.anchorOffset > 0) {
                        var fieldNode = node.parentNode;
                        var pn = fieldNode.parentNode;
                        if (fieldNode.nextSibling == null) {
                            result.startContainer = pn;
                            result.startOffset = pn.childNodes.length;
                        }
                        else {
                            result.startContainer = pn;
                            result.startOffset = DCDomTools.IndexOfChildNode(pn, fieldNode);
                        }
                    }
                    break;
                }
            }
            node = node.parentNode;
        } //while
        if (isSame) {
            result.currentContainer = result.startContainer;
            result.currentOffset = result.startOffset;
        }
    }
    else if (sel.createRange) {
        var rng = sel.createRange();
        if (rng.parentElement) {
            result.currentContainer = rng.parentElement();
            result.currentOffset = 0;
            result.startContainer = result.currentContainer;
            result.startOffset = 0;
        }
    }
    result.EqualsInfo = function (obj) {
        if (obj == null) {
            return false;
        }
        if (this.startContainer == obj.startContainer
            && this.startOffset == obj.startOffset
            && this.currentContainer == obj.currentContainer
            && this.currentOffset == obj.currentOffset) {
            return true;
        }
        return false;
    };
    if (sel.clear) {
        result.clear = function () {
            sel.clear();
        };
    }
    if (sel.empty) {
        result.empty = function () {
            sel.empty();
        };
    };
    return result;
};

// 判断当前插入点是否在编辑文档的正文中。
DCSelectionManager.isSelectionInXTextDocumentBodyElement = function () {
    var baseElement = null;
    if (document.activeElement) {
        baseElement = document.activeElement;
    }
    if (baseElement == null) {
        var sel = DCSelectionManager.getSelection();
        baseElement = sel.startContainer;
    }
    while (baseElement != null) {
        if (baseElement.getAttribute && baseElement.getAttribute("dctype") == "XTextDocumentBodyElement") {
            return true;
        }
        baseElement = baseElement.parentNode;
    }
    return false;
};

//**************************************************************************************************************
// 获得当前插入点所在是输入域对象
DCSelectionManager.GetCurrentInputFieldBySelection = function () {
    if (document.activeElement
        //WYC20200228：排除表单模式，否则document.activeElement会定位到外层父输入域
        && DCWriterControllerEditor.IsFormView() == false) {
        var e = document.activeElement;
        if (DCInputFieldManager.IsInputFieldElement(e)) {
            return e;
        }
    }
    var sel = DCSelectionManager.getSelection();
    if (sel != null) {
        var node = sel.startContainer;
        if (node != null && node.nodeName && node.nodeName == "#text") {
            var txt = node.nodeValue;
            if (sel.startOffset == txt.length) {
                // 插入点在一个文本元素的最后面，则调整当前元素节点
                var newNode = node;
                while (newNode != null) {
                    if (newNode.getAttribute && newNode.getAttribute("dctype") == "start") {
                        return newNode.parentNode;
                    }
                    if (newNode.nextSibling == null) {
                        newNode = newNode.parentNode;
                    }
                    else {
                        newNode = newNode.nextSibling;
                        break;
                    }
                }
                node = newNode;
                if (DCInputFieldManager.IsInputFieldElement(node)) {
                    node = node.parentNode;
                }
            }
        }
        while (node != null) {
            if (node.getAttribute) {
                var dcType = node.getAttribute("dctype");
                if (dcType == "start" && sel.startOffset == 0) {
                    // 起始元素不算在输入域中,跳过
                    node = node.parentNode;
                    //continue;
                }
                else if (dcType == "XTextInputFieldElement") {
                    return node;
                }
            }
            node = node.parentNode;
        }
    }
    return null;
};

//**************************************************************************************************************
// 获得当前插入点所在是输入域对象
DCSelectionManager.GetCurrentInputField = function () {
    var field = DCSelectionManager.GetCurrentInputFieldBySelection();
    if (field == null) {
        field = DCDropdownControlManager.GetCurrentEditInputField();
    }
    return field;
};



// 处理插入点发生改变事件
DCSelectionManager.OnSelectionChanged = function (fixInputFieldDomState) {
    //alert("sssss");
    var body = document.body;
    if (DCSelectionManager.EventSelectionChanged != null) {
        DCSelectionManager.EventSelectionChanged();
    }
    var sel = DCSelectionManager.LastSelectionInfo;
    if (sel != null) {
        var node = sel.startContainer;
        var endNodeIndex = 0;
        if (node != null && !node.getAttribute) {
            endNodeIndex = DCDomTools.GetNodeIndex(node);
            if (endNodeIndex == 0) {
                if (node.nodeName == "#text" && node.nodeValue != null) {
                    if (sel.startOffset == node.nodeValue.length) {
                        // 插入点在文本最后
                        endNodeIndex = 1;
                    }
                }
            }
            node = node.parentNode;
        }
        if (node != null && node.getAttribute("dctype") == "end" && endNodeIndex > 0) {
            // 插入点紧跟着输入域后边界元素的后面，重点关注一下
            while (node != null) {
                if (DCInputFieldManager.IsInputFieldElement(node)) {
                    break;
                }
                node = node.parentNode;
            }
            if (node != null) {
                //                if (DCInputFieldManager.FixInputElementDom(node) == true) {
                //                    if (node.nextSibling != null) {
                //                        DCDomTools.MoveCaretToEnd(node.nextSibling);
                //                    }
                //                }
            }
        }
    }
    var field = null;
    if (DCSelectionManager.isSelectionInXTextDocumentBodyElement()) {

        field = DCSelectionManager.GetCurrentInputFieldBySelection();
    }
    else {
        field = DCSelectionManager.GetCurrentInputField();
    }
    if (field != DCSelectionManager.CurrentInputField
        //wyc20200529：注释掉看看效果
        /*|| DCInputFieldManager.IsBackgroundTextVisible(DCSelectionManager.CurrentInputField) == false*/) {
        if (DCSelectionManager.CurrentInputField != null) {
            var field2 = DCSelectionManager.CurrentInputField;
            DCSelectionManager.CurrentInputField = field;
            if (fixInputFieldDomState == true) {
                DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
            }
            //DCInputFieldManager.FixInputElementDom(field2);
            // 20200707 xym 解决表单模式下输入域失去焦点事件会触发2次问题
            if (DCDomTools.isContentEditable(field2) == true && DCWriterControllerEditor.IsFormView() == false) {
                DCInputFieldManager.HandleInputFieldEvent(null, field2, "onblur");
            }
        }
        DCSelectionManager.CurrentInputField = field;
        if (field != null && DCDomTools.isContentEditable(field) == true) {
            DCInputFieldManager.HandleInputFieldEvent(null, field, "onfocus");
        }
        if (DCDropdownControlManager.showingDropdownControl == false) {
            if (DCDropdownControlManager.GetCurrentEditInputField() != field) {
                DCDropdownControlManager.CloseDropdownControl();
            }
        }
    }
    DCDocumentCommentManager.ActiveCurrentComment();
};

// 延迟进行选择区域的检测
DCSelectionManager.DelayDetectSelectionChanged = function (delaySeconds) {
    DCSelectionManager.TickDelayDetectSelectionChanged = DCDomTools.GetCurrentDateMillisecondsTick() + delaySeconds * 1000;
};

DCSelectionManager.ResetOldSelectionState = function () {
    DCSelectionManager.oldSelection = null;
};

DCSelectionManager.UpdateOldSelectionState = function () {
    DCSelectionManager.oldSelection = DCSelectionManager.getSelection();
};
DCSelectionManager.detectSelectionChanged = function () {
    //return;
    if (DCWriterControllerEditor.readonly == true) {
        // 控件是只读的，不操作
        return;
    }
    if (DCDropdownControlManager.isDropdownControlVisible() == true) {
        // 正在显示下拉列表，不执行操作
        if (DCSelectionManager.IgnoreDropdownStateOnce == true) {
            DCSelectionManager.IgnoreDropdownStateOnce = false;
        }
        else {
            return;
        }
    }
    if (DCSelectionManager.TickDelayDetectSelectionChanged != null) {
        if (DCDomTools.GetCurrentDateMillisecondsTick() < DCSelectionManager.TickDelayDetectSelectionChanged) {
            // 被延时了
            return;
        }
        DCSelectionManager.TickDelayDetectSelectionChanged = null;
    }
    var sel = DCSelectionManager.getSelection();
    if (sel.EqualsInfo(DCSelectionManager.oldSelection)) {
        return;
    }
    DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
    //DCInputFieldManager.FixInputElementDomWithDetectBorderElement();
    sel = DCSelectionManager.getSelection();
    if (sel.startContainer != null) {
        // 记录最后一次有效的当前状态
        DCSelectionManager.LastSelectionInfo = sel;
        DCSelectionManager.LastSelectionInfoWithFix = DCSelectionManager.getSelectionWithFix();
    }
    if (DCSelectionManager.KeyPressFlagOnce == true) {
        DCSelectionManager.oldSelection = sel;
        DCSelectionManager.KeyPressFlagOnce = false;
        return;
    }
    var oldSel = DCSelectionManager.oldSelection;
    if (DCSelectionManager.KeyPressFlagOnce == true
        || sel.EqualsInfo(oldSel) == false) {
        if (DCDropdownControlManager.showingDropdownControl == true) {
            // 正在打开下拉列表的过程中
            return;
        }
        if (DCDropdownControlManager.isDropdownControlVisible() == true) {
            // 下拉列表正在显示，尚未关闭
            return;
        }
        DCSelectionManager.KeyPressFlagOnce = false;
        if (oldSel != null) {

        }
        DCSelectionManager.oldSelection = sel;
        DCSelectionManager.OnSelectionChanged();
    }
};


DCSelectionManager.UpdateSelectionChangedForClick = function () {
    //return;
    if (DCWriterControllerEditor.readonly == true) {
        // 控件是只读的，不操作
        return;
    }
    if (DCDropdownControlManager.isDropdownControlVisible() == true) {
        // 正在显示下拉列表，不执行操作
        if (DCSelectionManager.IgnoreDropdownStateOnce == true) {
            DCSelectionManager.IgnoreDropdownStateOnce = false;
        }
        else {
            return;
        }
    }
     
    var sel = DCSelectionManager.getSelection();
    if (sel.EqualsInfo(DCSelectionManager.oldSelection)) {
        //return;
    }
    DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
    //DCInputFieldManager.FixInputElementDomWithDetectBorderElement();
    sel = DCSelectionManager.getSelection();
    if (sel.startContainer != null) {
        // 记录最后一次有效的当前状态
        DCSelectionManager.LastSelectionInfo = sel;
        DCSelectionManager.LastSelectionInfoWithFix = DCSelectionManager.getSelectionWithFix();
    }
    if (DCSelectionManager.KeyPressFlagOnce == true) {
        DCSelectionManager.oldSelection = sel;
        DCSelectionManager.KeyPressFlagOnce = false;
        return;
    }
    var oldSel = DCSelectionManager.oldSelection;
    if (DCSelectionManager.KeyPressFlagOnce == true
        || sel.EqualsInfo(oldSel) == false) {
        if (DCDropdownControlManager.showingDropdownControl == true) {
            // 正在打开下拉列表的过程中
            return;
        }
        //        if (DCDropdownControlManager.isDropdownControlVisible() == true) {
        //            // 下拉列表正在显示，尚未关闭
        //            return;
        //        }
        DCSelectionManager.KeyPressFlagOnce = false;
        if (oldSel != null) {

        }
        DCSelectionManager.oldSelection = sel;
        DCSelectionManager.OnSelectionChanged( true );
    }
};