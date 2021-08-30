// 文件操作功能模块
// 袁永福 2015-7-12
var WriterCommandModuleFile = new Object();
//最后一次续打位置
WriterCommandModuleFile.LastJumpPrintPosition = null;
//获取元素内XML
WriterCommandModuleFile.getInnerXmlByElement = function (element) {
    if (element && element.childNodes.length > 0) {
        DCInputFieldManager.FixAllInputFieldElementDom();
        WriterCommandModuleFile.fixCheckedAttribute();

        var funcFixForTD = function (tableElement) {
            var row = tableElement.rows[0];
            for (var ci = 0; ci < row.cells.length; ci++) {
                var cell = row.cells[ci];
                var col = document.createElement("col");
                col.setAttribute("width", cell.getAttribute("width"));
                col.style.width = cell.style.width;
                cell.rowSpan = 1;
                cell.colSpan = 1;
                tableElement.appendChild(col);
            }
        };

        var funcFixForTR = function (tableElement) {
            if (tableElement.rows.length == 1) {
                funcFixForTD(tableElement);
                return;
            }
            var maxColNum = 0;
            var strColWidths = tableElement.getAttribute("colwidths");
            for (var ri = 0; ri < tableElement.rows.length; ri++) {
                var row = tableElement.rows[ri];
                var colNum = 0;
                for (var ci = 0; ci < row.cells.length; ci++) {
                    var cell = row.cells[ci];
                    colNum = colNum + cell.colSpan;
                } //for
                maxColNum = Math.max(maxColNum, colNum);
            } //for

            if (maxColNum > 0) {
                var items = strColWidths == null ? null : strColWidths.split(",");
                for (var i = 0; i < maxColNum; i++) {
                    var colElement = document.createElement("col");
                    if (items != null && i < items.length) {
                        var w = parseFloat(items[i]);
                        if (isNaN(w) == false) {
                            colElement.style.width = items[i] + "px";
                        }
                    }
                    tableElement.appendChild(colElement);
                } //for
            } //if
        };

        var srcNodes = element.childNodes;
        var div = document.createElement("div");
        div.setAttribute("dctype", "XTextDocumentBodyElement");
        var currentBody = DCMultiDocumentManager.getOwnerDocumentContentElement(element);
        if (currentBody != null) {
            // 复制文档级属性
            DCDomTools.copyAttributes(currentBody, div);
        }
        var lastTable = null;
        var lastRow = null;
        var lastOL = null;
        var lastNodeName = null;
        for (var iCount = 0; iCount < srcNodes.length; iCount++) {
            var node = srcNodes[iCount];
            if (lastNodeName != node.nodeName) {
                if (lastRow != null) {
                    funcFixForTD(lastTable);
                }
                else if (lastTable != null) {
                    funcFixForTR(lastTable);
                }
                lastTable = null;
                lastRow = null;
                lastOL = null;
                lastNodeName = node.nodeName;
                strColWidths = null;
            }
            if (node.nodeName == "TR") {
                // 遇到游离的表格行
                if (lastTable == null) {
                    lastTable = document.createElement("table");
                    div.appendChild(lastTable.cloneNode(true));
                }
                lastTable.appendChild(node);
            }
            else if (node.nodeName == "TD") {
                // 遇到游离的单元格
                if (lastRow == null) {
                    lastTable = document.createElement("table");
                    div.appendChild(lastTable.cloneNode(true));
                    lastRow = document.createElement("tr");
                    lastTable.appendChild(lastRow);
                }
                lastRow.appendChild(node);
            }
            else if (node.nodeName == "LI") {
                // 遇到游离的LI元素
                if (lastOL == null) {
                    lastOL = document.createElement("ol");
                    div.appendChild(lastOL.cloneNode(true));
                }
                lastOL.appendChild(node);
            }
            else {
                div.appendChild(node.cloneNode(true));
            }
        } //for
        if (lastTable != null) {
            funcFixForTR(lastTable);
        }
        var styleHtml = "";
        var styleElement = document.getElementById("dccustomcontentstyle");
        if (styleElement != null) {
            styleHtml = "<style>" + styleElement.innerHTML + "</style>";
        }

        // 清理HTML DOM
        WriterCommandModuleFile.CleanDOMForSave(div);

        var htmlContent = DCDomTools.GetOuterHTML(div);
        htmlContent = "<html><head>" + styleHtml + "</head><body>" + htmlContent + "</body></html>";

        var url = document.body.getAttribute("servicepageurl");
        url = url + "?dcwritergetxmlcontent=1";
        var result = WriterCommandModuleFile.GetXmlContent(htmlContent);

        return result;
    }


};

// 获得被选中内容的纯文本内容
WriterCommandModuleFile.getSelectionText = function () {
    return WriterCommandModuleFile.getSelectionHtml(true);
};

// 修改[input type='checkbox/radio']元素的checked属性值。
WriterCommandModuleFile.fixCheckedAttribute = function () {
    var items = document.getElementsByTagName("input");
    for (var iCount = 0; iCount < items.length; iCount++) {
        var item = items[iCount];
        if (item.type == "checkbox" || item.type == "radio") {
            if (item.checked == true) {
                item.setAttribute("checked", "true");
            }
            else {
                item.removeAttribute("checked");
            }
        }
        else if (item.type == "text") {
            item.setAttribute("value", item.value);
        }
    }
};

// 获得被选中内容的HTML代码
WriterCommandModuleFile.getSelectionXml = function () {
    var htmlContent = this.getSelectionHtml(false, false);
    var url = document.body.getAttribute("servicepageurl");
    url = url + "?dcwritergetxmlcontent=1";
    var result = WriterCommandModuleFile.GetXmlContent(htmlContent);
    return result;
};


