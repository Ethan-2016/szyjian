// 表格处理模块
// 袁永福到此一游 2015-7-27
var WriterCommandModuleTable = new Object();

WriterCommandModuleTable.AlignBottomCenter = function () {
    return this.alignCellContent("center", "bottom");
};
WriterCommandModuleTable.AlignBottomLeft = function () {
    return this.alignCellContent("left", "bottom");
};
WriterCommandModuleTable.AlignBottomRight = function () {
    return this.alignCellContent("right", "bottom");
};
WriterCommandModuleTable.AlignMiddleCenter = function () {
    return this.alignCellContent("center", "middle");
};
WriterCommandModuleTable.AlignMiddleLeft = function () {
    return this.alignCellContent("left", "middle");
};
WriterCommandModuleTable.AlignMiddleRight = function () {
    return this.alignCellContent("right", "middle");
};
WriterCommandModuleTable.AlignTopCenter = function () {
    return this.alignCellContent("center", "top");
};
WriterCommandModuleTable.AlignTopLeft = function () {
    return this.alignCellContent("left", "top");
};
WriterCommandModuleTable.AlignTopRight = function () {
    return this.alignCellContent("right", "top");
};

// 获得当前表格
WriterCommandModuleTable.getCurrentTable = function () {
    var result = DCSelectionManager.getCurrentElementSpecifyNodeName("TABLE");
    if (DCMultiDocumentManager.isInDocument(result) == false) {
        return null;
    }
    return result;
};


/*
where 修改什么 tableID,或者[tableID,row数,cell数]
option 对象 包括bordersetting,color
*/
WriterCommandModuleTable.setTableBorderVisible = function (where, option) {
    if (typeof (where) == "string") {
        var arr = [];
        arr.push(where);
    } else {
        var arr = where;
    }
    var tableId = arr[0]; //表格id
    if (!tableId) {
        return false;
    }
    var tr_index = arr[1]; //行数
    var td_index = arr[2]; //列数
    // 表格
    if (tableId != null && document != null) {//id不为空
        var table = document.getElementById(tableId).getElementsByTagName("tbody")[0];
    } else {
        return false;
    }
    switch (arr.length) {
        case 1:
            {
                for (var i = 0; i < table.children.length; i++) {
                    // 行
                    var tr = table.children[i];
                    setTd(tr);
                }
                break;
            }
        case 2:
            {
                var row = table.rows[Number(tr_index) - 1];
                setTd(row);
                break;
            }
        case 3:
            {
                var row = table.rows[Number(tr_index) - 1];
                var cell = row.cells[Number(td_index) - 1];
                cell.setAttribute("dcbordersetting", option["bordersetting"]);
                cell.style.borderColor = option["color"];
                break;
            }
        default:
    }
    return true;
    function setTd(tr) {
        for (var j = 0; j < tr.children.length; j++) {
            // 单元格
            var td = tr.children[j];
            td.setAttribute("dcbordersetting", option["bordersetting"]);
            td.style.borderColor = option["color"];
        }
    }
}

WriterCommandModuleTable.GetCellInfo = function (cellElement) {
    var result = new Object();
    result.RowIndex = 0;
    result.ColIndex = 0;
    result.RowSpan = 0;
    result.ColSpan = 0;
    if( cellElement == null || cellElement.nodeName != "TD")
    {
        return result;
    }
    result.RowSpan = cellElement.rowSpan;
    result.ColSpan = cellElement.colSpan;
    var row = cellElement.parentNode;
    result.RowIndex = row.rowIndex;
    result.ColIndex = cellElement.cellIndex;
    result.OwnerRow = cellElement.parentNode;
    result.OwnerCol = null;
    result.OwnerTable = null;
    var element = cellElement;
    while (element != null)
    {
        if( element.nodeName == "TABLE")
        {
            result.OwnerTable = element;
            break;
        }
        element = element.parentNode;
    }
    return result;
};

// 获得表格中指定的行对象
WriterCommandModuleTable.GetRowElement = function (element, rowIndex) {
    var rows = WriterCommandModuleTable.GetRowElements(element);
    if (rows != null && rowIndex >= 0 && rowIndex < rows.length) {
        return rows[rowIndex];
    }
    return null;
};

// 获得表格中所有的表格行对象数组
WriterCommandModuleTable.GetRowElements = function (tableElement) {
    var getColDeeply = function (rootElement, list) {
        for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
            var node = rootElement.childNodes[iCount];
            if (node.nodeName == "TR") {
                list.push(node);
            }
            else if (node.nodeName == "TBODY") {
                getColDeeply(node, list);
            }
        }
    };
    while (tableElement != null) {
        if (tableElement.nodeName == "TABLE") {
            var list = new Array();
            getColDeeply(tableElement, list);
            return list;
            break;
        }
        tableElement = tableElement.parentNode;
    }
    return null;
};

// 获得表格中所有的表格列对象数组
WriterCommandModuleTable.GetColumnElements = function (tableElement) {
    var getColDeeply = function (rootElement , list ) {
        for (var iCount = 0 ; iCount < rootElement.childNodes.length ; iCount++) {
            var node = rootElement.childNodes[iCount];
            if (node.nodeName == "COL") {
                list.push(node);
            }
            else if (node.nodeName == "COLGROUP" || node.nodeName == "TBODY") {
                getColDeeply(node, list);
            }
        }
    };
    while (tableElement != null) {
        if (tableElement.nodeName == "TABLE") {
            var list = new Array();
            getColDeeply(tableElement, list);
            return list;
            break;
        }
        tableElement = tableElement.parentNode;
    }
    return null;
};

WriterCommandModuleTable.GetColElement = function (element, colIndex) {
    var cols = WriterCommandModuleTable.GetColumnElements(element);
    if (cols != null && colIndex >= 0 && colIndex < cols.length)
    {
        return cols[colIndex];
    }
    else
    {
        return null;
    }
};

//@method 获得事件相关的单元格对象
WriterCommandModuleTable.GetTargetTableCell = function (eventObj) {
    if (eventObj == null) {
        eventObj = window.event;
    }
    var targetElement = null;
    if (eventObj.targetElement)
    {
        targetElement = eventObj.targetElement;
    }
    else if (eventObj.toElement)
    {
        targetElement = eventObj.toElement;
    }
    else if (eventObj.target)
    {
        targetElement = eventObj.target;
    }
    while( targetElement != null )
    {
        if( targetElement.nodeName == "TD")
        {
            return targetElement;
        }
        targetElement = targetElement.parentNode;
    }
    return null;
};

//@method 判断指定点靠近边框的那个边。
WriterCommandModuleTable.GetBorderIndex = function (rect, x, y) {
    var maxDis = 3;
    
    if (y >= rect.Top && y <= rect.Bottom) {
        if (Math.abs(x - rect.Left) < maxDis) {
            return 1;
        }
        if (Math.abs(x - rect.Right) < maxDis) {
            return 3;
        }
    }
    if (x >= rect.Left && x <= rect.Right) {
        if (Math.abs(y - rect.Top) < maxDis) {
            return 2;
        }
        if (Math.abs(y - rect.Bottom) < maxDis) {
            return 4;
        }
    }
    return -1;
};

//@method 处理鼠标按键按下事件
//@returns true/false 事件是否被处理了，无需后续处理。
WriterCommandModuleTable.HandleMouseDown = function (eventObj) {
};
//@method 处理鼠标移动事件
//@returns true:事件被处理了，无需后续处理。 false:事件没有处理，需要后续处理。
WriterCommandModuleTable.HandleMouseEvent = function (eventObj, eventType) {
    if (eventObj == null) {
        eventObj = window.event;
    }
    var divCapture = WriterCommandModuleTable.GetDragLine(false);
    if (divCapture != null && divCapture.style.display != "none" && divCapture.TableCell != null) {
        // 处于鼠标拖拽操作中
        if (eventType == 0) {
            // 鼠标移动事件
            divCapture.HandleMouseMove(eventObj);
        }
        else if (eventType == 2) {
            // 鼠标按键松开事件
            divCapture.HandleMouseUp(eventObj);
        }
        // 完成事件，事件不再后续分发,也不执行默认行为。
        DCDomTools.completeEvent(eventObj);
        return true;
    }

    var targetCell = WriterCommandModuleTable.GetTargetTableCell(eventObj);
    if (targetCell != null) {
        // 判断单元格是否在可编辑区域
        var isEditable = false;
        var parentNode = targetCell;
        while (parentNode != null)
        {
            if (parentNode.contentEditable == "true")
            {
                // 内容可编辑
                isEditable = true;
                break;
            }
            else if (parentNode.contentEditable == "false")
            {
                // 内容不可编辑
                break;
            }
            parentNode = parentNode.parentNode;
        }//while
        if (isEditable == false)
        {
            // 内容不可编辑
            return false;
        }
        var rect = DCDomTools.GetAbsBoundsInDocument(targetCell);
        var x = eventObj.pageX;
        var y = eventObj.pageY;


        var index = WriterCommandModuleTable.GetBorderIndex(rect, x, y);
        var info = WriterCommandModuleTable.GetCellInfo(targetCell);
        if (index == 1) {
            var targetCol = WriterCommandModuleTable.GetColElement(targetCell, info.ColIndex - 1);
            if (targetCol == null || targetCol.getAttribute("userresize") == "false") {
                index = -1;
            }
        }
        else if (index == 2) {
            var targetRow = WriterCommandModuleTable.GetRowElement(targetCell, info.RowIndex - 1);
            if (targetRow == null || targetRow.getAttribute("userresize") == "false") {
                index = -1;
            }
        }
        else if (index == 3) {
            var targetCol = WriterCommandModuleTable.GetColElement(targetCell, info.ColIndex + info.ColSpan - 1);
            if (targetCol == null || targetCol.getAttribute("userresize") == "false") {
                index = -1;
            }
        }
        else if (index == 4) {
            var targetRow = WriterCommandModuleTable.GetRowElement(targetCell, info.RowIndex + info.RowSpan - 1);
            if (targetRow == null || targetRow.getAttribute("userresize") == "false") {
                index = -1;
            }
        }
        if (index == 1) {
            if (info.ColIndex == 0) {
                targetCell.style.cursor = "";
                return false;
            }
        }
        if (index == 2) {
            if (info.RowIndex == 0) {
                targetCell.style.cursor = "";
                return false;
            }
        }
        if (eventType == 0) {//mousemove
            // 鼠标移动事件
            if (index == 1 || index == 3) {
                targetCell.style.cursor = "w-resize";
            }
            else if (index == 2 || index == 4) {
                targetCell.style.cursor = "n-resize";
            }
            else {
                targetCell.style.cursor = "";
            }
        }
        else if (eventType == 1)//mousedown
        {
            // 鼠标按键按下事件
            if (index == 1 || index == 2 || index == 3 || index == 4) {
                var div = WriterCommandModuleTable.GetDragLine(true);
                div.StartDrag(targetCell, index, eventObj);
                // 完成事件，事件不再后续分发,也不执行默认行为。
                DCDomTools.completeEvent(eventObj);
                return true;
            }
        }
        else if (eventType == 2)//mouseup
        {
            // 鼠标按键松开事件
        }
    }
    return false;
};

