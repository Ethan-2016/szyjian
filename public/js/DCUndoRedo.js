//
// 执行编辑的UNDO/REDO功能
// 袁永福到此一游 2019-1-18
//
var DCUndoRedo = new Array();
DCUndoRedo.currentIndex = -1;

DCUndoRedo.Enabled = true;

DCUndoRedo.innerFixInfo = function () {
    if (this.length >= this.currentIndex) {
        for (var iCount = this.length - 1;
            iCount > this.currentIndex && iCount >= 0;
            iCount--) {
            this.pop(iCount);
        }
    }
};

DCUndoRedo.RaiseChanged = function () {
    var div = document.getElementById("divDocumentBody_0");
    div.RaiseChanged.call(div);
}

// 启动功能模块
DCUndoRedo.Start = function (rootElement) {
    this.version = 0;
    // 最大记录个数
    this.MaxRecordNumber = 100;
    // 创建第一条记录
    if (rootElement == null) {
        rootElement = document.getElementById("divDocumentBody_0");
    }
    if (rootElement == null) {
        return;
    }
    rootElement.UndoList = this;
    rootElement.UndoRedoVersion = this.version;
    // 设置撤销操作按钮
    if (document.WriterControl != null) {
        var pctl = document.WriterControl;
        if (pctl.ButtonForUndo != null) {
            if (typeof (pctl.ButtonForUndo) == "string") {
                this.btnUndo = pctl.ownerDocument.getElementById(pctl.ButtonForUndo);
            }
            else if (pctl.ButtonForUndo.nodeName) {
                this.btnUndo = pctl.ButtonForUndo;
            }
        }
        else {
            var id = pctl.getAttribute("buttonforundo");
            if (id != null && id.length > 0) {
                this.btnUndo = pctl.ownerDocument.getElementById(id);
            }
        }
        // 设置撤销操作按钮
        if (pctl.ButtonForRedo != null) {
            if (typeof (pctl.ButtonForRedo) == "string") {
                this.btnRedo = pctl.ownerDocument.getElementById(pctl.ButtonForRedo);
            }
            else if (pctl.ButtonForRedo.nodeName) {
                this.btnRedo = pctl.ButtonForRedo;
            }
        }
        else {
            var id = pctl.getAttribute("buttonforredo");
            if (id != null && id.length > 0) {
                this.btnRedo = pctl.ownerDocument.getElementById(id);
            }
        }
        document.WriterControl.Undo = function () {
            DCUndoRedo.Undo.call(DCUndoRedo);
        };
        document.WriterControl.Redo = function () {
            DCUndoRedo.Redo.call(DCUndoRedo);
        };
    }
    this.rootElement = rootElement;
    this.currentIndex = -1;
    this.innerFixInfo();
    //var firstRecord = new Object();
    this.lastFullCopy = rootElement.cloneNode(true);
    this.LastLogTick = 0;
    //// 产生第一条记录
    //var firstRecord = new Array();
    //firstRecord.parentNode = this.lastFullCopy;
    //for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
    //    firstRecord.push(rootElement.childNodes[iCount]);
    //}
    //firstRecord.selection = DCSelectionManager.getSelection();
    //this.push(firstRecord);

    //this.currentIndex = 0;
    rootElement.RaiseChanged = function (eventObj) {
        var undoList = this.UndoList;
        undoList.version++;
        rootElement.UndoRedoVersion = DCUndoRedo.version;

        eventObj = DCDomTools.FixEventObject(eventObj);
        if (eventObj != null
            && (eventObj.inputType == "historyUndo" || eventObj.inputType == "historyRedo")) {
            // 不执行CHORME里面的标准的重做撤销功能。
            DCDomTools.completeEvent(eventObj);
            return;
        }

        var lastTickSpan = new Date().valueOf - undoList.LastLogTick;
        if (lastTickSpan < 100) {
            // 距离上一次记录时间太短了，不执行。
            return;
        }
        
        if (document.WriterControl != null) {
            document.WriterControl.SetStatusText("等待记录UNDO。");
        }
         
        //DCUndoRedo.UpdateButtonState();
        // 内容修改后0.5秒后记录
        if (undoList.handle != null) {
            window.clearTimeout(undoList.handle);
            undoList.handle = null;
        }
        undoList.handle = window.setTimeout(undoList.LogUndo, 500);
    };
    var $r = $(rootElement);
    $r.on("change", function ( eventObj ) {
        this.RaiseChanged(eventObj);
    });
    $r.on("input", function (eventObj) {
        this.RaiseChanged(eventObj);
    });
    $r.on("paste", function (eventObj) {
        this.RaiseChanged(eventObj);
    });
    $r.on("cut", function (eventObj) {
        this.RaiseChanged(eventObj);
    });
    $r.on("keydown", function (eventObj) {
        // 处理键盘事件快捷键
        eventObj = DCDomTools.FixEventObject(eventObj);
        var undolist = this.UndoList;
        //console.log("keyCode:" + eventObj.keyCode);
        var srcElement = eventObj.srcElement || eventObj.target;
        if (srcElement != null && (srcElement.nodeName == "INPUT" || srcElement.nodeName == "TEXTAREA")) {
            // 标准文本输入框，则不进行后续处理。
            return;
        }
        if (eventObj.ctrlKey == true) {
            if (eventObj.keyCode == 26 // chrome里面就是ctrl+Z
                || eventObj.keyCode == 90 // 大写Z
                || eventObj.keyCode == 122// 小写z
                || eventObj.charCode == 26
                || eventObj.charCode == 90
                || eventObj.charCode == 122) {
                if (undolist.CanUndo()) {
                    undolist.Undo.call(undolist);
                }
                DCDomTools.completeEvent(eventObj);
                return;
            }
            if (eventObj.keyCode == 25 // chrome里面就是ctrl+Y
                || eventObj.keyCode == 89 // 大写Y
                || eventObj.keyCode == 121// 小写y
                || eventObj.charCode == 25
                || eventObj.charCode == 89
                || eventObj.charCode == 121) {
                if (undolist.CanRedo()) {
                    undolist.Redo.call(undolist);
                }
                DCDomTools.completeEvent(eventObj);
                return;
            }
        }
        this.RaiseChanged(eventObj);
    });

    // 更新按钮状态
    this.UpdateButtonState();

    // 进行第一次的记录
    //this.LogUndo();
};