// 获得被选中内容的HTML代码
WriterCommandModuleFile.getSelectionHtml = function (forTextMode, nativeHtml) {
    DCInputFieldManager.FixAllInputFieldElementDom();

    WriterCommandModuleFile.fixCheckedAttribute();
    var funcFixForTD = function (tableElement) {
        var row = tableElement.rows[0];
        for (var ci = 0; ci < row.cells.length; ci++) {
            var cell = row.cells[ci];
            var col = document.createElement("col");
            col.setAttribute("width", cell.getAttribute("width"));
            col.style.width = cell.style.width;
            cell.rowSpan = 1;
            cell.colSpan = 1;
            tableElement.appendChild(col);
        }
    };

    var funcFixForTR = function (tableElement) {
        if (tableElement.rows.length == 1) {
            funcFixForTD(tableElement);
            return;
        }
        var maxColNum = 0;
        var strColWidths = tableElement.getAttribute("colwidths");
        for (var ri = 0; ri < tableElement.rows.length; ri++) {
            var row = tableElement.rows[ri];
            var colNum = 0;
            for (var ci = 0; ci < row.cells.length; ci++) {
                var cell = row.cells[ci];
                colNum = colNum + cell.colSpan;
            } //for
            maxColNum = Math.max(maxColNum, colNum);
        } //for

        if (maxColNum > 0) {
            var items = strColWidths == null ? null : strColWidths.split(",");
            for (var i = 0; i < maxColNum; i++) {
                var colElement = document.createElement("col");
                if (items != null && i < items.length) {
                    var w = parseFloat(items[i]);
                    if (isNaN(w) == false) {
                        colElement.style.width = items[i] + "px";
                    }
                }
                tableElement.appendChild(colElement);
            } //for
        } //if
    };

    var srcNodes = new Array();
    var sel = DCDomTools.getSelection();
    if (sel.getRangeAt && sel.rangeCount > 1) {
        // 处理firefox中选择多个单元格时出现多个选择区域的情况
        // 初始化选中的表格行的dcrowid属性。
        for (var rngIndex = 0; rngIndex < sel.rangeCount; rngIndex++) {
            var rng = sel.getRangeAt(rngIndex);
            if (rng.startContainer != null && rng.startContainer.nodeName == "TR") {
                rng.startContainer.dcrowid = rngIndex.toString();
            }
        } //for
        var currentRow = null;
        for (var rngIndex = 0; rngIndex < sel.rangeCount; rngIndex++) {
            var rng = sel.getRangeAt(rngIndex);
            if (rng.startContainer == null) {
                continue;
            }
            var df = rng.cloneContents();
            if (df == null) {
                continue;
            }
            var srcRow = null;
            var srcRowID = null;
            if (rng.startContainer.nodeName == "TR") {
                srcRow = rng.startContainer;
                srcRowID = srcRow.dcrowid;
            }
            var dfNodes = new Array();
            for (var iCount2 = 0; iCount2 < df.childNodes.length; iCount2++) {
                var node = df.childNodes[iCount2];
                if (srcRowID != null) {
                    node.dcrowid = srcRowID;
                }
                dfNodes.push(node);
            }
            for (var iCount3 = 0; iCount3 < dfNodes.length; iCount3++) {
                var node = dfNodes[iCount3];
                if (node.nodeName == "TD") {
                    if (currentRow == null || currentRow.dcrowid != node.dcrowid) {
                        currentRow = document.createElement("tr");
                        currentRow.dcrowid = node.dcrowid;
                        DCDomTools.copyAttributes(srcRow, currentRow);
                        srcNodes.push(currentRow);
                    }
                    currentRow.appendChild(node);
                }
                else {
                    srcNodes.push(node);
                }
            } //for
        } //for
    } //if
    if (srcNodes.length == 0) {
        var range = DCDomTools.createSelectionRange();
        if (range.cloneContents) {
            var df = range.cloneContents();
            if (df != null) {
                for (var iCount = 0; iCount < df.childNodes.length; iCount++) {
                    var node = df.childNodes[iCount];
                    //wyc20201217：若选中的文本位于一串统一STYLE的字符串内部，则node.style为空会丢失样式，此时取父节点的style
                    if (node.style == undefined && node.nodeName == "#text") {
                        var parentNode = range.startContainer.parentNode.cloneNode(true);
                        while (parentNode.hasChildNodes()) {
                            parentNode.removeChild(parentNode.lastChild);
                        }
                        parentNode.appendChild(node.cloneNode(true));
                        srcNodes.push(parentNode);
                    }
                    //////////////////////////////////
                    else {
                        srcNodes.push(node);
                    }
                }
            }
        }
        else if (range.htmlText) {
            //var r2 = document.body.createTextRange();
            //var r3 = document.body.createControlRange();
            var htmlText = DCStringUtils.trim(range.htmlText);
            var fixForTD = false;
            var fixForTR = false;
            if (DCStringUtils.startsWith(htmlText, "<TD") || DCStringUtils.startsWith(htmlText, "<td")) {
                htmlText = "<table><tr>" + htmlText + "</tr></table>";
                fixForTD = true;
            }
            else if (DCStringUtils.startsWith(htmlText, "<TR") || DCStringUtils.startsWith(htmlText, "<tr")) {
                htmlText = "<table>" + htmlText + "</table>";
                fixForTR = true;
            }
            var divTemp = document.createElement("div");
            divTemp.innerHTML = htmlText;
            for (var iCount = 0; iCount < divTemp.childNodes.length; iCount++) {
                var node = divTemp.childNodes[iCount];
                if (iCount == 0 && fixForTD == true && node.nodeName == "TABLE") {
                    funcFixForTD(node);
                }
                else if (iCount == 0 && fixForTR == true && node.nodeName == "TABLE") {
                    funcFixForTR(node);
                }
                srcNodes.push(node);
            }
        }
    }
    if (srcNodes.length > 0) {
        var div = document.createElement("div");
        div.setAttribute("dctype", "XTextDocumentBodyElement");
        var currentBody = null;
        if (sel != null && sel.focusNode) {
            currentBody = DCMultiDocumentManager.getOwnerDocumentContentElement(sel.focusNode);
        }
        else {
            currentBody = DCMultiDocumentManager.getCurrentDocumentContentElement();
        }
        if (currentBody != null) {
            // 复制文档级属性
            DCDomTools.copyAttributes(currentBody, div);
        }
        var lastTable = null;
        var lastRow = null;
        var lastOL = null;
        var lastNodeName = null;
        for (var iCount = 0; iCount < srcNodes.length; iCount++) {
            var node = srcNodes[iCount];
            if (lastNodeName != node.nodeName) {
                if (lastRow != null) {
                    funcFixForTD(lastTable);
                }
                else if (lastTable != null) {
                    funcFixForTR(lastTable);
                }
                lastTable = null;
                lastRow = null;
                lastOL = null;
                lastNodeName = node.nodeName;
                strColWidths = null;
            }
            if (node.nodeName == "TR") {
                // 遇到游离的表格行
                if (lastTable == null) {
                    lastTable = document.createElement("table");
                    div.appendChild(lastTable);
                }
                lastTable.appendChild(node);
            }
            else if (node.nodeName == "TD") {
                // 遇到游离的单元格
                if (lastRow == null) {
                    lastTable = document.createElement("table");
                    div.appendChild(lastTable);
                    lastRow = document.createElement("tr");
                    lastTable.appendChild(lastRow);
                }
                lastRow.appendChild(node);
            }
            else if (node.nodeName == "LI") {
                // 遇到游离的LI元素
                if (lastOL == null) {
                    lastOL = document.createElement("ol");
                    div.appendChild(lastOL);
                }
                lastOL.appendChild(node);
            }
            else {
                div.appendChild(node);
            }
        } //for
        if (lastTable != null) {
            funcFixForTR(lastTable);
        }
        if (forTextMode === true) {
            var txt = DCDomTools.GetInnerText(div);
            return txt;
        }
        var styleHtml = "";
        var styleElement = document.getElementById("dccustomcontentstyle");
        if (styleElement != null) {
            styleHtml = "<style>" + styleElement.innerHTML + "</style>";
        }

        // 清理HTML DOM
        if(nativeHtml == null || nativeHtml == false){
            WriterCommandModuleFile.CleanDOMForSave(div);
        }
        var result = DCDomTools.GetOuterHTML(div);
        result = "<html><head>" + styleHtml + "</head><body>" + result + "</body></html>";

        //if (nativeHtml != true) {
        //    result = result.replace(/[%]/g, "$25");
        //    result = result.replace(/[<]/g, "$3C");
        //    result = result.replace(/[>]/g, "$3E");
        //    result = result.replace(/[&]/g, "$26");

        //    result = "dcr$" + result;
        //}

        //WYC20200106：新增是否进行BASE64转码的标记
        if (document.WriterControl.IsUseBase64Transfer() == true) {
            result = btoa(WriterCommandModuleFile.EncodeContentHtmlForPost(result));
        }

        return result;
    }
    return null;
};

// 新建文件
WriterCommandModuleFile.FileNew = function () {

    //wyc20201009：使用新的处理逻辑
    if (document.WriterControl == undefined || document.WriterControl == null) {
        return false;
    }
    document.WriterControl.GetContentContainer().focus();
    var doc = document.WriterControl.GetContentDocument();
    var dom = null;
    if (doc != null) {
        var p1 = document.createElement("p");
        var p2 = document.createElement("p");
        p1.appendChild(document.createTextNode("\u00a0"));
        p2.appendChild(document.createTextNode("\u00a0"));
        dom = doc.getElementById("divXTextDocumentHeaderElement");
        if (dom != null) {
            dom.innerHTML = "";
            dom.appendChild(p1);
        }
        dom = doc.getElementById("divXTextDocumentFooterElement");
        if (dom != null) {
            dom.innerHTML = "";
            dom.appendChild(p2);
        }
        dom = doc.getElementById("divDocumentBody_0");
        if (dom != null) {
            dom.setAttribute("dcdocumentviewstate", "");
            dom.innerHTML = "";
        }
    }
    ///////////////////////////////
    DCMultiDocumentManager.reset();
    var box = DCMultiDocumentManager.getCurrentDocumentContentElement();
    if (box == null) {
        var rootDiv = DCWriterControllerEditor.getdivAllContainer();
        if (rootDiv == null) {
            return false;
        }

        for (var iCount = 0; iCount < rootDiv.childNodes.length; iCount++) {
            var node = rootDiv.childNodes[iCount];
            if (DCMultiDocumentManager.isXTextDocumentBodyElement(node)) {
                box = node;
                break;
            }
        }
    }
    if (box != null) {
        while (box.firstChild != null) {
            box.removeChild(box.firstChild);
        }
        var p = document.createElement("p");
        p.appendChild(document.createTextNode("\u00a0"));
        box.appendChild(p);
        DCUndoRedo.Clear();
        return true;
    }
    return false;
};