WriterCommandModuleTable.GetDragLine = function (autoCreate) {
    if (WriterCommandModuleTable.DrawLineElement == null) {
        if (autoCreate == false) {
            return null;
        }
        var div = document.createElement("div");
        div.id = "tableDragLine";
        div.style.display = "none";
        div.style.backgroundColor = "blue";
        div.style.position = "absolute";
        div.setAttribute("dcignore", "1");
        div.style.zIndex = 1000;
        div.StartDrag = function (tableCell, borderIndex, eventObj) {
            this.TableCell = tableCell;
            this.BorderIndex = borderIndex;
            this.CellInfo = WriterCommandModuleTable.GetCellInfo(tableCell);
            var tableRect = DCDomTools.GetAbsBoundsInDocument(this.CellInfo.OwnerTable);
            var cellRect = DCDomTools.GetAbsBoundsInDocument(this.TableCell);
            var lineWidth = 3;
            if (borderIndex == 1) {
                div.style.left = cellRect.Left;
                div.style.top = tableRect.Top;
                div.style.width = lineWidth;
                div.style.height = tableRect.Height;
                div.style.display = "";
                div.style.cursor = "e-resize";
            }
            else if (borderIndex == 2) {
                div.style.left = tableRect.Left;
                div.style.top = cellRect.Top;
                div.style.width = tableRect.Width;
                div.style.height = lineWidth;
                div.style.display = "";
                div.style.cursor = "n-resize";
            }
            else if (borderIndex == 3) {
                div.style.left = cellRect.Right;
                div.style.top = tableRect.Top;
                div.style.width = lineWidth;
                div.style.height = tableRect.Height;
                div.style.display = "";
                div.style.cursor = "e-resize";
            }
            else if (borderIndex == 4) {
                div.style.left = tableRect.Left;
                div.style.top = cellRect.Bottom;
                div.style.width = tableRect.Width;
                div.style.height = lineWidth;
                div.style.display = "";
                div.style.cursor = "n-resize";
            }
            div.StartX = parseInt(div.style.left);
            div.StartY = parseInt(div.style.top);
            div.StartPageX = eventObj.pageX;
            div.StartPageY = eventObj.pageY;
            div.DX = eventObj.pageX - parseInt(div.style.left);
            div.DY = eventObj.pageY - parseInt(div.style.top);
            div.RealDrag = false;
            if (div.TableCell.firstChild != null) {
                // DCDomTools.MoveCaretTo(div.TableCell.firstChild);
                DCDomTools.MoveCaretToIndex(div.TableCell.firstChild, 0);
            }
            else if (div.TableCell.focus) {
                div.TableCell.focus();
            }
        };
        // 鼠标移动事件，进行拖拽操作
        div.HandleMouseMove = function (eventObj) {
            if (this.TableCell != null) {
                if (div.BorderIndex == 1 || div.BorderIndex == 3) {
                    div.style.left = eventObj.pageX - div.DX;
                }
                else if (div.BorderIndex == 2 || div.BorderIndex == 4) {
                    div.style.top = eventObj.pageY - div.DY;
                }
                if (Math.abs(eventObj.pageX - this.StartPageX) > 3
                    || Math.abs(eventObj.pageY - this.StartPageY) > 3) {
                    // 中途发生比较大的变化，则认为不是误操作。
                    DCDomTools.completeEvent(eventObj);
                    this.RealDrag = true;
                }
                return;
            }
        };
        // 鼠标按键松开事件，完成拖拽操作
        div.HandleMouseUp = function (eventObj) {
            this.style.display = "none";
            //if (this.RealDrag == false)
            //{
            //    if( eventObj.pageX - this.StartPageX > 3 
            //        || eventObj.pageY - this.StartPageY > 3 )
            //    {
            //        this.RealDrag = false;
            //    }
            //}
            if (this.RealDrag == true && this.TableCell != null) {
                // 是真实的拖拽操作，不是误操作。拖拽表格列
                DCDomTools.completeEvent(eventObj);
                if (this.BorderIndex == 1 || this.BorderIndex == 3) {
                    // 正在拖拽左边框和右边框
                    // 20210201 xym 修复表格拖拽问题(BSDCWRIT-102)
                    var result = WriterCommandModuleTable.getCellRowIndex(this.TableCell);
                    var colIndex = result.cellIndex;
                    if (this.BorderIndex == 3) {
                        colIndex = colIndex + this.TableCell.colSpan - 1;
                    }
                    else if (this.BorderIndex == 1) {
                        // 拖拽靠左边的表格列
                        colIndex = colIndex - 1;
                    }
                    var colElement = WriterCommandModuleTable.GetColElement(this.TableCell, colIndex);
                    var nextColElement = WriterCommandModuleTable.GetColElement(this.TableCell, colIndex+1);
                    if (colElement != null) {
                        var dx = eventObj.pageX - this.StartPageX;
                        var oldWidth = parseInt(colElement.width);
                        if (this.TableCell.colSpan == 1 && this.BorderIndex == 3) {
                            oldWidth = this.TableCell.offsetWidth;
                        }
                        
                        var newWidth = oldWidth + dx;
                        newWidth = Math.max(newWidth, 20);
                        colElement.width = newWidth;
                        colElement.style.width = newWidth;
                        colElement.removeAttribute("dsw");
                        //解决表格宽度超出编辑器宽度 2020-03-11 hulijun
                        if (nextColElement != null) {
                            var nextOldWidth = parseInt(nextColElement.width);
                            if (this.TableCell.nextElementSibling && this.TableCell.nextElementSibling.colSpan == 1) {

                            }
                            var nextNewWidth = nextOldWidth - dx;
                            nextNewWidth = Math.max(nextNewWidth, 20);
                            nextColElement.width = nextNewWidth;
                            nextColElement.style.width = nextNewWidth;
                            nextColElement.removeAttribute("dsw");
                        }
                        

                        var tableElement = DCDomTools.getParentSpecifyNodeName(this.TableCell, "TABLE");
                        if (tableElement != null) {
                            tableElement.style.width = "";
                            tableElement.removeAttribute("width");
                            tableElement.removeAttribute("colwidths");
                        }
                        DCDomTools.BubbleRaiseChanged(tableElement);
                    }
                } //if
                else if (this.BorderIndex == 2 || this.BorderIndex == 4) {
                    // 正在拖拽上下边框,修改表格行的高度
                    var rowIndex = this.CellInfo.RowIndex;
                    if (this.BorderIndex == 2) {
                        // 拖拽上面的表格线 
                        rowIndex = rowIndex - 1;
                    }
                    else if (this.BorderIndex == 4) {
                        // 拖拽下面的表格线
                        rowIndex = rowIndex + this.CellInfo.RowSpan - 1;
                    }
                    var rowElement = WriterCommandModuleTable.GetRowElement(this.TableCell, rowIndex);
                    if (rowElement != null) {
                        // 设置表格行元素的高度
                        var dy = eventObj.pageY - this.StartPageY;
                        var oldHeight = rowElement.offsetHeight;
                        var newHeight = oldHeight + dy;
                        newHeight = Math.max(newHeight, 15);
                        rowElement.height = newHeight;
                        rowElement.style.height = newHeight + "px";
                        rowElement.setAttribute("dc_specifyheight", newHeight * 3.125);
                        rowElement.removeAttribute("height");
                        var funcCheckHeight = function () {
                            if (Math.abs(newHeight - rowElement.offsetHeight) > 3) {
                                // 高度设置失败，说明高度设置不合理，则删除相关属性。

                                rowElement.removeAttribute("dc_specifyheight");
                                rowElement.style.height = "";
                            }
                            else {
                                DCDomTools.BubbleRaiseChanged();
                            }
                        };
                        window.setTimeout(funcCheckHeight, 10);
                    }
                }
            } //if
            this.TableCell = null;
        };

        div.onmouseup = function (eventObj) {
            this.HandleMouseUp(eventObj);
        };

        div.onselectstart = function () {
            return false;
        };
        document.body.appendChild(div);
        WriterCommandModuleTable.DrawLineElement = div;
    }
    return WriterCommandModuleTable.DrawLineElement;
};

