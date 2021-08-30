//***********************************************************************************
//***********************************************************************************
// 编辑器命令控制器 袁永福到此一游
//***********************************************************************************
//***********************************************************************************
var DCWriterCommandMananger = new Object();

//***********************************************************************************
// 执行编辑器命令
DCWriterCommandMananger.DCExecuteCommand = function (commandName, showUI, parameter) {
    if (document.WriterControl !== null) {
        document.WriterControl.ServerMessage = null;
    }
    if (commandName === null || commandName.length === 0) {
        return null;
    }
    // 20200225 xuyiming 修复一些接口在当前元素不可编辑情况下，也需要执行命令
    var arr = ["copy", "copyastext", "selectall", "fileopen", "fileopenbase64", "filesave", "filesaveselection", "jumpprintmode", "fileprint", "table_writedatatotable", "table_readdatafromtable", "inserttable", "deletepagebreak", "allfontname", "allfontsize", "alllineheight", "insertpagebreak", "documentvaluevalidate", "filenew"];
    if ($.inArray(commandName.toLowerCase(), arr) == -1 && DCWriterControllerEditor.CanInsertElementAtCurentPosition() == false) {
        return;//WYC20200221:若当前元素contentediable为false，则不可执行命令
    }
    //    var lcommandName = commandName.toLowerCase();
    //    if (lcommandName == "bold"
    //        || lcommandName == "italic"
    //        || lcommandName == "underline") {
    //        var result = window.uiEditor.execCommand(lcommandName, parameter);
    //        //if (result == true) 
    //        {
    //            var rng = window.uiEditor.selection.getRange();
    //            if (rng != null && rng.startContainer != null) {
    //                var styleAttributeName = null;
    //                switch (lcommandName) {
    //                    case "bold": styleAttributeName = "font-weight"; break;
    //                    case "italic": styleAttributeName = "font-style"; break;
    //                    case "underline": styleAttributeName = "text-decoration"; break;
    //                }
    //                if (styleAttributeName != null) {
    //                    rng.traversal(function (node2) {
    //                        DCDomTools.removeCssAttribute(node2, styleAttributeName, true);
    //                    });
    //                }
    //            }
    //        }
    //        return result;
    //    }

    var cmdArgs = new Object();
    cmdArgs.CommandName = commandName;
    cmdArgs.ShowUI = showUI;
    cmdArgs.Parameter = parameter;

    //符良柱 修改于2018-1-6  
    switch (commandName.toLowerCase()) {
        case "insertlabelelement":
            {
                return DCInputFieldManager.InsertLabelElement(parameter); //WYC20210121:前端插入标签元素
            }
        case "inputfieldunderline":
            {
                return WriterCommandModuleFormat.InputFieldUnderline(parameter); //WYC20210121:前端对输入域设置下划线
            }
        case "insertchartelement":
            {
                return DCChartManager.InsertChartElement(parameter); //WYC20200729:前端插入图表元素
            }
        case "allfontname":
            {
                //hulijun BSDCWRIT-34 20201127
                document.WriterControl.GlobalFontFamily = parameter;
                return WriterCommandModuleFormat.SetAllDomCss("font-family", parameter, showUI);
            }
        case "allfontsize":
            {
                //hulijun BSDCWRIT-34 20201127
                document.WriterControl.GlobalFontSize = parseFloat(parameter);
                return WriterCommandModuleFormat.SetAllDomCss("font-size", parseFloat(parameter), showUI);
            }
        case "alllineheight":
            {
                // 20210318 xym 添加设置文档的全局行高接口[DCExecuteCommand('allLineHeight', true, 2)]
                return WriterCommandModuleFormat.SetAllDomCss("line-height", parameter, showUI);
            }
        case "inserthorizontalline":
            {
                return WriterCommandModuleFile.InsertHorizontalLine(parameter);//WYC20200429:新版的插入水平线
            }
        case "table_writedatatotable":
            {
                return WriterCommandModuleTable.WriteDataToTable(parameter);//WYC20200312:将数据写入表格
            }
        case "table_readdatafromtable":
            {
                return WriterCommandModuleTable.ReadDataFromTable(parameter);//WYC20200312:从表格元素中导出数据
            }
        case "insertpageinfoelement":
            {
                return DCPageInfoManager.InsertPageInfoElement(parameter);//WYC20200302:插入页码元素
            }
        case "insertbarcodeelement":
            {
                return DCBarcodeManager.InsertBarcodeElement(parameter);//WYC20190930:插入条形码元素
            }
        case "inserttdbarcodeelement":
            {
                return DCBarcodeManager.InsertTDBarcodeElement(parameter);//WYC20190930:插入二维码元素
            }
        case "textsurroundings":
            {
                return DCFileUploadManager.SetImageFloating(cmdArgs);//WYC20190702:设置图片文档环绕
            }
            break;
        case "insertcheckboxorradio":
            {
                return DCInputFieldManager.InsertCheckboxOrRadio(showUI, parameter);
            }
            break;
        case "backcolor":
            {
                return WriterCommandModuleFormat.SetCss("background-color", parameter);
                // return DCWriterCommandMananger.SelectionExecuteCommand("BackColor", showUI, parameter);
            }
            break;
        case "insertpagebreak":
            {
                //伍贻超20190420：插入分页符
                return WriterCommandModuleFile.InsertPageBreak();
            }
            break;
        case "deletepagebreak":
            {
                //伍贻超20200423：删除当前选中的分页符
                return WriterCommandModuleFile.DeletePageBreak();
            }
            break;
        case "hangingindent":
            {
                //hangingIndent 悬挂缩进
                return WriterCommandModuleFormat.setHangingIndent({ "marginLeft": "2em", "textIndent": "-2em" });
            }
            break;
        case "deletefield":
            {
                // 删除当前输入域
                return DCInputFieldManager.DeleteField();
            }
            break;
        case "undo":
            {
                if (DCUndoRedo && DCUndoRedo.Undo) {
                    return DCUndoRedo.Undo();
                }
            }
            break;
        case "redo":
            {
                if (DCUndoRedo && DCUndoRedo.Redo) {
                    return DCUndoRedo.Redo();
                }
            }
            break;
        case "enter":
            {
                return DCInputFieldManager.enter();
            }
            break;
        case "lr":
            {
                return DCInputFieldManager.lr();
            }
            break;
        case "fontname":
            {
                return WriterCommandModuleFormat.FontName(parameter);
            }
            break;
        case "fontsize":
            {
                return WriterCommandModuleFormat.FontSize(parameter);
            }
            break;
        case "bold":
            {
                return WriterCommandModuleFormat.Bold(parameter);
            }
            break;
        case "link":
            {
                return WriterCommandModuleFormat.Link(parameter);
            }
            break;
        case "italic":
            {
                return WriterCommandModuleFormat.Italic(parameter);
            }
            break;
        case "underline":
            {
                return WriterCommandModuleFormat.Underline(parameter);
            }
            break;
        case "formatmatch":
            {
                return WriterCommandModuleFormat.Formatmatch(parameter);
            }
            break;
        case "delline":
            {
                return WriterCommandModuleFormat.DelLine(parameter);
            }
            break;
        case "strikethrough":
            {
                return WriterCommandModuleFormat.Strikethrough(parameter);
            }
            break;
        case "removefontsize":
            {
                return WriterCommandModuleFormat.RemoveFontSize();
            }
            break;
        case "removefontfamily":
            {
                return WriterCommandModuleFormat.RemoveFontFamily();
            }
            break;
        case "spechars":
            {
                return WriterCommandModuleFormat.Spechars(parameter);
            }
            break;
        case "removeformat":
            {
                return WriterCommandModuleFormat.RemoveFormat(parameter);
            }
            break;
        case "fontborder":
            {
                return WriterCommandModuleFormat.Fontborder(parameter);
            }
            break;
        case "lineheight":
            {
                return WriterCommandModuleFormat.LineHeight(parameter);
            }
            break;
        case "directionality":
            {
                return WriterCommandModuleFormat.DirectionaLity(parameter);
            }
            break;
        case "rowspacing":
            {
                return WriterCommandModuleFormat.rowspacing(parameter);
            }
            break;
        case "superscript":
            {
                return WriterCommandModuleFormat.Superscript(parameter);
            }
            break;
        case "subscript":
            {
                return WriterCommandModuleFormat.Subscript(parameter);
            }
            break;
        case "pasteplain":
            {
                return WriterCommandModuleFormat.Pasteplain(parameter);
            }
            break;
        case "inserttable":
            {
                return WriterCommandModuleTable.InsertTable("inserthtml", showUI, parameter);
            }
            break;
        case "alignbottomcenter":
            {
                return WriterCommandModuleTable.AlignBottomCenter();
            }
            break;
        case "alignbottomleft":
            {
                return WriterCommandModuleTable.AlignBottomLeft();
            }
            break;
        case "alignbottomright":
            {
                return WriterCommandModuleTable.AlignBottomRight();
            }
            break;
        case "alignmiddlecenter":
            {
                return WriterCommandModuleTable.AlignMiddleCenter();
            }
            break;
        case "alignmiddleleft":
            {
                return WriterCommandModuleTable.AlignMiddleLeft();
            }
            break;
        case "alignmiddleright":
            {
                return WriterCommandModuleTable.AlignMiddleRight();
            }
            break;
        case "aligntopcenter":
            {
                return WriterCommandModuleTable.AlignTopCenter();
            }
            break;
        case "aligntopleft":
            {
                return WriterCommandModuleTable.AlignTopLeft();
            }
            break;
        case "aligntopright":
            {
                return WriterCommandModuleTable.AlignTopRight();
            }
            break;
        case "color":
            {
                return WriterCommandModuleFormat.Color(showUI, parameter);
            }
            break;
        case "copy"://复制
            {
                return DCWriterCommandMananger.SelectionExecuteCommand("Copy", showUI, parameter);
            }
            break;
        case "cut"://剪切
            {
                return DCWriterCommandMananger.SelectionExecuteCommand("Cut", showUI, parameter);
            }
            break;
        case "paste"://粘贴（内部可用）
            {
                //xym
                return WriterCommandModuleFormat.DCPaste();
            }
            break;
        case "justifyleft":
            {
                return DCWriterCommandMananger.SelectionExecuteCommand("justifyleft", showUI, parameter);
            }
            break;
        case "justifyright":
            {
                return DCWriterCommandMananger.SelectionExecuteCommand("Justifyright", showUI, parameter);
            }
            break;
        case "justifycenter":
            {
                return DCWriterCommandMananger.SelectionExecuteCommand("justifycenter", showUI, parameter);
            }
            break;
        case "selectall":
            {
                return DCWriterCommandMananger.SelectionExecuteCommand("Selectall", showUI, parameter);
            }
            break;
        case "copyastext":
            {
                var txt = WriterCommandModuleFile.getSelectionText();
                if (window.clipboardData) {
                    window.clipboardData.setData("Text", txt);
                }
            }
            break;
        case "alignleft":
            {
                if (WriterCommandModuleFormat.AlignSingleParagraph("left") == false) {
                    //return window.uiEditor.execCommand("justify", "left");
                    return DCWriterCommandMananger.SelectionExecuteCommand("JustifyLeft", showUI, parameter);
                }
            }
            break;
        case "aligncenter":
            {
                if (WriterCommandModuleFormat.AlignSingleParagraph("center") == false) {
                    //return window.uiEditor.execCommand("justify", "center");
                    return DCWriterCommandMananger.SelectionExecuteCommand("JustifyCenter", showUI, parameter);
                }
            }
            break;
        case "alignright":
            {
                if (WriterCommandModuleFormat.AlignSingleParagraph("right") == false) {
                    //return window.uiEditor.execCommand("justify", "right");
                    return DCWriterCommandMananger.SelectionExecuteCommand("JustifyRight", showUI, parameter);
                }
            }
            break;
        case "alignjustify":
            {
                if (WriterCommandModuleFormat.AlignSingleParagraph("justify") == false) {
                    //return window.uiEditor.execCommand("justify", "justify");
                    return DCWriterCommandMananger.SelectionExecuteCommand("JustifyRight", showUI, parameter);
                }
            }
            break;
        //case "fontsize": 
        //    { 
        //        return WriterCommandModuleFormat.FontSize(parameter); 
        //    } 
        //    break; 
        //case "deletefield": 
        //    { 
        //        var result = DCInputFieldManager.DeleteField(showUI, parameter); 
        //        return result; 
        //    } 
        //    break; 
        case "insertinputfield":
            {
                return DCInputFieldManager.InsertInputField(showUI, parameter);
            }
            break;
        case "insertmedicalexpression":
            {
                return DCMedicalExpressionManager.InsertMedicalExpression(showUI, parameter);
            }
            break;
        case "dcinsertimage":
            {
                DCFileUploadManager.InsertImage(cmdArgs);
            }
            break;
        case "dcinsertimagefromlocal":
            {
                DCFileUploadManager.UpLoadImageFromLocalFile(cmdArgs);
            }
            break;
        case "documentvaluevalidate":
            {
                var result = WriterCommandModuleTools.DocumentValueValidate(showUI);
                return result;
            }
            break;
        case "filesave":
            {
                var result = WriterCommandModuleFile.FileSave(showUI, null, parameter);
                return result;
            }
            break;
        case "fileopen":
            {
                var result = WriterCommandModuleFile.FileOpen(showUI, null, parameter);
                return result;
            }
            break;
        case "fileopenbase64":
            {
                var obj = { UseBASE64: "true" };
                var result = WriterCommandModuleFile.FileOpen(showUI, null, obj);
                return result;
            }
            break;
        case "filesaveselection":
            {
                var result = WriterCommandModuleFile.FileSaveSelection(showUI, null, parameter);
                return result;
            }
            break;
        case "insertfile":
            {
                var result = WriterCommandModuleFile.InsertFile(parameter, showUI, null);
                return result;
            }
            break;
        case "insertxml":
            {
                var result = WriterCommandModuleFile.InsertXML(parameter, showUI, null);
                return result;
            }
            break;
        case "filenew":
            {
                var result = WriterCommandModuleFile.FileNew();
                return result;
            }
            break;
        case "table_deleterow":
            {
                var result = WriterCommandModuleTable.Table_DeleteRow();
                return result;
            }
            break;
        case "table_insertrowup":
            {
                var result = WriterCommandModuleTable.Table_InsertRowUp(parameter);
                return result;
            }
            break;
        case "table_insertrowdown":
            {
                var result = WriterCommandModuleTable.Table_InsertRowDown(parameter);
                return result;
            }
            break;
        case "table_insertcolumnleft":
            {
                var result = WriterCommandModuleTable.Table_InsertColumnLeft();
                return result;
            }
            break;
        case "table_insertcolumnright":
            {
                var result = WriterCommandModuleTable.Table_InsertColumnRight();
                return result;
            }
            break;
        case "table_deletecolumn":
            {
                var result = WriterCommandModuleTable.Table_DeleteColumn();
                return result;
            }
            break;
        case "table_deletetable":
            {
                var result = WriterCommandModuleTable.Table_DeleteTable();
                return result;
            }
            break;
        case "table_splitcell":
            {
                var result = WriterCommandModuleTable.Table_SplitCell();
                return result;
            }
            break;
        case "jumpprintmode":
            {
                WriterCommandModuleFile.JumpPrintModeCommand(parameter);
            }
            break;
        case "fileprint":
            {
                // 打印
                //DCWRITER-3676 hlj 20210224
                document.WriterControl.PrintDocument(parameter);
                //WriterCommandModuleFile.FilePrint(parameter);
            }
            break;
        case "pasteplain":
            {
                // 打印
                editor.queryCommandState('pasteplain')
            }
            break;
        case "inserthorizontalline":
            {
                //插入分隔符
                var cmdState = window.uiEditor.queryCommandState("pagebreak");
                if (cmdState == 0 || cmdState == 1) {
                    var result = window.uiEditor.execCommand("pagebreak", parameter);
                    return result;
                }
            }
            break;
        default:
            {
                // 执行UIEditor中的编辑命令
                var cmdState = window.uiEditor.queryCommandState(commandName);
                if (cmdState == 0 || cmdState == 1) {
                    var result = window.uiEditor.execCommand(commandName, parameter);
                    // xuyiming 20190826 解决有序、无序列表设置问题
                    if (commandName.toLowerCase() == "insertorderedlist" || commandName.toLowerCase() == "insertunorderedlist") {
                        $("ol,ul").find("li>p").each(function () {
                            var p = this.parentNode;
                            while (this.firstChild != null) {
                                p.insertBefore(this.firstChild, this);
                            }
                            p.removeChild(this);
                        })
                    }
                    return result;
                }

                for (var iCount = 0; iCount < DCWriterCommandMananger.SupporttedSelectionCommandNames.length; iCount++) {
                    var name = DCWriterCommandMananger.SupporttedSelectionCommandNames[iCount];
                    if (name.toLowerCase() == commandName.toLowerCase()) {
                        return DCWriterCommandMananger.SelectionExecuteCommand(name, showUI, parameter);
                    }
                } //for
                var msg = "";
                if (commandName == "mergeright" || commandName == "mergedown") {
                    msg = "此处无法合并";
                } else if (commandName == "splittorows" || commandName == "splittocols") {
                    msg = "此处无法拆分";
                } else {
                    msg = document.GetDCWriterString("JS_NotSupportCommand") + commandName;
                }
                if (document.WriterControl) {
                    var eventObject = new Object();
                    eventObject.Message = msg;
                    eventObject.State = document.WriterControl.ErrorInfo.Error;
                    document.WriterControl.MessageHandler(eventObject);
                }
            }
    }
    return null;

};

