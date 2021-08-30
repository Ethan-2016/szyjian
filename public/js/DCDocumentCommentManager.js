
//**************************************************************************************************
//**************************************************************************************************
// 文档批注处理模块 袁永福到此一游
//**************************************************************************************************
//**************************************************************************************************

var DCDocumentCommentManager = new Object();
// 获得文档中被选中的文本节点数组


//***********************************************************************************
// 根据文档插入点位置来设置当前文档批注
DCDocumentCommentManager.NewComment = function (options) {
    if (options == null) {
        return false;
    }

    var userInfo = null;
    if (document.WriterControl != null) {
        userInfo = document.WriterControl.UserInfo;
    }

    var txtNodes = DCDomTools.GetSelectionNodes(true);
    
    var bkcolor = options.BackgroundColor;
    if (bkcolor == null) {
        bkcolor = "#FFDFDF";
    }
    if (txtNodes.length > 0) {
        for (var iCount = 0; iCount < txtNodes.length; iCount++) {
            var txtNode = txtNodes[iCount];
            if (txtNode.nodeType != 3) {
                continue;
            }
            if (txtNode.parentNode.getAttribute("dcignore") == "1") {
                continue;
            }
            var span = document.createElement("span");
            span.setAttribute("dctype", "DocumentComment");
            span.setAttribute("commenttext", options.Text);
            // 设置用户姓名
            if (userInfo != null && userInfo.UserName != null) {
                span.setAttribute("commentauthor", userInfo.UserName);
            }
            else if (options != null && options.UserName != null) {
                span.setAttribute("commentauthor", options.UserName);
            }
            else {
                span.setAttribute("commentauthor", "dcwriter");
            }
            // 设置用户编号
            if (userInfo != null && userInfo.UserName != null) {
                span.setAttribute("commentauthorid", userInfo.UserID);
            }
            else if (options != null && options.UserName != null) {
                span.setAttribute("commentauthorid", options.UserID);
            }
            else {
                span.setAttribute("commentauthorid", "dcwriter");
            }
            var dtm = new Date();
            var strDtm = dtm.getFullYear() + "-" + (dtm.getMonth() + 1) + "-" + dtm.getDate() + " " + dtm.getHours() + ":" + dtm.getMinutes() + ":" + dtm.getSeconds();
            span.setAttribute("commentcreationtime", strDtm);
            if (userInfo != null && userInfo.UserName != null) {
                span.title = userInfo.UserName + " " + strDtm + "\r\n" + options.Text;
            }
            else if (options != null && options.UserName != null) {
                span.title = options.UserName + " " + strDtm + "\r\n" + options.Text;
            }
            else {
                span.title = strDtm + "\r\n" + options.Text;
            }
            span.style.backgroundColor = bkcolor;
            span.setAttribute("combk", bkcolor);
            span.setAttribute("combk2", bkcolor);
            var p = txtNode.parentNode;
            p.insertBefore(span, txtNode);
            span.appendChild(txtNode);
            DCUndoRedo.RaiseChanged();
        }
    }
    return false;
};