// 插入文件
WriterCommandModuleFile.InsertFile = function (fileName, showUI, insertedCallback) {
    //if (DCWriterControllerEditor.HasServerEvent("EventReadFileContent") == false) {
    //    if (showUI) {
    //        alert(document.GetDCWriterString("JS_NoServerEvent_EventName", "EventReadFileContent"));
    //    }
    //    return false;
    //}
    if (document.body.getAttribute("readonly") == "true") {
        if (showUI == true) {
            //alert(document.GetDCWriterString("JS_PromptReadonly"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_PromptReadonly");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return false;
    }

    WriterCommandModuleFile.innerInsertContent(fileName, showUI, false);

    if (insertedCallback != null) {
        insertedCallback();
    }

    return true;
};

//WYC20190420：插入分页符,20190916改为用INPUT表示
WriterCommandModuleFile.InsertPageBreak = function () {
    var pagebreak = document.createElement("input");
    pagebreak.contentEditable = false;
    pagebreak.setAttribute("type", "button");
    pagebreak.setAttribute("value", "分页符");
    pagebreak.setAttribute("onclick", "DCDomTools.MoveCaretToEnd(this);this.focus();");
    pagebreak.setAttribute("dctype", "XTextPageBreakElement");
    pagebreak.style = "width:100%;background-color:yellow;text-align:center;border-top:none;border-bottom:1px dashed black"; 
    DCWriterControllerEditor.InsertElementAtCurentPosition(pagebreak, true);
};

//WYC20200429：插入水平线
WriterCommandModuleFile.InsertHorizontalLine = function (options) {
    var hrline = document.createElement("hr");
    hrline.color = "black";
    hrline.size = "1";
    if (options != null) {
        if (options.ID) {
            hrline.id = options.ID;
        }
        if (options.Color) {
            hrline.color = options.Color;
        }
        if (options.Size) {
            hrline.size = options.Size;
        }
    }
    DCWriterControllerEditor.InsertElementAtCurentPosition(hrline, true);
};

//WYC20200423：删除分页符
WriterCommandModuleFile.DeletePageBreak = function () {
    var sel = DCSelectionManager.getSelectionWithFix();
    var sel2 = DCDomTools.getSelection();
    var input = sel.currentContainer;
    if (input == null && document.WriterControl != null) {
        input = DCSelectionManager.getCurrentElementSpecifyNodeName("INPUT");
    }
    if (input != null && input != undefined &&
        input.getAttribute("type") == "button" &&
        input.getAttribute("value") == "分页符" &&
        input.getAttribute("dctype") == "XTextPageBreakElement") {
        input.parentNode.removeChild(input);
    } else {
        console.log("DeletePageBreak:未找到选中的分页符");
    }
};

WriterCommandModuleFile.InsertXML = function (fileName, showUI, insertedCallback) {
    if (DCWriterControllerEditor.HasServerEvent("EventReadFileContent") == false) {
        if (showUI) {
            //alert(document.GetDCWriterString("JS_NoServerEvent_EventName", "EventReadFileContent"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_NoServerEvent_EventName", "EventReadFileContent");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return false;
    }
    if (document.body.getAttribute("readonly") == "true") {
        if (showUI == true) {
            //alert(document.GetDCWriterString("JS_PromptReadonly"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_PromptReadonly");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return false;
    }

    WriterCommandModuleFile.innerInsertContent(fileName, showUI, true);

    if (insertedCallback != null) {
        insertedCallback();
    }
    return true;
};

WriterCommandModuleFile.innerInsertContent = function (fileName, showUI, forXml) {
    DCDomTools.FoucsDocument();
    var servicePageUrl = document.body.getAttribute("servicepageurl");
    var controlInstanceID = document.body.getAttribute("controlinstanceid");
    var taskID = "insertcontent" + Math.round();
    var url = servicePageUrl + "?dcwritergetdocumenthtml="
        + encodeURI(fileName) + "&controlinstanceid="
        + controlInstanceID + "&taskid=" + taskID;


    var funcCallback = function (responseText, okFlag, xmlhttp) {
        if (document.WriterControl != null && document.WriterControl.CheckForWattingMessage(responseText, document) == true ) {
            // 检测到延时等待信息，则退出本操作。
            return;
        }
        var temp = responseText.split("$dcsuccesssplit$");
        var sucessstatus = temp[0];
        var temp1 = temp[1].split("$dcmessageplit$");


        //var responseData = JSON.parse(responseText);
        var resposeHTML = DCDomTools.HTMLDecode(temp1[1]);
        document.WriterControl.ServerMessage = temp1[0];//responseData.message;
        var pelement = this;

        if (document.WriterControl.checkResponseContent(resposeHTML) == false) {
            // 内容检测不通过
            return;
        }
        if (DCSelectionManager.getCurrentEditableNode() == null) {
            DCSelectionManager.focusFirstEditableArea();
        }


        //伍贻超20180529：在这里对responseText做处理，如果是插入片断，则只解析第二个段落内的所有子元素（实际内容）并直接插入，这样插入没有回车
        //此解析方法会必须后台绘制文档体的HTML的代码相对应
        var resultHTMLText = resposeHTML;
        var bresult = pelement.getAttribute("formxl");
        if (bresult == "true") {
            var div = document.createElement("div");
            div.innerHTML = resposeHTML;
            //获取到HTML片断的第二个段落
            var para = div.childNodes[1].cloneNode(true);
            var tempdiv = document.createElement("div");
            //新建DIV用来保存段落下的元素
            for (; para.childNodes.length > 0;) {
                tempdiv.appendChild(para.firstChild);
            }
            resultHTMLText = tempdiv.innerHTML;
        } else {
            resultHTMLText = resposeHTML;
        }
        /////////////////////////////////////////////////////////////
        var $newContent = $(resultHTMLText);
        $(pelement).replaceWith($newContent);

        if (bresult != "true") {
            DCWriterControllerEditor.InitFileContentDom($newContent, true);
        } else {
            DCWriterControllerEditor.InitFileContentDom($newContent, false);
        }

        if (showUI) {
            //alert(document.GetDCWriterString("JS_SuccessInsertDocument"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_SuccessInsertDocument");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        DCDomTools.BubbleRaiseChanged();
    };


    var palceHolder = document.createElement("label");
    palceHolder.id = taskID;
    palceHolder.appendChild(document.createTextNode(document.GetDCWriterString("JS_LoadingFile_Name", fileName)));
    palceHolder.style.backgroundColor = "yellow";
    palceHolder.setAttribute("dcignore", "1");
    palceHolder.setAttribute("unselectable", "on");
    palceHolder.setAttribute("contenteditable", "false");
    palceHolder.setAttribute("formxl", forXml);
    palceHolder.style.border = "1px solid black";
    DCWriterControllerEditor.InsertElementAtCurentPosition(palceHolder, true);

    document.WriterControl.InnerLoadDocumentContentFromUrl(url, funcCallback, palceHolder);
    //DCDomTools.GetContentByUrl(url, true, funcCallback, forXml);
};

// 保存文档中被选中的内容
WriterCommandModuleFile.FileSaveSelection = function (showUI, savedCallback, userParameter) {
    //if (DCWriterControllerEditor.checkSessionTimeout(true) == false) {
        // 服务器回话超时了，退出处理。
    //    return false;
    //}
    var html = WriterCommandModuleFile.getSelectionHtml();
    if (html == null || html.length == 0) {
        return;
    }
    WriterCommandModuleFile.InnerFileSave(
        "EventSaveSelectionContent",
        "dcwritersaveselectioncontent",
        html,
        showUI,
        savedCallback,
        userParameter,
        userParameter,//这里作为保存的文件字符串处理
        null
    );
};



// 保存文件
WriterCommandModuleFile.OuterFileSave = function (fileName, format ) {
    //if (DCWriterControllerEditor.checkSessionTimeout(true) == false) {
    // 服务器回话超时了，退出处理。
    //    return false;
    //}
    var html = WriterCommandModuleFile.GetFileContentHtml( );
    var result = WriterCommandModuleFile.InnerFileSave(
        "EventSaveFileContent",
        "dcwritersavefilecontent",
        html,
        false ,
        null,
        null,
        fileName ,
        format );
    if (result == null) {
        return false;
    }
    if (typeof (result) == "boolean") {
        return result;
    }
    else {
        if (document.WriterControl != null
            && document.WriterControl.CheckForWattingMessage(result, document) == true) {
            document.WriterControl.ServerMessage = result;
            return false;
        }
        var temparray = result.split("$dcmessageplit$");
        var success = temparray[1];
        var message = temparray[0];

        if (document.WriterControl != null) {
            document.WriterControl.ServerMessage = message;
        }
        return success == "True" || success == true;
    }
};

// 保存文件
WriterCommandModuleFile.FileOpen = function (showUI, Parameter) {
    var fileurl = null;
    if (showUI === false) {
        fileurl = Parameter;
    } else {
        var input = document.getElementById("dcwritertempinputforfileopen");
        if (input === null) {
            input = document.createElement("input");
            input.id = "dcwritertempinputforfileopen";
            input.type = "file";
            input.name = "file";
            input.accept = "text/xml, application/xml";
            input.style.display = "none";
            input.onchange = function () {
                fileurl = window.URL.createObjectURL(input.files[0]);
                $(input).remove();
                if (fileurl != null) {
                    $.ajax({
                        url: fileurl,
                        dataType: 'text',
                        type: 'GET',
                        timeout: 2000,
                        error: function (xml) {
                            alert("加载XML 文件出错！");
                        },
                        success: function (xml) {
                            var ctl = document.WriterControl;
                            //console.log(ctl);
                            if (ctl != null) {
                                if (Parameter && Parameter.UseBASE64 == "true") {
                                    ctl.LoadDocumentFromBase64String(xml, "xml");
                                } else {
                                    ctl.LoadDocumentFromString(xml, "xml");
                                }
                                ctl.FileName = input.files[0].name;
                            }
                        }
                    });
                }                
                return;
            };
            document.body.appendChild(input);
            input.click();
        } else {
            input.click();
        }
    }

    
};


// 保存文件
WriterCommandModuleFile.FileSave = function (showUI, savedCallback, userParameter) {
    //if (DCWriterControllerEditor.checkSessionTimeout(true) == false) {
    // 服务器回话超时了，退出处理。
    //    return false;
    //}
    var html = WriterCommandModuleFile.GetFileContentHtml( );
    var result = WriterCommandModuleFile.InnerFileSave(
        "EventSaveFileContent",
        "dcwritersavefilecontent",
        html,
        showUI,
        savedCallback,
        null,
        userParameter);
    if (result == null) {
        return false;
    }
    if (typeof (result) == "boolean") {
        return result;
    }
    else {
        var temparray = result.split("$dcmessageplit$");
        var success = temparray[1];
        var message = temparray[0];

        if (document.WriterControl != null) {
            document.WriterControl.ServerMessage = message;
        }
        return success == "True" || success == true;
    }
};

// 保存文件
WriterCommandModuleFile.InnerFileSave = function (
    eventName,
    serverMethod,
    htmlContent,
    showUI,
    savedCallback,
    userParameter,
    fileName,
    fileFormat ) {

    //if (DCWriterControllerEditor.HasServerEvent(eventName) == false) {
    //    if (showUI) {
    //        alert(document.GetDCWriterString("JS_NoServerEvent_EventName", eventName));
    //    }
    //    return false;
    //}
    var servicePageUrl = document.body.getAttribute("servicepageurl");
    var pageName = document.body.getAttribute("pagename");
    var controlName = document.body.getAttribute("controlname");
    var opt = document.body.getAttribute("documentloadoptions");
    var url = servicePageUrl + "?" + serverMethod + "=1&pagename=" + pageName
        + "&controlname=" + controlName
        + "&options=" + opt
        + "&userparameter=" + encodeURIComponent(userParameter)
        //+ "&filename=" + encodeURIComponent(fileName)
        + "&fileformat=" + encodeURIComponent(fileFormat);

    //WYC20200106：新增是否进行BASE64转码的标记
    if (document.WriterControl.IsUseBase64Transfer() == true) {
        url = url + "&transformusebase64=true";
    }

    if (document.WriterControl != null && document.WriterControl.IsLogUserEditTrack() == true) {
        var userJson = WriterCommandModuleFile.UserInfoJson;
        if (userJson != null && userJson.length > 0) {
            url = url + "&userinfo=" + encodeURIComponent(userJson);
        }
    }
    
    //wyc20200427：备忘：这个回调函数没用上
    var funcCallback = function (responseText, okFlag, parameter, xmlhttp) {
        if (document.WriterControl != null && document.WriterControl.CheckForWattingMessage(responseText, document) == true) {
            // 检测到延时等待信息，则退出本操作。
            return;
        }
        if (savedCallback != null) {
            savedCallback();
        }
        if (showUI) {
            if (responseText == "true") {
                //alert(document.GetDCWriterString("JS_SaveDocumentOK"));
                if (document.WriterControl) {
                    var eventObject = new Object();
                    eventObject.Message = document.GetDCWriterString("JS_SaveDocumentOK");
                    eventObject.State = document.WriterControl.ErrorInfo.Error;
                    document.WriterControl.MessageHandler(eventObject);
                }
            }
            else {
                //alert(document.GetDCWriterString("JS_SaveDocumentFail"));
                if (document.WriterControl) {
                    var eventObject = new Object();
                    eventObject.Message = document.GetDCWriterString("JS_SaveDocumentFail");
                    eventObject.State = document.WriterControl.ErrorInfo.Error;
                    document.WriterControl.MessageHandler(eventObject);
                }
                return false;
            }
        }
    };
    
    //return DCDomTools.PostContentByUrl(url, true, funcCallback, null, htmlContent); //异步调用
    htmlContent = WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);
    htmlContent = encodeURIComponent(fileName) + "$dcfilenamesplitter$" + htmlContent;//将filename与htmlcontent绑在一起POST
    return DCDomTools.PostContentByUrlNotAsync(url, showUI, htmlContent , false );    //改成同步调用，为了得到服务端返回的值

    // 重置服务器回话超时检测
    //DCWriterControllerEditor.resetSessionTimeout();
};

WriterCommandModuleFile.EncodeContentHtmlForPost = function (html) {
    if (html == null || html.length == 0) {
        return "";
    }
    var encodeCount = 2;
    if (document.WriterControl != null && document.WriterControl.Options != null) {
        encodeCount = parseInt(document.WriterControl.Options.UrlEncodeCountForPostData);
        if (isNaN(encodeCount)) {
            encodeCount = 2;
        }
        if (encodeCount > 3) {
            // 最多不能超过3次
            encodeCount = 3;
        }
    }
    if (encodeCount > 0) {
        for (var iCount = 0; iCount < encodeCount; iCount++) {
            html = "encodeURIComponentFlag:" + encodeURIComponent(html);
        }
    }
    return html;
    //return "encodeURIComponentFlag:" + encodeURIComponent(encodeURIComponent(html));
};

//@method 设置当前用户信息
//@param userID 用户名
//@param userName 用户姓名
//@param userLevel 用户授权等级
//@param savedTime 保存时间
//@param clientName 客户端名称
WriterCommandModuleFile.SetUserInfo = function (userID, userName, userLevel, savedTime, clientName) {
    if (userID == null) {
        WriterCommandModuleFile.UserInfoJson = null;
    }
    else {
        var info  = {
            "ID": userID,
            "Name": userName,
            "PermissionLevel": userLevel,
            "SavedTime": savedTime,
            "ClientName": clientName
        };
        WriterCommandModuleFile.UserInfoJson = JSON.stringify(info);
    }
};

//获得文件XML内容 张昊 2017-2-15 EMREDGE-28
WriterCommandModuleFile.GetXmlContent = function (htmlContent) {
    var result = "";
    var servicePageUrl = document.body.getAttribute("servicepageurl");
    var pageName = document.body.getAttribute("pagename");
    var controlName = document.body.getAttribute("controlname");
    var opt = document.body.getAttribute("documentloadoptions");

    var url = servicePageUrl + "?" + "dcwritergetxmlcontent" + "=1&pagename=" + pageName
        + "&controlname=" + controlName
        + "&options=" + opt;
    var userJson = WriterCommandModuleFile.UserInfoJson;
    if (userJson != null && userJson.length > 0) {
        url = url + "&userinfo=" + encodeURI(userJson );
    }
    if (typeof (htmlContent) == "undefined") {
        // 获得页面HTML内容
        htmlContent = WriterCommandModuleFile.GetFileContentHtml( );
    }

    htmlContent = WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);

    result = DCDomTools.PostContentByUrlNotAsync(url, true, htmlContent); //传递路径和HTML内容，返回XML文本
    return result;
};

// 获得要保存的HTML代码。
//@param rootElement 文档元素对象
//@returns 要保存的HTML代码文本。
WriterCommandModuleFile.CleanDOMForSave = function (rootElement) {
    //$("select" , rootElement ).each(function () {
    //    // IPAD返回的HTML的select.option.selected值不对，在此额外的设置属性值。
    //    this.setAttribute("dcselectedindex", this.selectedIndex);
    //});

    //var selectElements = document.getElementsByTagName("SELECT");
    //if (selectElements != null && selectElements.length > 0) {
    //    for (var iCount = 0; iCount < selectElements.length; iCount++) {
    //        var element = selectElements[iCount];
    //        // IPAD返回的HTML的select.option.selected值不对，在此额外的设置属性值。
    //        element.setAttribute("dcselectedindex", element.selectedIndex);
    //    }
    //}

    // 清理输入域无效的内容
    $("*[dctype='XTextInputFieldElement']", rootElement).each(function () {
        this.removeAttribute("eventlist");
        this.removeAttribute("rmfhk");
        this.removeAttribute("hasbegin");
        this.removeAttribute("hasend");
        this.removeAttribute("rehl");
        this.removeAttribute("rbtc");
        this.removeAttribute("bordertextcolor");
        this.removeAttribute("contentcolor");
        this.removeAttribute("empty");
        //this.removeAttribute("idback");
        this.removeAttribute("localclass");
        this.removeAttribute("dctempid");
        var ss = this.getAttribute("style");
        if (ss == null || ss.length == 0) {
            this.removeAttribute("style");
        }
        if (this.nodeName == "INPUT") {
            this.removeAttribute("dc_backgroundtext");
            this.removeAttribute("dc_name");
        }
    });
    // 删除无效元素
    $("span[dcignore='1']", rootElement).remove();
    //$("label[dcignore='1']", rootElement).remove();
    $("script", rootElement).remove();
    $("table", rootElement).each(function () {
        this.removeAttribute("colwidths");
    });
    $("td", rootElement).each(function () {
        this.removeAttribute("cellid");
        this.removeAttribute("rmfhk");
    });
    var pageUnitRate = parseFloat(document.body.getAttribute("pageunitrate"));
    if (isNaN(pageUnitRate) == false) {
        $("tr", rootElement).each(function () {
            var dsh = parseFloat(this.getAttribute("dsh"));
            if (isNaN(dsh) == false) {
                var rh = this.offsetHeight * pageUnitRate;
                if (Math.abs(rh - dsh) > 40) {
                    this.removeAttribute("dsh");
                }
            }
        });
    }
};

// 获得文件HTML内容
WriterCommandModuleFile.GetFileContentHtml = function (inluceWebConrolOptions, encodeData ) {
    // 修复文档中所有的输入域DOM结构
    var tick = DCDomTools.GetDateMillisecondsTick(new Date());
    DCDropdownControlManager.CloseDropdownControl();
    DCInputFieldManager.FixAllInputFieldElementDom();
    var result = "";
    WriterCommandModuleFile.fixCheckedAttribute();
    DCMultiDocumentManager.writeModifyAttribute();
    var sel = DCSelectionManager.getSelection();
    // 设置当前元素状态
    var selectedNode = null;
    if (sel != null && sel.startContainer != null) {
        selectedNode = sel.startContainer;
        while (selectedNode != null) {
            var match = false;
            if (selectedNode.getAttribute) {
                var dctype = selectedNode.getAttribute("dctype");
                if (dctype != "start"
                    && dctype != "end"
                    && dctype != "backgroundtext") {
                    match = true;
                }
            }
            if (selectedNode.nodeName == "TD"
                || selectedNode.nodeName == "TR"
                || selectedNode.nodeName == "INPUT"
                || selectedNode.nodeName == "SELECT"
                || selectedNode.nodeName == "TEXTAREA") {
                match = true;
            }
            if (match == true) {
                selectedNode.setAttribute("dc_webclientselected", "true");
                break;
            }
            selectedNode = selectedNode.parentNode;
        } //while
    }
    $("div[dcsave]").each(function () {
        // 获得所有要保存的内容
        $("select",this).each(function () {
            // IPAD返回的HTML的select.option.selected值不对，在此额外的设置属性值。
            this.setAttribute("dcselectedindex", this.selectedIndex);
        });

        $("input:checkbox,input:radio").each(function () {
            var tempid = this.id + "_label";
            var tempelement = document.WriterControl.GetContentDocument().getElementById(tempid);
            if (tempelement == null) {
                tempelement = this;
            }
            var thisheight = this.getAttribute("dc_height");
            var thiswidth = this.getAttribute("dc_width");
            if (thisheight == undefined || thisheight < tempelement.offsetHeight) {               
                this.setAttribute("dc_height", tempelement.offsetHeight);
            }
            // 20210326 xym 暂时修复BSDCWRIT-195
            // dc_width目前保存的是像素值，可能后台没有处理像素值，导致单复选框样式有问题，暂时注释
            // if (thiswidth == undefined || thiswidth < tempelement.offsetWidth) {
            //     this.setAttribute("dc_width", tempelement.offsetWidth);
            // }
        });
        
        // 深度复制节点
        var tempElement = this.cloneNode(true);
        if (document.WriterControl != null
            && document.WriterControl.IsLogUserEditTrack() == true) {
            // 如果为记录用户痕迹，则删除逻辑删除的内容。
            $(".DCLogicDeletedCurrent,.DCLogicDeleted0,.DCLogicDeleted1,.DCLogicDeleted2", tempElement).each(function () {
                this.parentNode.removeChild(this);
            });
            //20190715 xuyiming 解决 DCWRITER-2682 痕迹的用户名显示为null
            tempElement.setAttribute("LogUserEditTrack", "true");
            tempElement.setAttribute("CurrentUserID", document.WriterControl.Options.CurrentUserID);
            tempElement.setAttribute("CurrentUserName", document.WriterControl.Options.CurrentUserName);
            tempElement.setAttribute("CurrentUserPermissionLevel", document.WriterControl.Options.CurrentUserPermissionLevel);
            tempElement.setAttribute("ClientMachineName", document.WriterControl.Options.ClientMachineName);
        }// 清理冗余的数据
        WriterCommandModuleFile.CleanDOMForSave(tempElement);
        result = result + DCDomTools.GetOuterHTML(tempElement);
    });
    var rootElement = document.getElementById("DCDocumentViewState");
    if (rootElement != null) {
        result = result + DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(rootElement));
    }
    ////伍贻超20190415：在这里添加保存前端页眉HTML的处理，20190424添加首页眉处理
    //rootElement = document.getElementById("divHeader");
    //if (rootElement != null) {
    //    result = result + DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(rootElement));
    //}
    //rootElement = document.getElementById("divHeaderForFirstPage");
    //if (rootElement != null) {
    //    result = result + DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(rootElement));
    //}
    //////////////////////////////////////////////////////////////////////////////
    //rootElement = DCWriterControllerEditor.getdivAllContainer();
    //if (rootElement != null) {
    //    $("select").each(function () {
    //        // IPAD返回的HTML的select.option.selected值不对，在此额外的设置属性值。
    //        this.setAttribute("dcselectedindex", this.selectedIndex);
    //    });

    //    //var selectElements = document.getElementsByTagName("SELECT");
    //    //if (selectElements != null && selectElements.length > 0) {
    //    //    for (var iCount = 0; iCount < selectElements.length; iCount++) {
    //    //        var element = selectElements[iCount];
    //    //        // IPAD返回的HTML的select.option.selected值不对，在此额外的设置属性值。
    //    //        element.setAttribute("dcselectedindex", element.selectedIndex);
    //    //    }
    //    //}

    //    // 深度复制节点
    //    rootElement = rootElement.cloneNode(true);
    //    // 清理冗余的数据
    //    WriterCommandModuleFile.CleanDOMForSave(rootElement);
    //    result = result + DCDomTools.GetInnerHTML(rootElement);
    //}
    ////伍贻超20190415：在这里添加保存前端页脚HTML的处理,20190424添加首页脚处理
    //rootElement = document.getElementById("divFooter");
    //if (rootElement != null) {
    //    result = result + DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(rootElement));
    //}
    //rootElement = document.getElementById("divFooterForFirstPage");
    //if (rootElement != null) {
    //    result = result + DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(rootElement));
    //}
    /////////////////////////////////////////////////////////////////////////////
    rootElement = document.getElementById("dcmContainer");
    if (rootElement != null) {
        result = result + DCDomTools.removeScriptElement(DCDomTools.GetInnerHTML(rootElement));
    }
    if (selectedNode != null && selectedNode.removeAttribute) {
        selectedNode.removeAttribute("dc_webclientselected");
    }
    var styleElement = document.getElementById("dccustomcontentstyle");
    if (styleElement != null) {
        result = "<style>" + styleElement.innerHTML + "</style>" + result;
    }
    var currentDocumentIndex = DCMultiDocumentManager.getCurrentDocumentIndex();
    result = "<html><body currentdocumentindex='" + currentDocumentIndex + "' >" + result + "</body></html>";

    //result = result.replace(/[%]/g, "$25~");
    //result = result.replace(/[<]/g, "$3C~");
    //result = result.replace(/[>]/g, "$3E~");
    //result = result.replace(/[&]/g, "$26~");
    
    //result = "dcr$" + result;
     
    tick = DCDomTools.GetDateMillisecondsTick(new Date()) - tick;
    //alert(tick);

    //WYC20200106：新增是否进行BASE64转码的标记
    if (document.WriterControl.IsUseBase64Transfer() == true) {
        result = btoa(WriterCommandModuleFile.EncodeContentHtmlForPost(result));
    }

    //wyc20200616：将dcwritercontrol.getcontenthtml内的代码移值到此
    if (encodeData == true
        && document.WriterControl.IsUseBase64Transfer() == false) {
        result = this.EncodeContentHtmlForPost(result);
    }
    if (inluceWebConrolOptions == true) {
        //xym 20200730 修复遇到编辑器ID首字母是数字的情况下报错问题
        var input = $(document.WriterControl).find("#" + document.WriterControl.id + "_WebWriterControlOptions")[0];
        if (input != null) {
            // 追加系统配置
            result = "$dcweboptionstart$" + input.value + "$dcweboptions$" + result;
        }
    }     
    ////////////

    return result;
     
    //// 这是一个BUG之源，不过触发的概率很低 ###########################################
    
    //// 在此处理尖括号，避免服务器端报表单数据格式异常的错误。
    //result = result.replace(/[<]/g, "[3#$~!]");
    //result = result.replace(/[<]/g, "[3#$~!]");
    //result = result.replace(/[>]/g, "[!$~$#]");
    //result = result.replace(/[&]/g, "[!$~$%]");
    //return result;
};

//@method 获取打印预览界面下整篇文档的结束位置 wyc20200715
WriterCommandModuleFile.GetFullDocumentEndPosition = function () {
    var ctl = document.WriterControl;
    if (ctl == null) {
        return null;
    }
    var previewdoc = null;
    var win = document.WriterControl.GetContentWindow(false);
    if (win != null && win.document != null) {
        previewdoc = win.document;
    } else {
        previewdoc = document.WriterControl.GetContentDocument();
    }
    var bodies = previewdoc.querySelectorAll("#divDocumentBody_0");  
    if (bodies.length > 0) {
        var pages = previewdoc.querySelectorAll(".dcpageforprint");
        var lastpagedom = pages[pages.length - 1];
        var lastbody = bodies[bodies.length - 1];
        var position = lastpagedom.offsetTop + lastbody.offsetTop + lastbody.offsetHeight;       
        return position;
    }
    return null;
};


//@method 打印
WriterCommandModuleFile.FilePrint = function ( settings ) {
    if (window.open && window.print) {
        var autoClose = true;//WriterCommandModuleFile.FilePrintAutoClose == false ? false : true; //true; // 打印完毕后是否自动关闭打印窗口。
        if ((document.WriterControl != null
            && document.WriterControl.getAttribute
            && document.WriterControl.getAttribute("fileprintautoclose") == "false") ||
            (settings && settings.AutoClose == "false")) {
            autoClose = false;
        }
        var isLandscape = document.body.getAttribute("landscape").toLocaleLowerCase() == "true";
        var isTransformLandscape = true;//xym 20200720 添加isTransformLandscape属性控制横向文档打印时是否倒转，默认true：倒转，false:不倒转
        if (document.WriterControl != null && document.WriterControl.Options != null && document.WriterControl.Options.isTransformLandscape != null) {
            isTransformLandscape = DCDomTools.toBoolean(document.WriterControl.Options.isTransformLandscape, true);
        }
        var PrintWindowWidth = "450";
        var PrintWindowHeight = "470";
        var PrintWindowTop = "100";
        var PrintWindowLeft = "400";
        if (settings != null && settings.PrintWindowWidth) {
            PrintWindowWidth = settings.PrintWindowWidth.toString();//parseInt(settings.PrintWindowWidth);
        } 
        if (settings != null && settings.PrintWindowHeight) {
            PrintWindowHeight = settings.PrintWindowHeight.toString();//parseInt(settings.PrintWindowWidth);
        } 
        if (settings != null && settings.PrintWindowTop) {
            PrintWindowTop = settings.PrintWindowTop.toString();//parseInt(settings.PrintWindowWidth);
        } 
        if (settings != null && settings.PrintWindowLeft) {
            PrintWindowLeft = settings.PrintWindowLeft.toString();//parseInt(settings.PrintWindowWidth);
        }
        if (settings != null && settings.JumpPrint && (settings.JumpPrint === true || settings.JumpPrint === false)) {
            this.SetJumpPrintMode(settings.JumpPrint);
        }
        var printposition = settings != null && settings.PrintPosition ? settings.PrintPosition : null;
        var printendposition = settings != null && settings.PrintEndPosition ? settings.PrintEndPosition : null;

        var oPrntWin = window.open("", "_blank", "width=" + PrintWindowWidth + ",height=" + PrintWindowHeight + ",left=" + PrintWindowLeft + ",top=" + PrintWindowTop + ",menubar=yes,toolbar=no,location=no,scrollbars=yes,resizable=yes");

        var rootElement = document.getElementById("dcRootCenter");
        if (rootElement == null) {
            rootElement = document.body;
        }

        var contentHtml = DCDomTools.removeScriptElement(rootElement.innerHTML);
        var isJumpPrint = false;
        WriterCommandModuleFile.LastJumpPrintPosition = this.GetFullDocumentEndPosition();
        if (WriterCommandModuleFile.IsJumpPrintMode() == true) {
            // 处于续打模式
            var jumpMask = document.getElementById("divJumpPrintMask");
            var h = null; 
            if (printposition != null) {
                h = printposition;
            } else {
                h = jumpMask.offsetHeight - 3;//修改续打时一些细微差别
            }
            ////记录最后一次续打的位置 //wyc20200715:修改原有逻辑加入结束位置判断
            ////续打结束位置记录功能暂时先废弃以后再说
            //var lastjumpMask = document.getElementById("divLastJumpPrintMask");
            //var p = this.GetFullDocumentEndPosition();
            WriterCommandModuleFile.LastJumpPrintPosition = this.GetFullDocumentEndPosition();//先糊一下
            //if (lastjumpMask.style.height == "0px" || lastjumpMask.style.top > p) {
            //    WriterCommandModuleFile.LastJumpPrintPosition = p;
            //} else {
            //    WriterCommandModuleFile.LastJumpPrintPosition = lastjumpMask.style.top;
            //}
            ////////////////////////////////////////////////////////////////////
            ////wyc20200715：新增准备打印结束位置的掩盖图片           
            //var imgSrcLast = document.body.getAttribute("servicepageurl") + "?dcwritergetwhiteimage=1";
            //var t = null;
            //if (printendposition != null) {
            //    t = printendposition;
            //} else if (lastjumpMask.style.height != "0px") {
            //    t = lastjumpMask.style.top;
            //}
            ////wyc20200715:先遍历页脚元素找到续打结束位置所在的页号
            //var jumpMaskLast = document.getElementById("divLastJumpPrintMask");
            //var t = null;
            //if (printendposition != null) {
            //    t = printendposition;
            //} else {
            //    t = jumpMask.offsetHeight - 3;//修改续打时一些细微差别
            //}
            //var endPageIndex = null;
            //var divs = document.getElementsByTagName("DIV");
            //for (var iCount = 0; iCount < divs.length - 1; iCount++) {
            //    var divFooter = divs[iCount];
            //    if (divFooter.id == "divXTextDocumentFooterElement") {
            //        endPageIndex = parseInt(divFooter.getAttribute("pageindex"));
            //        var footerTop = DCDomTools.GetViewTopInDocument(divFooter);
            //        if (t <= footerTop) {
            //            break;//说明续打结束位置位于该页页脚处的上方，该页为续打内容的最后一页
            //        }
            //    }
            //}
            ////////////////////////////////////////////////////////////
            //var isLandscape = document.body.getAttribute("landscape") == "true";
            //var strMask2 = "";
            //if (isLandscape && isTransformLandscape) {
            //    strMask2 = "<img id='jumpPrintMaskLast' jumppos='" + t + "' jumpposheight='" + lastjumpMask.style.height + "' src='" + imgSrcLast + "' style='position:absolute;    transform-origin: 0 0;transform: rotate(-90deg);;background-color:white;z-index:10000;left:-5px;top:1100px; width: 1100px;height:1px;border:1px solid white' />"; //IE7不支持rotate
            //} else {
            //    strMask2 = "<img id='jumpPrintMaskLast' jumppos='" + t + "' jumpposheight='" + lastjumpMask.style.height + "' src='" + imgSrcLast + "' style='position:absolute;background-color:white;z-index:10000;left:-1px;top:0px;width:100%;height:0px;border:1px solid white' />";
            //}
            ////////////////////////////////////////////////
            var divs = document.getElementsByTagName("DIV");
            for (var iCount = divs.length - 1; iCount >= 0; iCount--) {
                var divHeader = divs[iCount];
                if (divHeader.id == "divXTextDocumentHeaderElement") {
                    // 遍历所有的页眉元素，修正续打位置
                    var startPageIndex = parseInt(divHeader.getAttribute("pageindex"));
                    var headerTop = DCDomTools.GetViewTopInDocument(divHeader);
                    if (headerTop <= h) {
                        // 这页出现了续打
                        var jumpPrintPos = h - headerTop;
                        var imgSrc = document.body.getAttribute("referencepathfordebug");
                        if (imgSrc != null && imgSrc.length > 0) {
                            imgSrc = imgSrc + "/whitemask.bmp";
                        }
                        else {
                            imgSrc = document.body.getAttribute("servicepageurl") + "?dcwritergetwhiteimage=1";
                        }
                        //var isLandscape = document.body.getAttribute("landscape").toLocaleLowerCase() == "true";//.toLocaleLowerCase()
                        if (isLandscape && isTransformLandscape) {
                            var strMask = "<img id='jumpPrintMask' pageindex='" + startPageIndex + "' jumppos='" + jumpPrintPos + "' src='" + imgSrc + "' style='position:absolute;    transform-origin: 0 0;transform: rotate(-90deg);;background-color:white;z-index:10000;left:-5px;top:1100px; width: 1100px;height:1px;border:1px solid white' />"; //IE7不支持rotate
                        } else {
                            var strMask = "<img id='jumpPrintMask' pageindex='" + startPageIndex + "' jumppos='" + jumpPrintPos + "' src='" + imgSrc + "' style='position:absolute;background-color:white;z-index:10000;left:-1px;top:0px;width:100%;height:1px;border:1px solid white' />";
                        }
                        contentHtml = strMask;
                        for (var pi = 0; pi < rootElement.childNodes.length; pi++) {
                            var pdiv = rootElement.childNodes[pi];
                            if (pdiv.innerHTML != undefined) {
                                var pi2 = parseInt(pdiv.getAttribute("pageindex"));
                            }

                            if (isNaN(pi2) == false && pi2 >= startPageIndex /*&& pi2 <= endPageIndex*/) {//这个注释用于剪切多余空白的页面，但会导致结束位置计算有误，仍然需要处理
                                contentHtml = contentHtml + "\r\n" + DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(pdiv));
                            }
                        }
                        //contentHtml = strMask + contentHtml;
                        isJumpPrint = true;
                        break;
                    }
                }
            } //for  
            // contentHtml = strMask2 + contentHtml;
        } //if (WriterCommandModuleFile.IsJumpPrintMode() == true) {
        //WYC20190926:fileprint全部使用预览状态下的HTML，不再提取原文档的设置页面偏移
        var ps = null;//document.body.getAttribute("pagesettingstylecontent");
        if (ps == null) {
            ps = "@page{margin-left:0cm;margin-top:0cm;margin-right:0cm;margin-bottom:0cm;";
        }
        //else {
        //    ps = "@media print{" + ps + "}  " + ps;
        //}
        //DCWRITER-3691 
        if (isLandscape && !isTransformLandscape) {//横向 且 不倒转
            ps += "size: landscape;";
        }
        ps += "}";
        var html = "<html><head><style> P{margin:0px}  " + ps + " </style>";

        var styleString = "";
        var styleElement = document.getElementById("dccontentstyle");
        if (styleElement != null) {
            styleString = styleElement.innerHTML;
        }
        styleElement = document.getElementById("dccustomcontentstyle");
        if (styleElement != null) {
            styleString = styleString + "\r\n" + styleElement.innerHTML;
        }
        if (styleString.length > 0) {
            html = html + "<style>" + styleString + "</style>";
        }

        html = html + "<style>.hiddenforprint{display:none;}</style>";

        html = html + "</head><body style='padding-left:1px;padding-top:0px;padding-right:0px;padding-bottom:0px;margin:0px"
        var zoomRate = document.body.getAttribute("printzoomrate");
        if (zoomRate != null && zoomRate.length > 0 && parseInt(zoomRate) != 1) {
            html = html + "zoom:" + zoomRate
                    + ";-moz-transform:scale(" + zoomRate
                    + ");-moz-transform-origin:top left;";
        }
        // html = html + "'>" + contentHtml + strMask2;
        html = html + "'>" + contentHtml;
        html = html + "</body></html>";
        var funcPrint = function () {
            $("div[name=dcHiddenElementForPrint]", oPrntWin.document.body).each(function () {
                this.style.display = "none";
            });
            var tds = oPrntWin.document.getElementsByTagName("TD");
            for (var iCount = 0; iCount < tds.length; iCount++) {
                var td = tds[iCount];
                if (td.id == "dcGlobalRootElement") {
                    td.width = "";
                }
            }
            //wyc20200715：添加结束打印位置的白色掩盖
            var divMaskLast = oPrntWin.document.getElementById("jumpPrintMaskLast");
            if (divMaskLast != null) {
                var toppos = divMaskLast.getAttribute("jumppos");
                //var f = parseFloat(toppos.replace("px", ""));
                var topposheight = divMaskLast.getAttribute("jumpposheight");
                divMaskLast.style.height = topposheight;
                divMaskLast.style.top = toppos;
                divMaskLast.style.top = (divMaskLast.offsetTop - 3).toString() + "px";
            }
            /////////////////////////////////////////
            var divMask = oPrntWin.document.getElementById("jumpPrintMask");
            if (divMask != null) {
                // 设置续打位置
                var divs = oPrntWin.document.getElementsByTagName("DIV");
                var pageindex = divMask.getAttribute("pageindex");
                for (var iCount = 0; iCount < divs.length; iCount++) {
                    var divHeader = divs[iCount];
                    if (divHeader.id == "divXTextDocumentHeaderElement" && divHeader.getAttribute("pageindex") == pageindex) {
                        var headerTop = DCDomTools.GetViewTopInDocument(divHeader);
                        var h = headerTop + parseFloat(divMask.getAttribute("jumppos"));
                        divMask.style.height = h;
                        var dcTable = oPrntWin.document.getElementById("dctable_AllContent");
                        if (dcTable != null) {
                            //divMask.style.width = dcTable.scrollWidth + 2;
                        }
                        // 发生续打的那页不打印页眉页脚
                        divHeader.style.visibility = "hidden";
                        var divFooter = divHeader;
                        while (divFooter != null) {
                            if (divFooter.id == "divXTextDocumentFooterElement") {
                                divFooter.style.display = "none";
                                //divFooter.style.visibility = "hidden";
                                break;
                            }
                            divFooter = divFooter.nextSibling;
                        }
                        break;
                    } //if
                } //for
            } //if
            if (document.WriterControl != null
                && document.WriterControl.EventBeforePrint != null
                && typeof (document.WriterControl.EventBeforePrint) == "function") {
                //  触发控件的EventBeforePrint事件，该事件的绑定形式为
                // ctl.EventBeforePrint = function( doc ){};
                // 在函数体内 this表示编辑器控件，doc表示要打印的HTML文档对象。
                if (document.WriterControl.EventBeforePrint.call(
                    document.WriterControl,
                    oPrntWin.document) === false) {
                    //wyc20200709：若返回false直接关闭窗体不打印了
                    oPrntWin.close();
                    return;
                }
            }
            //wyc20210303：新增临时位移打印内容的功能
            if (settings != null && settings.PrintMarginLeft) {
                // oPrntWin.document.body.style.marginLeft = settings.PrintMarginLeft;
                $(oPrntWin.document.body).find(">div[pageindex]").each(function () {
                    $(this).css("margin-left", settings.PrintMarginLeft);
                });
            }
            if (settings != null && settings.PrintMarginTop) {
                // oPrntWin.document.body.style.marginTop = settings.PrintMarginTop;
                $(oPrntWin.document.body).find("div[dcpart='pagecontent']").each(function () {
                    $(this).css("margin-top", settings.PrintMarginTop);
                });
            }
            /////////////////////////////////////////
            if (isJumpPrint) {
                // 续打
                //解决IE续打无法打印问题 2019-04-02 xuyiming
                setTimeout(function () {
                    var result2 = oPrntWin.print(); // 打印文档
                    if (autoClose == true) {
                        //oPrntWin.setInterval("window.close();", 1000);
                        oPrntWin.close(); // 关闭弹出式窗体
                    }
                    DCWriterControllerEditor.executeWriterControlEventHandler(null, "onafterdocumentprint");
                }, 300);
            }
            else {
                var result2 = oPrntWin.print(); // 打印文档
                if (autoClose == true) {
                    //oPrntWin.setInterval("window.close();", 1000);
                    oPrntWin.close(); // 关闭弹出式窗体
                }
                DCWriterControllerEditor.executeWriterControlEventHandler(null, "onafterdocumentprint");
            }
        } //var funcPrint = function () 打印函数

        oPrntWin.document.open();
        $(oPrntWin.document).ready(function () {
            //原来的代码： 文档完成加载后打印
            //eventFired = true;
            //if (htmlHandled == true) {
            //    funcPrint();
            //}
            //wyc20200602：文档完成加载后延迟一下再打印，否则会出现图片数据传不过来的问题
            setTimeout(function () {
                prepareHTML(oPrntWin);
                funcPrint();
            }, 500)
            //////////////////////////////////
        });

        oPrntWin.document.write(html);
        oPrntWin.document.close();

        //hulijun 解决预览后 打印指定页 20210107
        if (settings && settings.PageIndexs) {
            var pageIndexs = settings.PageIndexs.split(",");
            var pages = $(oPrntWin.document).find("body>div[pageindex]")
            if (pageIndexs.length > 0 && pages.length > pageIndexs.length) {
                for (var i = 0; i < pages.length; i++) {
                    var pageindex = parseInt(pages[i].attributes["pageindex"].value) + 1 + "";
                    var printThisPage = false;
                    for (var j = 0; j < pageIndexs.length; j++) {
                        if (pageindex == pageIndexs[j]) {
                            printThisPage = true;
                            break;
                        }
                    }
                    if (!printThisPage) {
                        pages[i].style.display = "none";
                    }
                }
            }
        }

        oPrntWin.document.title = document.title;

        // 原代码：判断是否为横向打印
        var prepareHTML = function (oPrntWin) {
            //DCWRITER-3691
            var isLandscape = document.body.getAttribute("landscape").toLocaleLowerCase() == "true";//.toLocaleLowerCase()
            var div = oPrntWin.document.getElementById("divDropdownContainer");
            if (div != null) {
                div.parentNode.removeChild(div);
            }
            var tables = oPrntWin.document.getElementsByTagName("TABLE");
            if (tables != null && tables.length > 0) {
                for (var iCount = 0; iCount < tables.length; iCount++) {
                    var table = tables[iCount];
                    if (table.id == "dctable_AllContent") {
                        var hasBackgroundImage = table.getAttribute("hasbackgroundimage") == "true";

                        if (table.getAttribute("haspageborder") != "true") {
                            // 没有页面边框，则设置表格边框为空。
                            table.style.border = "0px none white";
                            //table.style.border = "1px solid black";
                            //table.style.backgroundColor = "#dddddd";
                        }
                        if (table.style.removeAttribute) {
                            table.style.removeAttribute("border-radius");
                        }
                        table.style.borderRadius = "";
                        //table.style.overflow = "hidden";
                        var contentRow = table.rows[0];
                        if (table.rows) {
                            contentRow = table.rows[0];
                        }
                        else if (table.firstChild.nodeName == "TD") {
                            contentRow = table.firstChild;
                        }
                        else if (table.firstChild.nodeName == "TBODY") {
                            contentRow = table.firstChild.firstChild;
                        }
                        if (hasBackgroundImage == false && contentRow != null) {
                            contentRow.removeAttribute("height");
                        }
                        if (hasBackgroundImage == false) {
                            var hasgutter = table.getAttribute("hasgutter") == "1";
                            for (var iCount2 = 0; iCount2 < contentRow.childNodes.length; iCount2++) {
                                var tdNode = contentRow.childNodes[iCount2];
                                if (tdNode.nodeName == "TD") {
                                    var part = tdNode.getAttribute("part");
                                    var hidden = false;
                                    if (isLandscape && isTransformLandscape) {
                                        // 横向打印
                                        if (hasgutter) {
                                            // 有装订线
                                            if (part == "leftgutter") {
                                                hidden = true;
                                            }
                                        }
                                        else {
                                            if (part == "leftmargin") {
                                                hidden = true;
                                            }
                                        }
                                    }
                                    else {
                                        // 常规的纵向打印
                                        if (hasgutter) {
                                            if (part == "rightgutter") {
                                                hidden = true;
                                            }
                                        }
                                        else {
                                            if (part == "rightmargin") {
                                                hidden = true;
                                            }
                                        }
                                    }
                                    if (hidden) {
                                        tdNode.style.display = "none";
                                    }
                                    else {
                                        tdNode.style.display = "";
                                    }
                                }
                            }
                        }

                        if (isLandscape && isTransformLandscape) {
                            // 出现横向打印
                            //alert(table.offsetWidth);
                            var dsize = (table.offsetWidth - table.offsetHeight) / 2;
                            var dsize2 = 0 - dsize;
                            var matrix = "matrix(0,-1,1,0," + dsize2 + "," + dsize + ")";
                            table.style.transform = matrix;
                            table.style.filter = "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)";
                            if (table.style.setAttribute) {
                                table.style.setAttribute("-webkit-transform", matrix);
                                table.style.setAttribute("-moz-transform", matrix);
                                table.style.setAttribute("-o-transform", matrix);
                                table.style.setAttribute("-ms-transform", matrix);
                                table.style.setAttribute("-webkit-transform", matrix);
                            }
                            else if (table.style.setProperty) {
                                table.style.setProperty("-webkit-transform", matrix);
                                table.style.setProperty("-moz-transform", matrix);
                                table.style.setProperty("-o-transform", matrix);
                                table.style.setProperty("-ms-transform", matrix);
                                table.style.setProperty("-webkit-transform", matrix);
                            }
                            if (table.parentNode.nodeName == "DIV") {
                                table.parentNode.style.width = table.offsetHeight;
                                table.parentNode.style.height = table.offsetWidth;
                            }
                            table.parentNode.style.overflow = "hidden";
                        }
                    } //if
                } //for
            }
        }
    }
};