//清空对象数据
DCUndoRedo.Clear = function () {
    this.currentIndex = -1;
    if (this.handle != null) {
        window.clearTimeout(this.handle);
        this.handle = null;
    }
    this.lastFullCopy = this.rootElement.cloneNode(true);
    this.lastFullCopy.UndoRedoVersion = this.rootElement.UndoRedoVersion;
    if (this.length > 0) {
        for (var iCount = this.length - 1; iCount >= 0; iCount--) {
            this.shift();
        }
    }
    this.UpdateButtonState();
};

DCUndoRedo.UpdateButtonState = function () {
    if (this.btnUndo != null) {
        this.btnUndo.disabled = this.CanUndo() == false;
    }
    if (this.btnRedo != null) {
        this.btnRedo.disabled = this.CanRedo() == false;
    }
};

DCUndoRedo.CanUndo = function () {
    if (this.Enabled == false) {
        return false;
    }
    if (this.length > 0 && this.currentIndex >= 0) {
        return true;
    }
    return false;
};

DCUndoRedo.CanRedo = function () {
    if (this.Enabled == false) {
        return false;
    }
    if (this.length > 0 && this.currentIndex < this.length ) {
        return true;
    }
    return false;
};
 
// 撤销操作
DCUndoRedo.Undo = function () {
    if (this.Enabled == false) {
        return false;
    }
    if (this.currentIndex >= this.length - 1) {
        if (this.lastFullCopy == null
            || this.lastFullCopy.UndoRedoVersion != this.rootElement.UndoRedoVersion) {
            this.innerLogUndo.call(DCUndoRedo);
        }
        this.currentIndex = this.length - 1;
    }
    if (this.length > 0) {

        var tick2 = new Date().valueOf();
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        }
        
        var info = this[this.currentIndex];
        //注销下面代码 解决DCWRITER-2502 2019-11-18 hulijun
        this.currentIndex--;
        info.SetContent();
        this.lastFullCopy = null;
        this.lastFullCopy = this.rootElement.cloneNode(true);
        this.lastFullCopy.UndoRedoVersion = this.rootElement.UndoRedoVersion;
        //info.selection.Select();
        this.UpdateButtonState();
        tick2 = new Date().valueOf() - tick2;
        if (document.WriterControl != null) {
            document.WriterControl.SetStatusText("撤销操作耗时" + tick2 + "毫秒。");
        }
    }
};