// 激活当前元素使用的文档批注
DCDocumentCommentManager.ActiveCurrentComment = function (srcElement) {
    //if (DCDropdownControlManager.isDropdownControlVisible()) {
    //    return null;
    //}
    if (DCDocumentCommentManager.DisabledTick != null) {
        var tick = new Date().valueOf();
        if (tick < DCDocumentCommentManager.DisabledTick) {
            return;
        }
        else {
            DCDocumentCommentManager.DisabledTick = null;
        }
    }
    var element = srcElement;
    if (element == null) {
        element = DCWriterControllerEditor.CurrentElement();
    }
    if (element == null) {
        return null;
    }
    if (DCDropdownControlManager.IsInDropdownControl(element) == true) {
        return null;
    }
    while (element != null) {
        if (element.nodeName == "SPAN" && element.getAttribute("dctype") == "DocumentComment") {
            //element.style.backgroundColor = element.getAttribute("combk");
            var contentHtml = element.getAttribute("commenttext");
            //contentHtml = contentHtml.replace(/\r/g, "");
            //contentHtml = contentHtml.replace(/\n/g, "<br/>");
            //添加事件 实现批注编辑界面自定义 2019-06-13 hulijun
            var eventObj = {
                "Title":"",
                "CommentText": contentHtml,
                "CommentAuthor": element.getAttribute("commentauthor"),
                "CommentCreationTime": element.getAttribute("commentcreationtime"),
                "Html": "",
                "Width":"",
                "Height": "",
                "BackgroundColor": ""
            };
            DCWriterControllerEditor.executeWriterControlEventHandler(eventObj, "EventBeforeActiveComment");
            var html = "";
            var div = DCDropdownControlManager.GetDropdownContainer();
            div.specifyType = "comment";
            if (eventObj.Html) {
                div.style.width = eventObj.Width;
                div.style.height = eventObj.Height;
                div.style.backgroundColor = eventObj.BackgroundColor;

                html = "<div ><b id='bCT20190329'>"
                + eventObj.Title//DCDocumentCommentManager.getRuntimeTitle(element)
                + "</b>"
                + eventObj.Html
                + "</div> ";
            } else {
                div.style.width = "350px";
                div.style.height = "";
                div.style.backgroundColor = element.getAttribute("combk2");

                html = "<div ><b id='bCT20190329'>"
                + DCDocumentCommentManager.getRuntimeTitle(element)
                + "</b>&nbsp;<a href='#' onclick='DCDocumentCommentManager.EditComment();'>[编辑]</a>|"
                + "<a href = '#' onclick = 'DCDocumentCommentManager.DeleteComment(this);' >[删除]</a>|"
                + "<a href = '#' onclick = 'DCDocumentCommentManager.HideComment(this);' >[隐藏]</a> "
                + "<hr style='height:1px' color='black' size='1' >"
                + "<textarea readonly id='divCT20190329' style='width:100%;background-color:lightgray;overflow:hidden' onclick='' >"
                + contentHtml
                + "</textarea></div> ";
            }
            html = $(html);
            html = html[0];
            html.currentElement = element;
            
            if (DCDropdownControlManager.ShowDropdownControl(element, html) != null) {
                element.titleback = element.title;
                element.title = "";
                div.beforeCloseOnce = function () {
                    if (element.getAttribute("dctype") == "DocumentComment") {
                        element.title = element.titleback;
                        var div = document.getElementById("divCT20190329");
                        if (div != null && div.readOnly == false) {
                            //// 修正一些换行元素。
                            //for (var iCount = div.childNodes.length - 1; iCount >= 0; iCount--) {
                            //    var node = div.childNodes[iCount];
                            //    if (node.nodeName == "DIV"
                            //        && node.childNodes.length == 1
                            //        && node.firstChild.nodeName == "BR") {
                            //        div.insertBefore(node.firstChild, node);
                            //        div.removeChild(node);
                            //    }
                            //}
                            //if (div.lastChild != null && div.lastChild.nodeName == "BR") {
                            //    div.removeChild(div.lastChild);
                            //}
                            var txt = div.value;
                            var oldText = element.getAttribute("commenttext");
                            if (txt != oldText) {
                                // 内容发生变化
                                element.setAttribute("commenttext", txt);
                                element.title = document.getElementById("bCT20190329").innerText + "\r\n" + txt;
                                DCUndoRedo.RaiseChanged();
                            }
                        }
                    }
                };

                var txtBox = document.getElementById("divCT20190329");
                if (txtBox != null) {
                    txtBox.style.height = (txtBox.scrollHeight) + "px";
                    txtBox.style.backgroundColor = div.style.backgroundColor;
                    txtBox.style.border = "none";
                }
                DCDropdownControlManager.UpdateDropdownControlPosition(element);
                DCDropdownControlManager.StableDropdownControl(100);
                div.currentElement = null;
                if (element.focus) {
                    element.focus();
                }
                if (element.active) {
                    element.active();
                }
                return element;
            }
            else {
                return null;
            }
        }
        element = element.parentNode;
    }
    DCDropdownControlManager.CloseDropdownControl("comment");
    return null;
};

// 编辑文档批注
DCDocumentCommentManager.EditComment = function (element) {
    var div = document.getElementById("divCT20190329");
    if (div != null) {
        div.readOnly = false;
        div.style.cursor = "text";
        div.style.backgroundColor = "white";
        if (div.focus) {
            div.focus();
        }
        if (div.select) {
            div.select();
        }
        div.onkeypress = function () {
            this.style.height = (this.scrollHeight) + "px";
        };
        //div.style.overflow = "auto";
    }

};

// 删除当前文档批注
DCDocumentCommentManager.DeleteComment = function (element) {
    var element = element.parentNode.currentElement;
    if (element != null
        && element.nodeName == "SPAN"
        && element.getAttribute("dctype") == "DocumentComment") {
        element.removeAttribute("dctype");
        element.removeAttribute("refcommentindex");
        element.removeAttribute("title");
        element.removeAttribute("commenttext");
        element.removeAttribute("commentauthor");
        element.removeAttribute("commentcreationtime");
        element.removeAttribute("combk");
        element.removeAttribute("combk2");
        element.removeAttribute("style");
        DCDropdownControlManager.CloseDropdownControl();
        DCUndoRedo.RaiseChanged();
        return true;
    }
    return false;
};
// 隐藏当前文档批注
DCDocumentCommentManager.HideComment = function (element) {
    var div = DCDropdownControlManager.GetDropdownContainer();
    if (div != null) {
        var bolChanged = (txtBox != null && txt.readOnly == false);
        var txtBox = document.getElementById("divCT20190329");
        DCDropdownControlManager.CloseDropdownControl();
        if (bolChanged == true) {
            DCUndoRedo.RaiseChanged();
        }
    }
    DCDocumentCommentManager.DisabledTick = new Date().valueOf() + 1000;
};


// 获得文档批注运行时的标题
DCDocumentCommentManager.getRuntimeTitle = function (element) {
    var result = element.getAttribute("commenttitle");
    if (result == null || result.length == 0) {
        result = element.getAttribute("commentauthor") + "-" + element.getAttribute("commentcreationtime");
    }
    return result;
};