//WYC20190604：创建表格
WriterCommandModuleTable.CreateTable = function (parameter) {
    var rowCount = 3;
    var colCount = 3;
    var tableid = "table" + getRandom(10, 100);
    var tablealign = "Left";

    if (parameter.split) {
        var cuts = parameter.split(",");
        if (cuts.length && cuts.length === 2) {
            rowCount = cuts[0];
            colCount = cuts[1];
        }
    }
    else if (parameter !== null) {
        if (parameter.RowCount) {
            rowCount = parameter.RowCount;
        }
        if (parameter.ColumnCount) {
            colCount = parameter.ColumnCount;
        }
        if (parameter.TableID) {
            tableid = parameter.TableID;
        }
        if (parameter.Alignment) {
            tablealign = parameter.Alignment;
        }
    }

    var sel = DCSelectionManager.getSelection();
	//20208021 XYM 修复ie无法插入表格问题 
    if (DCSelectionManager.LastSelectionInfo != null && (sel.startContainer == null || document.body.contains(sel.startContainer) == false)) {
        sel = DCSelectionManager.LastSelectionInfo;
    }
    var container = sel.currentContainer;
    while (container.nodeName && container.nodeName !== "P") {
        container = container.parentNode;
    }

    //var divAllContainer = DCWriterControllerEditor.getdivAllContainer();
    //var tableWidth = divAllContainer.offsetWidth; //获取容器宽度-3微调一下
    var colWidth = container.offsetWidth / colCount;
    colWidth = parseInt(colWidth).toString();
    var rowHeight = "27px";   //硬编码


    var tableborder = "1px solid black";

    function getRandom(min, max) {
        var r = Math.random() * (max - min);
        var re = Math.round(r + min);
        re = Math.max(Math.min(re, max), min)

        return re;
    }

    var strA = "A";
    var asciiA = strA.charCodeAt(0);

    var table = document.createElement("table");
    table.setAttribute("dctype", "XTextTableElement");
    table.id = tableid;
    if (tablealign.toLowerCase() != "left") {
        table.setAttribute("dc_alignment", tablealign);
        table.setAttribute("align", tablealign.toLowerCase());
    }
    table.cellPadding = 0;
    table.cellSpacing = 0;
    table.style.padding = 0;
    //table.style.width = tableWidth;WYC20190605：不固定表格宽度，否则删除列后列宽保存加载异常
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "fixed";
    //修改表格宽度为最大内容行内尺寸
    //table.style.width="max-content";

    var colgroup = document.createElement("colgroup");
    var strColWidths = colWidth.toString();
    for (var i = 0; i < colCount; i++) {
        var col = document.createElement("col");
        col.style.width = colWidth;
        col.width = colWidth;
        colgroup.appendChild(col);

        if (i != 0) {
            strColWidths = strColWidths + "," + colWidth.toString() + "px";
        }
    }
    table.appendChild(colgroup);

    var tbody = document.createElement("tbody");
    for (var j = 0; j < rowCount; j++) {
        var tr = document.createElement("tr");
        tr.setAttribute("colwidths", strColWidths);
        tr.height = rowHeight;
        tr.setAttribute("height", rowHeight);
        for (var k = 0; k < colCount; k++) {
            var td = document.createElement("td");

            var indexCol = String.fromCharCode(asciiA + k);
            td.setAttribute("cellid", indexCol + (j + 1).toString());
            td.setAttribute("rmfhk", "Tab");
            td.style.border = tableborder;
            td.style.paddingLeft = "4";
            td.style.paddingRight = "4";
            td.style.paddingTop = "3";
            td.style.paddingBottom = "1";
            td.style.verticalAlign = "center";
            td.style.wordWrap = "break-word";
            td.style.wordBreak = "break-all";

            var p = document.createElement("p");
            var br = document.createElement("br");
            br.setAttribute("dcpf", "1");
            p.appendChild(br);
            td.appendChild(p);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    //hulijun BSDCWRIT-34 20201127
    if (document.WriterControl.GlobalFontFamily) {
        $(table).css("font-family", document.WriterControl.GlobalFontFamily).find("*").css("font-family", document.WriterControl.GlobalFontFamily);
    }
    if (document.WriterControl.GlobalFontSize) {
        $(table).css("font-size", document.WriterControl.GlobalFontSize).find("*").css("font-size", document.WriterControl.GlobalFontSize);
    }
    return table;
};

// 插入表格 
//伍贻超 20180515
WriterCommandModuleTable.InsertTable = function (commandName, showUI, parameter) {

    var table = WriterCommandModuleTable.CreateTable(parameter);

    var result = window.uiEditor.execCommand(commandName, table.outerHTML);
    DCDomTools.BubbleRaiseChanged();
    return result;
};

// 设置单元格内容对齐方式
WriterCommandModuleTable.alignCellContent = function (textAlign, vAlign) {
    var cells = new Array();
    var sel = DCDomTools.getSelection();
    var startCell = null;
    var endCell = null;
    var currentTable = WriterCommandModuleTable.getCurrentTable();
    
    if (sel.rangeCount && sel.rangeCount == 1) {
        var sAll = sel.getRangeAt(0);
        
        var listTd = $(sAll.commonAncestorContainer).find("td");
        for (var i = 0; i < listTd.length; i++) {
            if (sAll.isPointInRange(listTd[i], 1)) {
                cells.push(listTd[i]);
            }
        }

    }

    if (sel.rangeCount && sel.rangeCount > 1) {
        for (var iCount = 0; iCount < sel.rangCount; iCount++) {
            var rng = sel.getRangeAt(iCount);
            if (rng.startContainer && rng.startContainer != null) {
                var container = rng.startContainer;
                if (container.nodeName == "TD") {
                    // 选中单元格
                    cells.push(container);
                }
                else if (container.nodeName == "TR") {
                    // 选中表格行
                    for (var i2 = 0; i2 < container.childNodes.length; i2++) {
                        var node2 = container.childNodes[i2];
                        if (node2.nodeName == "TD") {
                            cells.push(node2);
                        }
                    }
                }
                else {
                    var c2 = DCDomTools.getParentSpecifyNodeName(container, "TD");
                    if (c2 != null) {
                        cells.push(c2);
                    }
                }
            } //if
        } //for
    } //if
    else if (currentTable!=null && sel.anchorNode) {
        startCell = DCDomTools.getParentSpecifyNodeName(sel.anchorNode, "TD");
        endCell = DCDomTools.getParentSpecifyNodeName(sel.focusNode, "TD");
    }
    else if (sel.createRange) {
        var rng = sel.createRange();
        if (rng.parentElement) {
            startCell = DCDomTools.getParentSpecifyNodeName(rng.parentElement(), "TD");
            endCell = startCell;
        }
    }
    if (startCell != null) {
        cells.push(startCell);
    }
    if (endCell != null) {
        if (DCDomTools.indexInArray(cells, endCell) < 0) {
            cells.push(endCell);
        }
    }
    if (cells.length == 0) {
        // 没有要处理的单元格，退出
        return 0;
    }
    for (var iCount = 0; iCount < cells.length; iCount++) {
        var cell = cells[iCount];
        if (cell.offsetParent && cell.offsetParent.id == "dctable_AllContent") {
            continue;
        }

        cell.style.verticalAlign = vAlign;
        for (var i = 0; i < cell.childNodes.length; i++) {
            var node = cell.childNodes[i];
            if (node.nodeName == "P") {
                node.style.textAlign = textAlign;
            }
        }
    }
    if (cells.length > 0) {
        DCDomTools.BubbleRaiseChanged(cells[0]);
    }
    return cells.length;
};

////处理表格键盘按下事件
//WriterCommandModuleTable.handleTableElementKeyDownEvent = function (eventObject, tableElement) {
//    this.HandleTableHotKey(eventObject);
//}

// 处理表格快捷键
// 返回：true:响应的快捷键，后续不在处理键盘事件；false:没处理，后续继续处理键盘事件。
WriterCommandModuleTable.HandleTableHotKey = function (eventObject) {
    if (eventObject == null) {
        eventObject = window.event;
    }
    if (eventObject == null) {
        return false;
    }
    var currentCell = this.getCurrentCell();
    if (currentCell == null) {
        return false;
    }
    var tableElement = this.getOwnerTable(currentCell);
    var moveFocusDirection = DCInputFieldManager.getMoveFocusHotKeyDirection(currentCell, eventObject);
    if (moveFocusDirection == 1) {
        // 移动到下一个单元格
        var nextCell = null;
        var cells = this.getAllCells(tableElement);
        for (var iCount = 0; iCount < cells.length; iCount++) {
            if (cells[iCount] == currentCell) {
                if (iCount + 1 < cells.length) {
                    nextCell = cells[iCount + 1];
                }
                break;
            }
        } //for
        if (nextCell == null) {
            // 下一个单元格为空，则新增一个表格行
            if ($(currentCell).parent().attr("dc_allowinsertrowdownusehotkey") != "Disable") {//20200618 xuyiming 根据dc_allowinsertrowdownusehotkey屏蔽tab键新增表格行
                if (DCDomTools.isContentEditable(tableElement) == true) {
                    // 表格在一个可编辑区域中，可以插入新的表格行
                    this.Table_InsertRowDown();
                    DCDomTools.completeEvent(eventObject);
                    return true;
                }
            }
        }
        else {
            // 切换到下一个单元格
            this.focusCell(nextCell);
            DCDomTools.completeEvent(eventObject);
            return true;
        }
    }
    else if (moveFocusDirection == -1) {
        // 移动到上一个单元格
        var preCell = null;
        var cells = this.getAllCells(tableElement);
        for (var iCount = 1; iCount < cells.length; iCount++) {
            if (cells[iCount] == currentCell) {
                preCell = cells[iCount - 1];
                break;
            }
        } //for
        if (preCell != null) {
            this.focusCell(preCell);
            DCDomTools.completeEvent(eventObject);
            return true;
        }
    }
    return false;
};

// 获得元素所在的表格对象
WriterCommandModuleTable.getOwnerTable = function (element) {
    return DCDomTools.getParentSpecifyNodeName(element, "TABLE");
};

// 获得一个表格中所有的单元格对象
WriterCommandModuleTable.getAllCells = function (tableElement) {
    if (tableElement.cells != null) {
        return tableElement.cells;
    }
    else {
        var cells = new Array();
        var rows = new Array();
        var cols = new Array();
        this.getRowsAndCols(tableElement, rows, cols);
        for (var iCount = 0; iCount < rows.length; iCount++) {
            var row = rows[iCount];
            for (var ci = 0; ci < row.childNodes.length; ci++) {
                var cell = row.childNodes[ci];
                if (cell.nodeName == "TD") {
                    cells.push(cell);
                }
            }//for
        }//for
    }
    return cells;
};

// 拆分单元格
WriterCommandModuleTable.Table_SplitCell = function () {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    var currentCell = this.getCurrentCell();
    if (currentCell == null) {
        return;
    }
    if (currentCell.rowSpan == 1 && currentCell.colSpan == 1) {
        // 无需拆分
        return;
    }
    // 获得操作的表格对象
    var table = DCDomTools.getParentSpecifyNodeName(currentCell, "TABLE");
    // 所有表格列对象列表
    var colList = new Array();
    // 所有表格行对象列表
    var rowList = new Array();
    this.getRowsAndCols(table, rowList, colList);
    // 根据单元格的纵向合并来设置表格行的运行时单元格列表
    var runtimeCells = this.getRuntimeCells(rowList);
    var currentRow = currentCell.parentNode;
    var currentRowIndex = DCDomTools.indexInArray(rowList, currentRow);
    for (var rp = 0; rp < currentCell.rowSpan; rp++) {
        var row = rowList[currentRowIndex + rp];
        var startCell = null;
        if (rp == 0) {
            startCell = currentCell;
        }
        else {
            for (var ci = 0; ci < row.childNodes.length; ci++) {
                var cell = row.childNodes[ci];
                if (cell.nodeName == "TD" && cell.runtimeColIndex < currentCell.runtimeColIndex) {
                    startCell = cell;
                    //break;
                }
            }
        }
        for (var cp = 0; cp < currentCell.colSpan; cp++) {
            if (rp == 0 && cp == 0) {
                continue;
            }
            var newCell = this.createEmptyCell(currentCell, true);
            if (startCell == null) {
                row.insertBefore(newCell, row.firstChild);
            }
            else {
                DCDomTools.insertAfter(startCell, newCell);
            }
            startCell = newCell;
        } //for
    } //for
    currentCell.rowSpan = 1;
    currentCell.colSpan = 1;
    DCDomTools.BubbleRaiseChanged();
    return currentCell;
};

WriterCommandModuleTable.SplitCol = function () {
    var currentCell = this.getCurrentCell();
    var currentRow = currentCell.parentNode;
    var currentTable = DCDomTools.getParentSpecifyNodeName(currentCell, "TABLE");

    // 所有表格列对象列表
    var colList = new Array();
    // 所有表格行对象列表
    var rowList = new Array();
    this.getRowsAndCols(currentTable, rowList, colList);

    var currentCellRowIndex = DCDomTools.indexInArray(rowList, currentRow);
    //var currentRowIndex = DCDomTools.indexInArray(rowList, currentRow);
    var currentCellColIndex = DCDomTools.indexInArray(currentRow.cells, currentCell);

    var colNum, rowNum = rowList.length;
    var newCell = this.createEmptyCell(currentCell, true);
    
    //var colspan = 

    var newCellWidth = currentCell.offsetWidth / 2;
    currentCell.offsetWidth = newCellWidth;
    newCell.offsetWidth = newCellWidth;
    //拆分一行
    //if ()
    //currentRow.insertBefore(currentRow.childNodes[currentCellColIndex + 1], newCell);
    $(currentRow.childNodes[currentCellColIndex]).after(newCell);
    //currentTable[currentCellRowIndex][currentCellColIndex].append(newCell);
    
    for (var i = 0; i < rowNum; i++) {
        if (i == currentCellRowIndex){
            continue;
        }
         
        var cells = rowList[i].cells;
        cells[currentCellColIndex].colSpan = "2";
    }
}
// 删除表格
WriterCommandModuleTable.Table_DeleteTable = function () {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    var currentCell = this.getCurrentCell();
    if (currentCell == null) {
        return;
    }
    // 获得操作的表格对象
    var table = DCDomTools.getParentSpecifyNodeName(currentCell, "TABLE");
    // 20191028 xuyiming 表格设置不可删除时不删除表格
    if (table != null && table.getAttribute("dc_deleteable") != "false") {
        var p = table.parentNode;
        p.removeChild(table);
    }
    if(currentCell){
        DCDomTools.MoveCaretToIndex(currentCell.firstChild, 0);
    }
    DCDomTools.BubbleRaiseChanged();
    return table;
};

// 删除表格列
WriterCommandModuleTable.Table_DeleteColumn = function () {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    var currentCell = this.getCurrentCell();
    if (currentCell == null) {
        return;
    }
    // 获得操作的表格对象
    var table = DCDomTools.getParentSpecifyNodeName(currentCell, "TABLE");
    // 所有表格列对象列表
    var colList = new Array();
    // 所有表格行对象列表
    var rowList = new Array();
    this.getRowsAndCols(table, rowList, colList);
    // 根据单元格的纵向合并来设置表格行的运行时单元格列表
    var runtimeCells = this.getRuntimeCells(rowList);
    // 获得目标列序号
    var targetColIndex = currentCell.runtimeColIndex;
    if (targetColIndex >= 0 && targetColIndex < colList.length) {
        // 删除表格列元素
        var col = colList[targetColIndex];
        var p = col.parentNode;
        p.removeChild(col);
    }
    for (var rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
        var row = rowList[rowIndex];
        for (var ci = 0; ci < row.childNodes.length; ci++) {
            var cell = row.childNodes[ci];
            if (cell.nodeName == "TD") {
                if (cell.runtimeColIndex == targetColIndex) {
                    // 直接命中
                    if (cell.colSpan > 1) {
                        cell.colSpan--;
                    }
                    else {
                        row.removeChild(cell);
                    }
                    break;;
                }
                if (cell.runtimeColIndex < targetColIndex && cell.runtimeColIndex + cell.colSpan > targetColIndex) {
                    cell.colSpan--;
                    break;
                }
            } //if
        } //for
    } //for
    DCDomTools.BubbleRaiseChanged(table);
};
    
// 在左侧插入表格列
WriterCommandModuleTable.Table_InsertColumnLeft = function () {
    this.innerInsertColumn(true);
};

// 在右侧插入表格列
WriterCommandModuleTable.Table_InsertColumnRight = function () {
    this.innerInsertColumn(false);
};

// 获得所有的表格行和表格列对象
WriterCommandModuleTable.getRowsAndCols = function (table, rowList, colList) {
    for (var iCount = 0; iCount < table.childNodes.length; iCount++) {
        var node = table.childNodes[iCount];
        if (node.nodeName == "COL") {
            if (colList != null) {
                colList.push(node);
            }
        }
        else if (node.nodeName == "COLGROUP") {
            for (var ci2 = 0; ci2 < node.childNodes.length; ci2++) {
                var col2 = node.childNodes[ci2];
                if (col2.nodeName == "COL") {
                    if (colList != null) {
                        colList.push(col2);
                    }
                }
            }
        }
        else if (node.nodeName == "TR") {
            if (rowList != null) {
                rowList.push(node);
            }
        }
        else if (node.nodeName == "TBODY") {
            for (var ri = 0; ri < node.childNodes.length; ri++) {
                var node2 = node.childNodes[ri];
                if (node2.nodeName == "TR") {
                    if (rowList != null) {
                        rowList.push(node2);
                    }
                }
            } //for
        } //else
    } //for
    //    if (table.rows) {
    //        rowList = table.rows;
    //    }
};

// 获得运行时的单元格二维数组
WriterCommandModuleTable.getRuntimeCells = function (rowList) {
    var nullCell = new Object();
    // 获得总列数
    var maxColCount = 0;
    for (var ri = 0; ri < rowList.length; ri++) {
        var row = rowList[ri];
        var colCount = 0;
        for (var ci = 0; ci < row.childNodes.length; ci++) {
            var cell = row.childNodes[ci];
            if (cell.nodeName == "TD") {
                colCount += cell.colSpan;
            }
        }
        maxColCount = Math.max(maxColCount, colCount);
    }
    // 根据单元格的纵向合并来设置表格行的运行时单元格列表
    var runtimeCells = DCDomTools.create2DArray(rowList.length, maxColCount);
    for (var rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
        var row = rowList[rowIndex];
        var colIndex = 0;
        for (var ci = 0; ci < row.childNodes.length; ci++) {
            var cell = row.childNodes[ci];
            if (cell.nodeName != "TD") {
                continue;
            }
            // 找到第一个内容为空的数组元素水平序号
            for (var iCount = 0; iCount < maxColCount; iCount++) {
                if (runtimeCells[rowIndex][iCount] == null) {
                    colIndex = iCount;
                    break;
                }
            }
            if (cell.rowSpan == 1 && cell.colSpan == 1) {
                // 若没有合并其他单元格则简单的设置数组元素值
                runtimeCells[rowIndex][colIndex] = cell;
                continue;
            }
            for (var x = 0; x < cell.colSpan; x++) {
                for (var y = 0; y < cell.rowSpan; y++) {
                    if (x == 0 && y == 0) {
                        // 设置第一个单元格
                        runtimeCells[rowIndex][colIndex + x] = cell;
                    }
                    else {
                        if (rowIndex + y < rowList.length) {
                            if (runtimeCells[rowIndex + y][colIndex + x] == null) {
                                runtimeCells[rowIndex + y][colIndex + x] = nullCell;
                            }
                        }
                        else {
                            // 向下越界了，退出处理。
                            break;
                        }
                    } //else
                } //for
            } //for
        } //for
    } //for

    // txts用于调试，无实际意义。
    var txts = DCDomTools.create2DArray(rowList.length, maxColCount);
    for (var ri = 0; ri < rowList.length; ri++) {
        var row = rowList[ri];
        var colIndex = 0;
        var lastCell = null;
        for (var ci = 0; ci < maxColCount; ci++) {
            var cell = runtimeCells[ri][ci];
            if (cell != null && cell != nullCell && cell != lastCell) {
                cell.runtimeColIndex = ci;
                txts[ri][ci] = cell.innerText;
            }
            lastCell = cell;
        } //for
    } //for
    return runtimeCells;
};

// 插入表格列
WriterCommandModuleTable.innerInsertColumn = function (insertLeft) {
    DCDropdownControlManager.CloseDropdownControl();
    DCDomTools.FoucsDocument();
    var sel = DCDomTools.getSelection();
    if (sel == null) {
        return null;
    }

    // 获得当前单元格
    var currentCell = this.getCurrentCell();
    if (currentCell == null) {
        return null;
    }
    // 获得操作的表格对象
    var table = DCDomTools.getParentSpecifyNodeName(currentCell, "TABLE");
    // 所有表格列对象列表
    var colList = new Array();
    // 所有表格行对象列表
    var rowList = new Array();
    this.getRowsAndCols(table, rowList, colList);

    //    for (var iCount = 0; iCount < table.childNodes.length; iCount++) {
    //        var node = table.childNodes[iCount];
    //        if (node.nodeName == "COL") {
    //            colList.push(node);
    //        }
    //        else if (node.nodeName == "COLGROUP") {
    //            for (var ci2 = 0; ci2 < node.childNodes.length; ci2++) {
    //                var col2 = node.childNodes[ci2];
    //                if (col2.nodeName == "COL") {
    //                    colList.push(col2);
    //                }
    //            }
    //        }
    //        else if (node.nodeName == "TR") {
    //            rowList.push(node);
    //        }
    //        else if (node.nodeName == "TBODY") {
    //            for (var ri = 0; ri < node.childNodes.length; ri++) {
    //                var node2 = node.childNodes[ri];
    //                if (node2.nodeName == "TR") {
    //                    rowList.push(node2);
    //                }
    //            } //for
    //        } //else
    //    } //for
    //    if (table.rows) {
    //        rowList = table.rows;
    //    }
    //    // 获得总列数
    //    var maxColCount = 0;
    //    for (var ri = 0; ri < rowList.length; ri++) {
    //        var row = rowList[ri];
    //        var colCount = 0;
    //        for (var ci = 0; ci < row.childNodes.length; ci++) {
    //            var cell = row.childNodes[ci];
    //            if (cell.nodeName == "TD") {
    //                colCount += cell.colSpan;
    //            }
    //        }
    //        maxColCount = Math.max(maxColCount, colCount);
    //    }
    // 根据单元格的纵向合并来设置表格行的运行时单元格列表
    var runtimeCells = this.getRuntimeCells(rowList);
    //     DCDomTools.create2DArray(rowList.length, maxColCount);
    //    var nullCell = new Object();
    //    for (var rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
    //        var row = rowList[rowIndex];
    //        var colIndex = 0;
    //        for (var ci = 0; ci < row.childNodes.length; ci++) {
    //            var cell = row.childNodes[ci];
    //            if (cell.nodeName != "TD") {
    //                continue;
    //            }
    //            // 找到第一个内容为空的数组元素水平序号
    //            for (var iCount = 0; iCount < maxColCount; iCount++) {
    //                if (runtimeCells[rowIndex][iCount] == null) {
    //                    colIndex = iCount;
    //                    break;
    //                }
    //            }
    //            if (cell.rowSpan == 1 && cell.colSpan == 1) {
    //                // 若没有合并其他单元格则简单的设置数组元素值
    //                runtimeCells[rowIndex][colIndex] = cell;
    //                continue;
    //            }
    //            for (var x = 0; x < cell.colSpan; x++) {
    //                for (var y = 0; y < cell.rowSpan; y++) {
    //                    if (x == 0 && y == 0) {
    //                        // 设置第一个单元格
    //                        runtimeCells[rowIndex][colIndex + x] = cell;
    //                    }
    //                    else {
    //                        if (rowIndex + y < rowList.length) {
    //                            if (runtimeCells[rowIndex + y][colIndex + x] == null) {
    //                                runtimeCells[rowIndex + y][colIndex + x] = nullCell;
    //                            }
    //                        }
    //                        else {
    //                            // 向下越界了，退出处理。
    //                            break;
    //                        }
    //                    } //else
    //                } //for
    //            } //for
    //        } //for
    //    } //for

    //    // txts用于调试，无实际意义。
    //    var txts = DCDomTools.create2DArray(rowList.length, maxColCount);
    //    for (var ri = 0; ri < rowList.length; ri++) {
    //        var row = rowList[ri];
    //        var colIndex = 0;
    //        var lastCell = null;
    //        for (var ci = 0; ci < maxColCount; ci++) {
    //            var cell = runtimeCells[ri][ci];
    //            if (cell != null && cell != nullCell && cell != lastCell) {
    //                cell.runtimeColIndex = ci;
    //                txts[ri][ci] = cell.innerText;
    //            }
    //            lastCell = cell;
    //        } //for
    //    } //for

    //    } //function()
    //    refreshRuntimeColIndex();
    // 获得目标列序号
    var targetColIndex = currentCell.runtimeColIndex;
    if (insertLeft == false) {
        // 在右侧插入，则目标序号增1.
        targetColIndex++;
    }
    var currentCol = null;
    var colIndexCount = 0;
    var totalwidth = 0;
    for (var iCount = 0; iCount < colList.length; iCount++) {
        var col = colList[iCount];
        totalwidth = totalwidth + parseInt(col.style.width.replace("px",""));
    }
    for (var iCount = 0; iCount < colList.length; iCount++) {
        var col = colList[iCount];
        // 符良柱 2018-11-1  修改插入列超出边缘问题
        var wid = (totalwidth / ((colList.length) + 1)) + "px";
        col.setAttribute("width", wid);
        col.setAttribute("style", "width:" + wid + "");
        //if (colIndexCount >= targetColIndex) {
        //    currentCol = col;
        //    break;
        //}
        colIndexCount += col.span;
    }
    if (currentCol == null) {
        currentCol = colList[colList.length - 1];
        var newCol = document.createElement("COL");
        newCol.setAttribute("style", currentCol.getAttribute("style"));
        newCol.setAttribute("width", currentCol.getAttribute("width"));
        currentCol.parentNode.appendChild(newCol);
    }
    else {
        var newCol = document.createElement("COL");
        newCol.setAttribute("style", currentCol.getAttribute("style"));
        newCol.setAttribute("width", currentCol.getAttribute("width"));
        currentCol.parentNode.insertBefore(newCol, currentCol);
    }

    var firstNewCell = null;
    for (var ri = 0; ri < rowList.length; ri++) {
        var newCell = null;
        var tempCell = null;
        var row = rowList[ri];
        var hasColSpan = false;
        for (var ci = 0; ci < row.childNodes.length; ci++) {
            var node = row.childNodes[ci];
            if (node.nodeName == "TD") {
                tempCell = node;
                if (node.runtimeColIndex == targetColIndex) {
                    newCell = this.createEmptyCell(node, true);
                    row.insertBefore(newCell, node);
                    break;
                }
                else {
                    if (node.colSpan > 1 && node.runtimeColIndex + node.colSpan > targetColIndex) {
                        // 扩大合并列数
                        node.colSpan++;
                        hasColSpan = true;
                        //refreshRuntimeColIndex();
                        // 跳过被纵向合并的表格行
                        ci = ci + node.rowSpan - 1;
                        break;
                    }
                    if (node.runtimeColIndex >= targetColIndex) {
                        newCell = node.cloneNode(false);
                        row.insertBefore(newCell, node);
                        break;
                    }
                }
            } //if
        } //for
        if (newCell == null && hasColSpan == false) {
            newCell = this.createEmptyCell(tempCell, true);
            row.appendChild(newCell);
        }
        //        if (tempCell != null && hasColSpan == false) {
        //            if (newCell == null) {
        //                newCell = tempCell.cloneNode(false);
        //                row.appendChild(newCell);
        //            }
        //            newCell.rowSpan = 1;
        //            newCell.colSpan = 1;
        //            //newCell.style.backgroundColor = "red";
        //            if (firstNewCell == null) {
        //                firstNewCell = newCell;
        //            }
        //            for (var iCount = 0; iCount < tempCell.childNodes.length; iCount++) {
        //                var node2 = tempCell.childNodes[iCount];
        //                if (node2.nodeName == "P") {
        //                    // 尽量保留第一个段落元素
        //                    var p = node2.cloneNode(false);
        //                    p.appendChild(document.createTextNode("\u00a0"));
        //                    //p.appendChild(document.createTextNode("新单元格"));
        //                    newCell.appendChild(p);
        //                    break;
        //                }
        //            } //for
        //        } //if
    } //for
    if (firstNewCell != null) {
        this.focusCell(firstNewCell);
    }
    DCDomTools.BubbleRaiseChanged(currentCell);
};
// 创建一个空白的表格单元格元素
WriterCommandModuleTable.createEmptyCell = function (baseCell, resetSpan) {
    var newCell = null;
    if (baseCell != null) {
        newCell = baseCell.cloneNode(false);
        if (resetSpan == true) {
            newCell.rowSpan = 1;
            newCell.colSpan = 1;
        }
        for (var iCount = 0; iCount < baseCell.childNodes.length; iCount++) {
            var node2 = baseCell.childNodes[iCount];
            if (node2.nodeName == "P") {
                // 尽量保留第一个段落元素
                var p = node2.cloneNode(false);
                var br = document.createElement("br");
                br.setAttribute("dcpf", "1");
                p.appendChild(br);
                //p.appendChild(document.createTextNode("新单元格"));
                newCell.appendChild(p);
                break;
            }
        } //for
    }
    else {
        newCell = document.createElement("TD");
    }
    return newCell;
};

// 删除表格行
WriterCommandModuleTable.Table_DeleteRow = function () {
    DCDomTools.FoucsDocument();
    DCDropdownControlManager.CloseDropdownControl();
    var sel = DCDomTools.getSelection();
    if (sel == null) {
        return null;
    }
    // xuyiming 20190826 修复表格删除行问题
    var row=this.getCurrentRow();
    if (row == null) {
        return null;
    }
    var startRow = null;
    var endRow = null;
    if (sel.getRangeAt && sel.rangeCount > 1) {
        for (var iCount = 0; iCount < sel.rangeCount; iCount++) {
            var rng = sel.getRangeAt(iCount);
            if (rng.startContainer && rng.startContainer != null) {
                var row = DCDomTools.getParentSpecifyNodeName(rng.startContainer, "TR");
                if (startRow == null) {
                    startRow = row;
                }
                if (row != null) {
                    endRow = row;
                }
            }
            if (rng.endContainer && rng.endContainer != null) {
                var row = DCDomTools.getParentSpecifyNodeName(rng.endContainer, "TR");
                if (startRow == null) {
                    startRow = row;
                }
                if (row != null) {
                    endRow = row;
                }
            }
        } //for
    }
    else if (sel.anchorNode) {
        startRow = DCDomTools.getParentSpecifyNodeName(sel.anchorNode, "TR");
        endRow = DCDomTools.getParentSpecifyNodeName(sel.focusNode, "TR");
    }
    else if (sel.createRange) {
        var rng = sel.createRange();
        //rng.expand("word");
        if (rng.parentElement) {
            startRow = DCDomTools.getParentSpecifyNodeName(rng.parentElement(), "TR");
            endRow = startRow;
        }
    }
    if (startRow == null || endRow == null) {
        return null;
    }
    DCDomTools.BubbleRaiseChanged(startRow);
    var dx = DCDomTools.compareDOMTreePosition(startRow, endRow);
    if (dx > 0) {
        var temp = startRow;
        startRow = endRow;
        endRow = temp;
    }
    var pNode = startRow.parentNode;
    if (pNode.firstChild == startRow && pNode.lastChild == endRow) {
        // 删除整个表格对象
        var table = DCDomTools.getParentSpecifyNodeName(startRow, "TABLE");
        if (table != null) {
            pNode = table.parentNode;
            pNode.removeChild(table);
            return table;
        }
    }
    var startIndex = DCDomTools.GetNodeIndex(startRow);

    while (pNode.childNodes.length > startIndex) {
        var node = pNode.childNodes[startIndex];
        pNode.removeChild(node);
        if (node == endRow) {
            break;
        }
    } //while
    return startRow;
};

// 在上面插入表格行
WriterCommandModuleTable.Table_InsertRowUp = function (parameter) {
    var row = this.getCurrentRow();
    if (parameter && parameter.nodeName && parameter.parentElement
        && parameter.nodeName == "TR" && parameter.parentElement.getAttribute("dctype") === "XTextTableElement") {
        row = parameter;
    }
    return this.innerInsertTableRow(row,true);
};

// 在下面插入表格行
WriterCommandModuleTable.Table_InsertRowDown = function (parameter) {
    var row = this.getCurrentRow();
    if (parameter && parameter.nodeName && parameter.parentElement
        && parameter.nodeName == "TR" && parameter.parentElement.getAttribute("dctype") === "XTextTableElement") {
        row = parameter;
    }
    return this.innerInsertTableRow(row,false);
};

//插入表格行
WriterCommandModuleTable.innerInsertTableRow = function (parameter,insertUp) {
    DCDomTools.FoucsDocument();
    var row = parameter;
    if (row != null && DCMultiDocumentManager.isInDocument(row) == true) {
        var parent = row.parentNode;
        //20200617 xuyiming 新增dc_allowuserinsertrow为false时阻止表格新增行
        if($(row).parents("table:first").attr("dc_allowuserinsertrow") == "false"){
            return false;
        }
        var newRow = this.editorCloneTableRow(row);
        if (insertUp) {
            parent.insertBefore(newRow, row);
        }
        else {
            if (row.nextSibling == null) {
                parent.appendChild(newRow);
            }
            else {
                parent.insertBefore(newRow, row.nextSibling);
            }
        }
        // 20200608 xuyiming 修复tab键新增表格行，输入域功能丢失，如时间选择框丢失
        DCWriterControllerEditor.InitFileContentDom(newRow, true);
        if (newRow.cells != null && newRow.cells.length > 0) {
            var cell = newRow.cells[0];
            this.focusCell(cell);
            if (DCDomTools.IsInVisibleArea(cell) == false) {
                // 不在可视区域，则滚动视图
                if (cell.scrollIntoView) {
                    cell.scrollIntoView();
                }
                else {
                    DCDomTools.ScrollIntoView(cell);
                }
            }
        }
        DCDomTools.BubbleRaiseChanged(row);
        return newRow;
    }
};

// 让表格单元格获得输入焦点
WriterCommandModuleTable.focusCell = function (cellElement) {
    if (cellElement == null || cellElement.nodeName != "TD") {
        return false;
    }
    //修改 DCWRITER-2942 2019-12-04 hulijun
    if (cellElement.childNodes && cellElement.childNodes.length > 0) {
        DCDomTools.MoveCaretToIndex(cellElement.childNodes[0], 0);
    } else {
        DCDomTools.MoveCaretToIndex(cellElement, 0);
    }
    if (DCDomTools.IsInVisibleArea(cellElement) == false) {
        // 不在可视区域，则滚动视图
        if (cellElement.scrollIntoView) {
            cellElement.scrollIntoView();
        }
        else {
            DCDomTools.ScrollIntoView(cellElement);
        }
    }
};

// 复制表格行对象
WriterCommandModuleTable.editorCloneTableRow = function (rowElement) {
    if (rowElement == null || rowElement.nodeName != "TR") {
        return null;
    }
    var idEndFix = Math.random().toString();
    var result = rowElement.cloneNode(true);
    var cloneType = rowElement.getAttribute("dc_clonetype");
    //wyc20201201:使用新的判断逻辑，不仅判断表格行的复制模式还要考虑到单元格本身的模式
    for (var ci = 0; ci < result.childNodes.length; ci++) {
        var cell = result.childNodes[ci];
        var cellcloneType = cell.getAttribute("dc_clonetype");
        var runtimeCloneType = cloneType;
        if (cellcloneType == "Complete" || cellcloneType == "ContentWithClearField") {
            runtimeCloneType = cellcloneType;
        }
        if (runtimeCloneType == "Complete") {
            // 完整的复制
            var fields = DCInputFieldManager.getAllInputFieldsSpecifyRoot(cell, false, false);
            if (fields != null && fields.length > 0) {
                for (var iCount = 0; iCount < fields.length; iCount++) {
                    var field = fields[iCount];
                    field.id = field.id + idEndFix;
                } //for
            }
        } else if (runtimeCloneType == "ContentWithClearField") {
            // 复制表格行，但清空输入域的内容
            var fields = DCInputFieldManager.getAllInputFieldsSpecifyRoot(cell, false, false);
            if (fields != null && fields.length > 0) {
                for (var iCount = 0; iCount < fields.length; iCount++) {
                    var field = fields[iCount];
                    field.id = field.id + idEndFix;
                    DCInputFieldManager.clearFieldContent(field);
                } //for
            }
        } else {
            var p = null;
            for (var iCount = 0; iCount < cell.childNodes.length; iCount++) {
                var node = cell.childNodes[iCount];
                if (node.nodeName == "P") {
                    // 尽量保留第一个段落元素
                    p = node.cloneNode(false);
                    //WYC20190507：空单元格里的段落内用BR来表示空行代替空格
                    var br = document.createElement("br");
                    br.setAttribute("dcpf", "1");
                    p.appendChild(br);
                    break;
                }
            } //for
            DCDomTools.removeAllChilds(cell);
            if (p != null) {
                cell.appendChild(p);
            }
        }
    }
    
    //if (cloneType == "Complete") {
    //    // 完整的复制
    //    var fields = DCInputFieldManager.getAllInputFieldsSpecifyRoot(result, false, false);
    //    if (fields != null && fields.length > 0) {
    //        for (var iCount = 0; iCount < fields.length; iCount++) {
    //            var field = fields[iCount];
    //            field.id = field.id + idEndFix;
    //        } //for
    //    }
    //}
    //else if (cloneType == "ContentWithClearField") {
    //    // 复制表格行，但清空输入域的内容
    //    var fields = DCInputFieldManager.getAllInputFieldsSpecifyRoot(result, false, false);
    //    if (fields != null && fields.length > 0) {
    //        for (var iCount = 0; iCount < fields.length; iCount++) {
    //            var field = fields[iCount];
    //            field.id = field.id + idEndFix;
    //            DCInputFieldManager.clearFieldContent(field);
    //        } //for
    //    }
    //}
    //else {
    //    // 默认清空单元格内容
    //    for (var ci = 0; ci < result.childNodes.length; ci++) {
    //        var cell = result.childNodes[ci];
    //        var p = null;
    //        for (var iCount = 0; iCount < cell.childNodes.length; iCount++) {
    //            var node = cell.childNodes[iCount];
    //            if (node.nodeName == "P") {
    //                // 尽量保留第一个段落元素
    //                p = node.cloneNode(false);
    //                //WYC20190507：空单元格里的段落内用BR来表示空行代替空格
    //                var br = document.createElement("br");
    //                br.setAttribute("dcpf", "1");
    //                p.appendChild(br);
    //                break;
    //            }
    //        } //for
    //        DCDomTools.removeAllChilds(cell);
    //        if (p != null) {
    //            cell.appendChild(p);
    //        }
    //    } //for
    //}
    for (var iCount = 0; iCount < result.childNodes.length; iCount++) {
        var cell = result.childNodes[iCount];
        cell.rowSpan = 1;
    }
    if (result.getAttribute("dc_specifyheight") == null) {
        result.offsetHeight = rowElement.offsetHeight;
        //result.setAttribute("height", rowElement.style.height);
        //for (var iCount = 0; iCount < result.childNodes.length; iCount++) {
        //    var cell = result.childNodes[iCount];
        //    cell.style.height = rowElement.style.height;
        //}
    }
    return result;
};


// 获得当前表格行
WriterCommandModuleTable.getCurrentRow = function () {
    var result = DCSelectionManager.getCurrentElementSpecifyNodeName("TR");
    if (DCMultiDocumentManager.isInDocument(result) == false) {
        return null;
    }
    return result;
};

// 获得当前表格单元格对象
WriterCommandModuleTable.getCurrentCell = function () {
    var result = DCSelectionManager.getCurrentElementSpecifyNodeName("TD");
    if (DCMultiDocumentManager.isInDocument(result) == false) {
        return null;
    }
    return result;
};

//WYC20191029： 设置给定表格单元格对象的边框
WriterCommandModuleTable.setTableCellBorder = function (cellElement, options) {
    if (cellElement.nodeName !== "TD") {
        return;
    }
    cellElement.setAttribute("dctype", "XTextTableCellElement");//临时加个标记
    DCDomTools.SetElementBorder(cellElement, options);
};

//WYC20200512：转换表格边框信息对象到bd2019字符串
//var options = {
//    BorderLeftColor: "black",
//    BorderRightColor: "black",
//    BorderTopColor: "black",
//    BorderBottomColor: "black",
//    BorderLeft: true,
//    BorderTop: true,
//    BorderRight: true,
//    BorderBottom: true,
//    BorderWidth: 1
//};
WriterCommandModuleTable.OptToBd = function (options) {
    if (option == null) {
        return null;
    }
    if (option.BorderLeftColor == option.BorderRightColor
        && option.BorderRightColor == option.borderTopColor
        && option.BorderTopColor == option.BorderBottomColor) {
        colorstring = option.BorderLeftColor;
    } else {
        colorstring = option.BorderLeftColor + "," + option.BorderTopColor + "," + option.BorderRightColor + "," + option.BorderBottomColor;
    }
    var bdresult = colorstring + "|";
    if (options.BorderLeft == true) {
        bdresult = bdresult + "1";
    } else {
        bdresult = bdresult + "0";
    }
    if (options.BorderTop == true) {
        bdresult = bdresult + "1";
    } else {
        bdresult = bdresult + "0";
    }
    if (options.BorderRight == true) {
        bdresult = bdresult + "1";
    } else {
        bdresult = bdresult + "0";
    }
    if (options.BorderBottom) {
        bdresult = bdresult + "1";
    } else {
        bdresult = bdresult + "0";
    }
    bdresult = bdresult + "|" + options.BorderWidth.replace("px", "");
    return bdresult;
};
//WYC20200512:转换表格边框的bd2019信息到JSON对象
WriterCommandModuleTable.BdToOpt = function (bd2019str) {
    if (bd2019str == null || bd2019str.length == undefined || bd2019str.length == 0) {
        console.log("bd2019字符串不对")
        return null;
    }
    var tempstrs = bd2019str.split('|');
    if (tempstrs.length != 3) {
        console.log("bd2019字符串不对")
        return null;
    }
    var colors = tempstrs[0].split(',');
    var borders = tempstrs[1].split("");
    if (borders.length != 4) {
        console.log("bd2019字符串不对")
        return null;
    }

    var options = new Object();
    //分析线宽
    options.BorderWidth = tempstrs[2];

    //分析边框线是否存在
    if (borders[0] == '1') {
        border.BorderLeft = true;
    } else {
        border.BorderLeft = false;
    }
    if (borders[1] == '1') {
        border.BorderTop = true;
    } else {
        border.BorderTop = false;
    }
    if (borders[2] == '1') {
        border.BorderRight = true;
    } else {
        border.BorderRight = false;
    }
    if (borders[3] == '1') {
        border.BorderBottom = true;
    } else {
        border.BorderBottom = false;
    }

    //下面开始分析颜色



    return options;
};

//WYC20191030： 设置给定表格对象的边框
WriterCommandModuleTable.setTableBorder = function (tableElement, options) {
    if (tableElement == null
        || (tableElement.nodeName && tableElement.nodeName != "TABLE")
        || (tableElement.getAttribute && tableElement.getAttribute("dctype") !== "XTextTableElement")) {
        return;
    }
    var cells = WriterCommandModuleTable.getAllCells(tableElement);
    if (cells.length && cells.length > 0) {
        for (var i = 0; i < cells.length; i++) {
            WriterCommandModuleTable.setTableCellBorder(cells[i], options);
        }
    }
};

//WYC20200311：表格行绑定数据
WriterCommandModuleTable.innerSetTableRowData = function (rowElement, stringArray) {
    if ($.isArray(stringArray) == false) {
        console.log("innerSetTableRowData:传入的参数不是数组");
        return;
    }
    var cells = rowElement.childNodes;
    for (var i = 0; i < cells.length; i++) {
        if (i < stringArray.length) {
            var str = null;
            if (stringArray[i] == null) {
                str = "";
            } else {
                str = stringArray[i].toString();
            }
            DCDomTools.SetInnerHTML(cells[i], str);
        } else {
            DCDomTools.SetInnerHTML(cells[i], "");
        }
    }
};

//WYC20200311：清空表格行内容，尽力保留内部样式
WriterCommandModuleTable.innerClearTableRowContent = function (rowElement) {
    if (rowElement.nodeName != "TR"
        /* || rowElement.parentElement.parentElement.getAttribute("dctype") != "XTextTableElement"*/) {
        console.log("innerClearTableRow:表格行参数不正确");
        return;
    }
    for (var i = 0; i < rowElement.childNodes.length; i++) {
        var cell = rowElement.childNodes[i];
        var cellp = null;
        var br = document.createElement("br");
        br.setAttribute("dcpf", "1");
        if (cell.childNodes.length > 0 && cell.childNodes[0].nodeName == "P") {
            cellp = cell.childNodes[0];
            DCDomTools.removeAllChilds(cellp);            
            cellp.appendChild(br);
        } else {
            DCDomTools.removeAllChilds(cell);
            var p = document.createElement("p");
            p.appendChild(br);
            cell.appendChild(p);   
        }
    }
};

//WYC20201211：表格绑定对象数组，要求表格行和单元格设置好绑定信息，根据绑定属性在JSON对象属性中抽取值
WriterCommandModuleTable.WriteDataToTable2 = function (table, dataSourceName, objarray) {
    //去除全部的表格行只对带数据源的行做下处理
    var tablebody = table.querySelector("tbody");
    var tempdatarow = null;
    var needtohandletable = false;
    //第一次遍历检查是否有带数据源绑定的行确定要不要处理该表格
    for (var i = tablebody.childNodes.length - 1; i >= 0; i--) {
        var row = tablebody.childNodes[i];
        var sourcename = row.getAttribute("datasourcename");
        if (sourcename != null && sourcename == dataSourceName) {
            tempdatarow = row.cloneNode(true);
            needtohandletable = true;
            WriterCommandModuleTable.innerClearTableRowContent(tempdatarow);
            break;
        }
    }
    if (needtohandletable == true && tempdatarow != null && Array.isArray(objarray) == true) {
        //将表格行除表头行外全部删除
        for (var i = tablebody.childNodes.length - 1; i >= 0; i--) {
            var row = tablebody.childNodes[i];
            if (row.getAttribute("dc_headerstyle") == "true") {
                continue;
            }
            tablebody.removeChild(row);
        }
        //构造数据行
        for (var i = 0; i < objarray.length; i++) {
            var dataobj = objarray[i];
            var row = tempdatarow.cloneNode(true);
            for (var j = 0; j < row.childNodes.length; j++) {
                var cell = row.childNodes[j];
                var path = cell.getAttribute("datasourcepath");
                path = path != null && path.length > 0 ? path : "";
                var text = path.length > 0 && dataobj != null && dataobj[path] != null && dataobj[path].length > 0 ? dataobj[path].toString() : "";
                DCDomTools.SetInnerHTML(cell, text);
            }
            tablebody.appendChild(row);
        }
    }
};

//WYC20200311：表格绑定字符串数组，字符串数组直接对应表格单元格顺序
WriterCommandModuleTable.WriteDataToTable = function (parameter) {
    if (parameter == null ||
        parameter.TableElement == undefined || parameter.TableElement == null ||
        parameter.DataArray == undefined || parameter.DataArray == null ||
        $.isArray(parameter.DataArray) == false) {
        console.log("WriteDataToTable:参数不正确");
        return false;
    }    
    if (parameter.RowIndex == undefined ||
        parameter.RowIndex == null ||
        parseInt(parameter.RowIndex) < 1) {
        parameter.RowIndex = 1;
    }
    return WriterCommandModuleTable.innerWriteDataToTable(parameter.TableElement, parameter.DataArray, parameter.RowIndex);  
};

WriterCommandModuleTable.WriteDataToTr = function (tr, data) {
    if (!tr || tr.nodeName != "TR") {
        console.log("WriteDataToTr:传入的不是表格行");
        return false;
    }
    if (!data || !($.type(data) == "object" || $.type(data) == "array")) {
        console.log("WriteDataToTr:传入的不是对象或者数组元素");
        return false;
    }
    if ($.type(data) == "object") {
        $(tr).find("td[datasourcepath]").each(function () {
            var dataSourcePath = $(this).attr("datasourcepath");
            DCDomTools.SetInnerHTML(this, data[dataSourcePath] || '');
        })
    } else {
        $(tr).find("td").each(function () {
            DCDomTools.SetInnerHTML(this, data[$(this).index()] || '');
        })
    }
    return true;
}

WriterCommandModuleTable.innerWriteDataToTable = function (tableElement, stringdatas, rowindex) {
    if (tableElement.getAttribute("dctype") != "XTextTableElement") {
        console.log("innerWriteDataToTable:表格参数不对");
        return false;
    }
    if ($.isArray(stringdatas) == false) {
        console.log("innerWriteDataToTable:传入的参数不是数组");
        return false;
    }

    var tablebody = tableElement.querySelector("tbody");
    var tempdatarow = null;
    if (rowindex > tablebody.childNodes.length) {
        rowindex = tablebody.childNodes.length;
    }
    for (var i = tablebody.childNodes.length - 1; i >= rowindex - 1; i--) {
        var row = tablebody.childNodes[i];
        if (row.getAttribute("dc_headerstyle") == "true") {
            continue;
        }
        if (tempdatarow == null) {
            tempdatarow = row.cloneNode(true);
            WriterCommandModuleTable.innerClearTableRowContent(tempdatarow);
        }
        tablebody.removeChild(row);
    }

    for (var j = 0; j < stringdatas.length; j++) {
        var rowdatastring = stringdatas[j];
        var row = tempdatarow.cloneNode(true);
        WriterCommandModuleTable.innerSetTableRowData(row, rowdatastring);
        //WriterCommandModuleTable.innerInsertTableRow(row, false);
        tablebody.appendChild(row);
    }
    return true;
};

//WYC20200312：从表格中提取字符串到字符串数组
WriterCommandModuleTable.ReadDataFromTable = function (parameter) {
    var table = null;
    if (parameter == null) {
        table = WriterCommandModuleTable.getCurrentTable();
    } else if (parameter.getAttribute && parameter.getAttribute("dctype") == "XTextTableElement") {
        table = parameter;
    } else if (parameter.TableElement && parameter.TableElement.getAttribute("dctype") == "XTextTableElement") {
        table = parameter.TableElement;
    }
    if (parameter.RowIndex == undefined ||
        parameter.RowIndex == null ||
        parseInt(parameter.RowIndex) < 1) {
        parameter.RowIndex = 1;
    }
    if (table != null) {
        return WriterCommandModuleTable.innerReadDataFromTable(table, parameter.RowIndex);
    } else {
        return null;
    }
};

//WYC20201214：从表格行中根据绑定信息提取数据到JSON对象数组并返回
WriterCommandModuleTable.ReadDataFromTable2 = function (table, datasourcename) {
    //内部调用就不做参数验证了
    var dataobjs = new Array();
    var tablebody = table.querySelector("tbody");
    for (var i = 0; i < tablebody.childNodes.length; i++) {
        var row = tablebody.childNodes[i];
        var name = row.getAttribute("datasourcename");
        if (name == datasourcename) {
            var obj = new Object();
            for (var j = 0; j < row.childNodes.length; j++) {
                var cell = row.childNodes[j];
                var path = cell.getAttribute("datasourcepath");
                if (path != null && path.length > 0) {
                    obj[path] = cell.innerText;
                }
            }
            dataobjs.push(obj);
        }
    }
    return dataobjs;
};

WriterCommandModuleTable.innerReadDataFromTable = function (tableElement,rowindex) {
    if (tableElement.getAttribute("dctype") != "XTextTableElement") {
        console.log("innerWriteDataToTable:表格参数不对");
        return;
    }
    var dataSetArray = new Array();

    var tablebody = tableElement.querySelector("tbody");
    var tempdatarow = null;
    if (rowindex > tablebody.childNodes.length) {
        rowindex = tablebody.childNodes.length;
    }
    for (var i = rowindex - 1; i < tablebody.childNodes.length; i++) {
        var row = tablebody.childNodes[i];
        if (row.getAttribute("dc_headerstyle") == "true") {
            continue;
        }
        var dataRowArray = new Array();
        for (var j = 0; j < row.childNodes.length; j++) {
            //DCWRITER-3664 hulijun 20210129
            var cell = row.childNodes[j].cloneNode(true);
            var fields = $(cell).find("[dctype='XTextInputFieldElement']");
            if (fields.length > 0) {
                for (var i = 0; i < fields.length; i++) {
                    if (!fields[i].attributes["dc_innervalue"]
                        || !fields[i].attributes["dc_innervalue"].value) {
                        fields[i].remove();
                    }
                }
            }
            dataRowArray.push(cell.innerText);
        }
        dataSetArray.push(dataRowArray);
    }
    if (dataSetArray.length > 0) {
        return dataSetArray;
    } else {
        return null;
    }
};

// 获取单元格在表格中的位置
WriterCommandModuleTable.getCellRowIndex = function (td) {
    if (td == null || td.nodeName != "TD") {
        return null;
    }
    var result = {
        cellIndex: 0,//列
        rowIndex: 0,//行
    };
    var $td = $(td);//单元格
    var $tr = $td.parent("tr:first");//行
    var $table = $td.parent("table:first");//表格
    result.rowIndex = $tr.index();//行的坐标
    var prevAllTd = $td.prevAll("td");
    var prevAllTr = $tr.prevAll("tr");
    prevAllTd.each(function () {
        result.cellIndex += this.colSpan;
    });
    if (prevAllTr.length == 0) {
        // 如果当前为第一行
    } else {
        for (var i = 0; i < prevAllTr.length; i++) {
            var tr = prevAllTr.eq(i);
            var _index = result.cellIndex;
            tr.find("td").each(function () {
                if ($(this).offset().left < $td.offset().left) {
                    if (this.rowSpan > 1) {
                        _index++;
                    }
                }
            })
            if (_index > result.cellIndex) {
                result.cellIndex = _index;
                break;
            }
        }
    }
    return result;
}