// 重复操作
DCUndoRedo.Redo = function () {
    if (this.Enabled == false) {
        return false;
    } 
    this.currentIndex++;
    var tick2 = new Date().valueOf();
    if (this.currentIndex >= this.length - 1) {
        this.currentIndex = this.length + 1;
        this.RedoForLast();
    }
    else if (this.length > 0 && this.currentIndex >= -1 && this.currentIndex < this.length) {      
        this.currentIndex++;
        var info = this[this.currentIndex];
        info.SetContent();
        this.lastFullCopy = null;
        this.lastFullCopy = this.rootElement.cloneNode(true);
        this.lastFullCopy.UndoRedoVersion = this.rootElement.UndoRedoVersion;
        //info.selection.Select();
    }
    this.UpdateButtonState();
    tick2 = new Date().valueOf() - tick2;
    if (document.WriterControl != null) {
        document.WriterControl.SetStatusText("重做操作耗时" + tick2 + "毫秒。");
    }
    this.currentIndex--;
};
 

// 从两个根节点出发，查找内容不同的节点
DCUndoRedo.innerFindDifferendNode = function (root1, root2) {
    if (root1 == null || root2 == null) {
        return null;
    }
    var len1 = root1.childNodes.length;
    var len2 = root2.childNodes.length;
    var childNodes1 = root1.childNodes;
    var childNodes2 = root2.childNodes;
    var changed = false;
    if (len1 != len2) {
        changed = true;
    }
    else {
        for (var iCount = 0; iCount < len1; iCount++) {
            var oldNode = childNodes1[iCount];
            var newNode = childNodes2[iCount];
            if (oldNode.nodeName != newNode.nodeName) {
                // 节点名称都不一样，则立即退出循环
                changed = true;
                break;
            }
            if (oldNode.nodeType == 3) {
                // 遇到纯文本节点
                if (oldNode.nodeValue != newNode.nodeValue) {
                    changed = true;
                    break;
                }
                // 纯文本节点无需后续判断
                continue;
            }
            if (oldNode.getAttribute) {
                // 比较属性值
                //if (oldNode.nodeName == "SPAN"
                //    && oldNode.getAttribute("dctype") == "XTextInputFieldElement"
                //    && newNode.getAttribute("dctype") == "XTextInputFieldElement") {
                //    // 特别处理输入域元素
                    
                //}
                var attrLen1 = oldNode.attributes.length;
                var attrLen2 = newNode.attributes.length;
                if (attrLen1 != attrLen2) {
                    changed = true;
                    break;
                }
                else if (attrLen1 > 0) {
                    var attributes1 = oldNode.attributes;
                    var attributes2 = newNode.attributes;
                    for (var attrCount = 0; attrCount < attrLen1; attrCount++) {
                        var a1 = attributes1[attrCount];
                        var a2 = attributes2[attrCount];
                        if (a1.name != a2.name) {
                            // 属性名不一样
                            changed = true;
                            break;
                        }
                        if (a1.value != a2.value) {
                            // 属性值不一样
                            if (a1.name == "class"
                                || a1.name == "localclass"
                                || a1.name == "contenteditable"
                                || a1.name == "dc_contentreadonly") {
                                // 对于CLASS属性不予处理。
                                continue;
                            }
                            changed = true;
                            break;
                        }
                    }//for
                    if (changed == true) {
                        break;
                    }
                }
            }//if
        }//for
    }//else
    if (changed == false) {
        // 直属子节点没有差别，则递归查找孙节点
        var changedNode = null;
        for (var iCount = 0; iCount < len1; iCount++) {
            var node = DCUndoRedo.innerFindDifferendNode(
                childNodes1[iCount],
                childNodes2[iCount]);
            if (node != null) {
                if (changedNode != null) {
                    // 有多个子节点深层次的有差异，则立刻返回，无需后续处理。
                    node.___mapNode = null;
                    root1.setAttribute("contenteditable", root2.getAttribute("contenteditable"));
                    root1.setAttribute("dc_contentreadonly", root2.getAttribute("dc_contentreadonly"));
                    root2.___mapNode = root1;
                    return root2;
                }
                changedNode = node;
            }
        }
        return changedNode;
    }
    else {
        // 直属子节点有差异
        //WYC20190903：不处理contenteditable与dc_contentreadonly
        root1.setAttribute("contenteditable", root2.getAttribute("contenteditable"));
        root1.setAttribute("dc_contentreadonly", root2.getAttribute("dc_contentreadonly"));
        root2.___mapNode = root1;
        return root2;
    }
};