// 处理JumpPrintMode命令
WriterCommandModuleFile.JumpPrintModeCommand = function (parameter) {
    if (parameter === true) {
        this.SetJumpPrintMode(true);
    }
    else if (parameter === false) {
        this.SetJumpPrintMode(false);
    }
    else {
        this.SetJumpPrintMode(!this.IsJumpPrintMode());
    }
};

// 设置是否启用续打模式
WriterCommandModuleFile.SetJumpPrintMode = function (jumpPrintMode) {
    var maskDiv = document.getElementById("divJumpPrintMask");
    if (maskDiv == null) {
        maskDiv = document.createElement("div");
        maskDiv.id = "divJumpPrintMask";
        maskDiv.style.position = "absolute";
        maskDiv.style.backgroundColor = "blue";
        maskDiv.style.opacity = "0.4";
        maskDiv.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=40)";
        //maskDiv.style.borderBottom = "1px solid black";
        maskDiv.style.display = "none";
        maskDiv.style.zIndex = "11000";
        maskDiv.style.left = "0px";
        maskDiv.style.top = "0px";
        maskDiv.style.width = "100%";
        //maskDiv.setAttribute("style", "position:absolute;background-color:blue;opacity:0.4;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=40);border-bottom:2px solid black;display:none;z-index:11000;width:100%;left:0px;top:0px");
        document.body.insertBefore(maskDiv, document.body.firstChild);
    }
    //wyc20200714:新增续打结束位置掩盖区域
    var lastjumpmaskDiv = document.getElementById("divLastJumpPrintMask");
    if (lastjumpmaskDiv == null) {
        lastjumpmaskDiv = document.createElement("div");
        lastjumpmaskDiv.id = "divLastJumpPrintMask";
        lastjumpmaskDiv.style.position = "absolute";
        lastjumpmaskDiv.style.backgroundColor = "blue";
        lastjumpmaskDiv.style.opacity = "0.4";
        lastjumpmaskDiv.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=40)";
        //maskDiv.style.borderBottom = "1px solid black";
        lastjumpmaskDiv.style.display = "none";
        lastjumpmaskDiv.style.zIndex = "11000";
        lastjumpmaskDiv.style.left = "0px";
        lastjumpmaskDiv.style.top = document.body.style.bottom;
        lastjumpmaskDiv.style.bottom = document.body.bottom;
        lastjumpmaskDiv.style.height = "0px";
        lastjumpmaskDiv.style.width = "100%";
        //maskDiv.setAttribute("style", "position:absolute;background-color:blue;opacity:0.4;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=40);border-bottom:2px solid black;display:none;z-index:11000;width:100%;left:0px;top:0px");
        document.body.insertBefore(lastjumpmaskDiv, document.body.firstChild);
    }
    if (jumpPrintMode) {
        // 处于续打模式
        maskDiv.style.display = "";
        lastjumpmaskDiv.style.display = "";
    }
    else {
        // 不处于续打模式
        maskDiv.style.display = "none";
        lastjumpmaskDiv.style.display = "none";
    }
};