//***********************************************************************************
// 浏览器支持的编辑命令名称数组
DCWriterCommandMananger.SupporttedSelectionCommandNames = new Array(
    "BackColor",
    "Bold",
    "Copy",
    "Cut",
    "Delete",
    "FontName",
    "FontSize",
    "ForeColor",
    "Indent",
    "InsertHorizontalRule",
    "InsertImage",
    "InsertInputButton",
    "InsertInputCheckbox",
    "InsertInputRadio",
    "InsertInputText",
    "InsertParagraph",
    "InsertSelectDropdown",
    "InsertTextArea",
    "Italic",
    "JustifyCenter",
    "JustifyLeft",
    "JustifyRight",
    "Paste",
    "Print",
    "Redo",
    "RemoveFormat",
    "RemoveFontsize",
    "RemoveParaFormat",
    "Underline",
    "Strikethrough",
    "Fontborder",
    "Superscript",
    "Subscript",
    "Unlink",
    "Undo");

//***********************************************************************************
// 执行浏览器内置的编辑命令
DCWriterCommandMananger.SelectionExecuteCommand = function (commandName, showUI, parameter) {
    DCDomTools.FoucsDocument();
    var sel = DCWriterControllerEditor.LastSelectionInfo;
    if (sel == null) {
        sel = DCSelectionManager.getSelection();
    }
    if (sel == null || sel.startContainer == null || sel.currentContainer == null) {
        return false;
    }
    if (document.createRange) {
        var range = document.createRange();
        range.setStart(sel.startContainer, sel.startOffset);
        range.setEnd(sel.currentContainer, sel.currentOffset);
        //var sel = DCDomTools.getSelection(); 多余代码暂时移除 2015/11/12
        if (document.execCommand) {
            var result = document.execCommand(commandName, showUI, parameter);
            return result;
        }
        if (range.execCommand) {
            return range.execCommand(commandName, showUI, parameter);
        }
    }
    else if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        //解决IE7/8没有document.createRange函数执行不了命令
        range.moveStart('character', sel.startOffset);
        range.moveEnd('character', sel.currentOffset);
        if (document.execCommand) {
            var result = document.execCommand(commandName, showUI, parameter);
            DCDomTools.BubbleRaiseChanged();
            return result;
        }
        if (range.execCommand) {
            var result = range.execCommand(commandName, showUI, parameter);
            DCDomTools.BubbleRaiseChanged();
            return result;
        }

    }
    return false;
};