DCUndoRedo.RebindEvent = function (rootNode) {
    $("input,select,textarea,span,button", rootNode).each(function () {
        DCWriterControllerEditor.BindInputFieldEvent(this);
    });
    $("label", rootNode).each(function () {
        DCInputFieldManager.BindBackgroundLabelEvent(this);
    });
};
// 创建一个UNDO信息对象
DCUndoRedo.LogUndo = function () {
    if (DCUndoRedo.handle != null) {
        window.clearTimeout(DCUndoRedo.handle);
        DCUndoRedo.handle = null;
    }
    DCUndoRedo.innerLogUndo.call(DCUndoRedo);
}
DCUndoRedo.innerLogUndo = function () {
    if (this.Enabled == false) {
        return null ;
    }
    //WYC20191119：排除输入法
    if (DCWriterControllerEditor.OnIMEMode === true) {
        return null;
    }
    //alert("开始记录UNDO。");
    var dtmStart = new Date();
    var changedNode = this.innerFindDifferendNode(this.lastFullCopy, this.rootElement, true);
    var domTick = new Date().valueOf() - dtmStart.valueOf();
    if (changedNode != null) {
        this.innerFixInfo();
        //var txt1 = this.lastFullCopy.innerHTML;
        //var txt2 = this.rootElement.innerHTML;
        //changedNode = this.innerFindDifferendNode(this.lastFullCopy, this.rootElement, true);
        // 发现子孙元素有差异，则产生撤销操作记录
        var result = new Array();
        if (changedNode == this.rootElement) {
            result.indexs = null;
            //for (var iCount = 0; iCount < newRoot.childNodes.length; iCount++) {
            //    result.push(newRoot.childNodes[iCount].cloneNode(true));
            //}
        }
        else {
            // 记下各级节点序号。
            result.indexs = new Array();
            var curNode = changedNode;
            while (true) {
                var p = curNode.parentNode;
                var len = p.childNodes.length;
                for (var iCount = p.childNodes.length - 1; iCount >= 0; iCount--) {
                    if (p.childNodes[iCount] == curNode) {
                        result.indexs.push(iCount);
                        break;
                    }
                }
                if (p == null || p == this.rootElement) {
                    break;
                }
                curNode = curNode.parentNode;
            }//while
        }
        var oldChangedNode = changedNode.___mapNode;
        changedNode.___mapNode = null;
        for (var iCount = 0; iCount < oldChangedNode.childNodes.length; iCount++) {
            var n1 = oldChangedNode.childNodes[iCount];
            var n2 = n1.cloneNode(true);
            //n2.___CloneSource = n1;
            //for (var iCount2 = 0; iCount2 < this.length; iCount2++) {
            //    var info2 = this[iCount2];
            //    if (info2.parentNode == n1) {
            //        //info2.parentNode = n2;
            //    }
            //}
            // 20201217 xym 修复一部分IE浏览器下文本输入域输入后撤销异常(BSDCWRIT-14)
            // if (n2.setAttribute) {
            //     n2.setAttribute("contenteditable", "true");
            //     n2.setAttribute("dc_contentreadonly", "False");
            // }
            result.push(n2);
        }
        // 记下最新的节点及子节点列表
        this.newestElements_ParentNode = changedNode;
        this.newestElements = null;
        this.newestElements = new Array();
        for (var iCount = 0; iCount < changedNode.childNodes.length; iCount++) {
            this.newestElements.push(changedNode.childNodes[iCount]);
        }

        this.RedoForLast = function () {
            this.Undoing = true;
            DCDomTools.ReplaceAllNodes(this.newestElements_ParentNode, this.newestElements);
            this.RebindEvent(this.newestElements_ParentNode);
            this.Undoing = false;
            if (SetActiveElement(this.newestElements_ParentNode) == false) {
                DCDomTools.setActive(this.rootElement);
            }
        };

        result.parent = this;
        result.oldRoot = this.lastFullCopy;
        result.newRoot = this.rootElement;

        function SetActiveElement(elements) {
            DCDomTools.FoucsDocument();
            for (var iCount = 0; iCount < elements.length; iCount++) {
                var node = elements[iCount];
                if (node.getAttribute) {
                    DCDomTools.setActive(node);
                    DCDomTools.ScrollIntoView(node);
                    return true;
                }
            }
            return false;
        }
        result.SetContent = function () {
            var handleRoot = this.newRoot;
            if (this.indexs != null) {
                for (var iCount = this.indexs.length - 1; iCount >= 0; iCount--) {
                    // 这个序号是反向存储的。
                    handleRoot = handleRoot.childNodes[this.indexs[iCount]];
                }
            }
            if (handleRoot != null) {
                this.parent.Undoing = true;
                DCDomTools.ReplaceAllNodes(handleRoot, this, true);
                // 重新绑定元素事件
                this.parent.RebindEvent(handleRoot);
                this.parent.Undoing = false;
                if (SetActiveElement(this) == false){
                    DCDomTools.setActive(this.newRoot);
                    DCDomTools.ScrollIntoView(this.newRoot);
                }
            }
        };
        
        result.Undo = function () {
            this.SetContent();
        };
        result.Redo = function () {
            //if (this.parent[this.parent.length - 1] == this) {
            //    // 最后一次的重做操作
            //    if (this.parent.newestElements != null) {
            //        DCUndoRedo.Undoing = true;
            //        DCDomTools.ReplaceAllNodes(
            //            this.parent.newestElements_ParentNode,
            //            this.parent.newestElements,
            //            true);
            //        // 重新绑定元素事件
            //        DCUndoRedo.RebindEvent(this.parent.newestElements_ParentNode);
            //        DCUndoRedo.Undoing = false;
            //    }
            //}
            //else
            {
                for (var iCount = this.parent.length - 2; iCount >= 0; iCount--) {
                    if (this.parent[iCount] == this) {
                        var nextItem = this.parent[iCount + 1];
                        nextItem.SetContent();
                        break;
                    }//if
                }//for
            }
        };
        //result.selection = DCSelectionManager.getSelection();
        this.innerFixInfo();
        this.push(result);
        if (this.length > this.MaxRecordNumber) {
            // 超过最大记录个数了，则删除第一个记录。
            this.shift();
        }
        this.currentIndex++;
        var tick = new Date().valueOf() - dtmStart.valueOf();
        result.tickSpan = tick;
        if (document.WriterControl != null) {
            document.WriterControl.SetStatusText("记录了第" + this.length + "次撤销信息，耗时"
                + tick + "毫秒。搜索DOM耗时" + domTick);
        }
        this.LastLogTick = new Date().valueOf();

        if (result != null) {
            // 产生的新的记录。
            this.innerFixInfo();
            this.lastFullCopy = null;
            this.lastFullCopy = this.rootElement.cloneNode(true);
            this.lastFullCopy.UndoRedoVersion = this.rootElement.UndoRedoVersion;
            this.UpdateButtonState();
        }
        if (tick > 300) {
            // 记录UNDO操作太耗时了，不执行了。
            this.Enabled = false;
            document.WriterControl.SetStatusText("系统提示：Undo操作太耗时了，暂不执行。");
        }
        return result;
    }

    return null;
};