//// 执行文档批注的排版
//DCDocumentCommentManager.LayoutDocumentComment = function () {
//    var container = DCDocumentCommentManager.rootContainer;
//    if (container == null) {
//        return;
//    }
//    if (container.childNodes.length == 0) {
//        return;
//    }
//    var divAllContainer = DCWriterControllerEditor.getdivAllContainer();
//    var textList = document.getElementsByTagName("SPAN");
//    var targetNodes = new Array();
//    for (var iCount = 0; iCount < textList.length; iCount++) {
//        var node = textList[iCount];
//        if (node.getAttribute("refcommentindex") != null) {
//            targetNodes.push(node);
//        }
//    }
//    if (targetNodes.length == 0) {
//        // 没有引用到任何节点,删除所有批注
//        DCDomTools.RemoveAllChildNodes(container);
//        return;
//    }
//    var topFix = DCDomTools.GetViewTopInDocument(container);
//    for (var iCount = 0; iCount < container.childNodes.length; iCount++) {
//        var node = container.childNodes[iCount];
//        if (node.nodeName && node.nodeName == "DIV") {
//            var index = node.getAttribute("commentindex");
//            for (var iCount2 = 0; iCount2 < targetNodes.length; iCount2++) {
//                var targeNode = targetNodes[iCount2];
//                if (targeNode.getAttribute("refcommentindex") == index) {
//                    var top = DCDomTools.GetViewTopInDocument(targeNode) - topFix - 4;
//                    node.style.position = "relative";
//                    node.style.top = top + "px";
//                    node.targetElement = targeNode;
//                    topFix = topFix + node.offsetHeight;
//                    break;
//                }
//            } //for
//        } //if
//    } //for
//    DCDocumentCommentManager.SetCurrentDocumentCommentBySelection();
//};


////***********************************************************************************
//// 根据文档插入点位置来设置当前文档批注
//DCDocumentCommentManager.SetCurrentDocumentCommentBySelection = function () {
//    var container = DCDocumentCommentManager.rootContainer;
//    if (container == null) {
//        return;
//    }
//    var sel = DCSelectionManager.getSelection();
//    if (sel != null && sel.startContainer != null) {
//        var node = sel.startContainer;
//        while (node != null) {
//            if (node.getAttribute) {
//                var index = node.getAttribute("refcommentindex");
//                if (index != null && index.length > 0) {
//                    for (var iCount = 0; iCount < container.childNodes.length; iCount++) {
//                        var node = container.childNodes[iCount];
//                        if (node.nodeName && node.nodeName == "DIV") {
//                            if (node.getAttribute("commentindex") == index) {
//                                DCDocumentCommentManager.ActiveDocumentComment(null, node, false);
//                                return true;
//                            }
//                        }
//                    } //for
//                    break;
//                } //if
//            } //if
//            if (node == container) {
//                return true;
//            }
//            node = node.parentNode;
//        } //while
//    } //if
//    DCDocumentCommentManager.ActiveDocumentComment(null, null, false);
//    return false;
//};

////*****************************************************************************************
//// 激活文档批注
//DCDocumentCommentManager.ActiveDocumentComment = function (eventObject, element, autoFocus) {
//    if (eventObject != null && eventObject.type == "click") {
//        eventObject.cancelBubble = true;
//    }

//    if (DCDocumentCommentManager.currentDocumentComment == element) {
//        return;
//    }
//    if (DCDocumentCommentManager.currentDocumentComment != null) {
//        var e2 = DCDocumentCommentManager.currentDocumentComment;
//        e2.style.opacity = "0.6";
//        e2.style.borderWidth = "1px";
//        var targetElement = e2.targetElement;
//        if (targetElement != null) {
//            targetElement.style.backgroundColor = targetElement.getAttribute("bkcolor2");
//        }
//    }
//    DCDocumentCommentManager.currentDocumentComment = element;
//    if (element != null) {
//        element.style.opacity = "1.0";
//        element.style.borderWidth = "2px";
//        var targetElement = element.targetElement;
//        if (targetElement != null) {
//            targetElement.setAttribute("bkcolor2", targetElement.style.backgroundColor);
//            targetElement.style.backgroundColor = element.style.backgroundColor;
//        }
//        if (autoFocus) {
//            var index = element.getAttribute("commentindex");
//            var contentNode = document.getElementById("dcmcontent" + index);
//            if (contentNode != null) {
//                DCDomTools.MoveCaretTo(contentNode);
//            }
//        }
//    }
//};

//***********************************************************************************
// 启动文档批注运维模块
DCDocumentCommentManager.Start = function () {
    DCDocumentCommentManager.rootContainer = document.getElementById("dcmContainer");
    // 执行一次排版操作
    //DCDocumentCommentManager.LayoutDocumentComment();
    // 每1000毫秒执行一次文档批注排版工作
    //window.setInterval(DCDocumentCommentManager.LayoutDocumentComment, 1000);
};