// 判断当前是否为续打模式
WriterCommandModuleFile.IsJumpPrintMode = function () {
    var maskDiv = document.getElementById("divJumpPrintMask");
    if (maskDiv != null) {
        if (maskDiv.style.display != "none") {
            return true;
        }
    }
    return false;
};

// 为续打模式处理鼠标点击事件
WriterCommandModuleFile.HandleMouseClickForJumpPrintMode = function (eve) {
    if (WriterCommandModuleFile.IsJumpPrintMode() == false) {
        // 不处于续打模式，不处理事件
        return false;
    }
    if (eve == null) {
        eve = window.event;
    }
    if (eve == null) {
        return false;
    }

    if (eve.ctrlKey && eve.ctrlKey == true) {
        //先封锁设置结束打印位置的功能，实际遮盖效果始终有问题，以后再慢慢搞
        //var lastjumpmaskDiv = document.getElementById("divLastJumpPrintMask");
        //lastjumpmaskDiv.style.display = "none";
        //var h = eve.clientY + document.body.scrollTop;
        //lastjumpmaskDiv.style.display = "";
        //lastjumpmaskDiv.style.top = h + "px";
        //lastjumpmaskDiv.style.height = document.body.scrollTop + document.body.scrollHeight - h;
    } else {
        var maskDiv = document.getElementById("divJumpPrintMask");
        maskDiv.style.display = "none";
        //    var targetElement = document.elementFromPoint(eve.clientX, eve.clientY);
        //    if (targetElement != null) {
        //        //alert(targetElement.outerHTML);
        //        var h = DCDomTools.GetViewTopInDocument(targetElement) - 1 ;
        //        maskDiv.style.display = "";
        //        maskDiv.style.height = h + "px";
        //    
        //    }
        var h = eve.clientY + document.body.scrollTop;
        maskDiv.style.display = "";
        maskDiv.style.height = h + "px";
    }
    return true;
};

//设置续打位置
WriterCommandModuleFile.SetJumpPrintPosition = function (position, endposition) {
    var maskDiv = document.getElementById("divJumpPrintMask");
    if (maskDiv == null) {
        maskDiv = document.createElement("div");
        maskDiv.id = "divJumpPrintMask";
        maskDiv.style.position = "absolute";
        maskDiv.style.backgroundColor = "blue";
        maskDiv.style.opacity = "0.4";
        maskDiv.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=40)";
        //maskDiv.style.borderBottom = "1px solid black";
        maskDiv.style.display = "none";
        maskDiv.style.zIndex = "11000";
        maskDiv.style.left = "0px";
        maskDiv.style.top = "0px";
        maskDiv.style.width = "100%";
        //maskDiv.setAttribute("style", "position:absolute;background-color:blue;opacity:0.4;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=40);border-bottom:2px solid black;display:none;z-index:11000;width:100%;left:0px;top:0px");
        document.body.insertBefore(maskDiv, document.body.firstChild);
    }

    //wyc20200714:新增续打结束位置掩盖区域
    var lastjumpmaskDiv = document.getElementById("divLastJumpPrintMask");
    if (lastjumpmaskDiv == null) {
        lastjumpmaskDiv = document.createElement("div");
        lastjumpmaskDiv.id = "divLastJumpPrintMask";
        lastjumpmaskDiv.style.position = "absolute";
        lastjumpmaskDiv.style.backgroundColor = "blue";
        lastjumpmaskDiv.style.opacity = "0.4";
        lastjumpmaskDiv.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=40)";
        //maskDiv.style.borderBottom = "1px solid black";
        lastjumpmaskDiv.style.display = "none";
        lastjumpmaskDiv.style.zIndex = "11000";
        lastjumpmaskDiv.style.left = "0px";
        lastjumpmaskDiv.style.top = document.body.style.bottom;
        lastjumpmaskDiv.style.bottom = document.body.style.bottom;
        lastjumpmaskDiv.style.height = "0px";
        lastjumpmaskDiv.style.width = "100%";
        //maskDiv.setAttribute("style", "position:absolute;background-color:blue;opacity:0.4;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=40);border-bottom:2px solid black;display:none;z-index:11000;width:100%;left:0px;top:0px");
        document.body.insertBefore(lastjumpmaskDiv, document.body.firstChild);
    }

    //maskDiv.style.display = "none";
    //var h = eve.clientY + document.body.scrollTop;
    //maskDiv.style.display = "";
    maskDiv.style.height = position + "px";
    if (endposition != null && endposition > position) {
        lastjumpmaskDiv.style.top = endposition + "px";
    }

    return true;
};