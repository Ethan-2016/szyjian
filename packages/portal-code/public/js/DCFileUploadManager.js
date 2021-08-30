
//***********************************************************************************
//***********************************************************************************
// 文件上传处理模块 袁永福到此一游
//***********************************************************************************
//***********************************************************************************
var DCFileUploadManager = new Object();

Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

DCFileUploadManager.InsertSignImage = function (obj) {
    var imgWidth = obj.width;
    var imgHeight = obj.height;
    var result = new Array();
    var firstImage = null;
    var imgElement = null;

    var imgElement = document.createElement("img");
    imgElement.id = obj.id;
    //imgElement.setAttribute("style", "border:1px solid black");
    var container = DCWriterControllerEditor.CurrentElement();
    if (container != null) {
        // 根据插入点位置计算图片的合适高度
        var pNode = container.parentNode;
        while (pNode != null) {
            if (pNode.nodeName == "TD" || pNode.nodeName == "DIV") {
                var newWidth = Math.min(imgWidth, DCDomTools.GetClientWidth(pNode) - 2);
                if (newWidth != imgWidth && newWidth > 0) {
                    imgHeight = imgHeight * newWidth / imgWidth;
                    imgWidth = newWidth;
                }
                break;
            }
            pNode = pNode.parentNode;
        }
    }
    var time = new Date().format("yyyy-MM-dd hh:mm:ss");

    imgElement.setAttribute("dc_signuserid", obj.userID);
    imgElement.setAttribute("dc_signusername", obj.userName);
    imgElement.setAttribute("dc_signclientname", obj.clientName);
    imgElement.setAttribute("dc_signtime", time);
    imgElement.setAttribute("dc_signrange", obj.scope);

    imgElement.setAttribute("dc_imageinfrontoftext", obj.imageInFrontOfText);
    imgElement.setAttribute("dc_bstrpfx", obj.bstrpfx);
    imgElement.setAttribute("dc_bstrpwd", obj.bstrpwd); 
    imgElement.setAttribute("dc_signprovidername", obj.providerName);
    imgElement.setAttribute("align", "bottom"); 
    imgElement.setAttribute("dctype", "XTextSignImageElement");
    imgElement.setAttribute("width", imgWidth + "px");
    imgElement.setAttribute("height", imgHeight + "px");
    imgElement.style.width = imgWidth + "px";
    imgElement.style.height = imgHeight + "px";
    imgElement.src = "data:image/png;base64," + obj.base64Img;
    imgElement.title = "ID:" + obj.userID + "\n"+
                       "Name:" + obj.userName + "\n" +
                       "Time:" + time;
    if (imgElement != null) {
        DCWriterControllerEditor.InsertElementAtCurentPosition(imgElement, false);
    }
    return result;
}

DCFileUploadManager.DomFixSignImage = function(){
    $("img[dctype='XTextSignImageElement'][dca_state='Invalidate'] ").each(function () {
        var span = $("<span dcignore='1' contenteditable='false'>签名失效</span>");
        span.css({ "border": "1px solid #000", "background-color": "yellow", "color": "red", "font-size": "12px", "position": "absolute", "left": "50%", "top": "50%", "transform": "translateX(-50%) translateY(-50%)" });
        $(this).wrap("<span></span>").after(span);
        $(this).parent().css({ "position": "relative", "display": "inline-block" })
    })
}

DCFileUploadManager.InsertImageByJsonText = function (jsonText) {
    //debugger;
    var placeHolder = document.getElementById(DCFileUploadManager.currentPalceHolderElementID);
    var result = new Array();
    var jsonData = null;
    var firstImage = null;
    var item = null;
    var imgElement = null;

    if (placeHolder != null) {
        var $placeHoler = $(placeHolder);
        if ($.type(jsonText) == "array") {
            jsonData = jsonText;
        } else if ($.type(jsonText) == "string") {
            jsonData = $.parseJSON(jsonText);
        }
        firstImage = null;
        for (var iCount = 0; iCount < jsonData.length; iCount++) {
            item = jsonData[iCount];
            //BSDCWRIT-43 hulijun 20201202
            var id = "img" + Math.random();
            if (item.id && item.id.length > 0) {
                id = item.id;
            }
            imgElement = DCFileUploadManager.InnerCreateImageElement(id, item.src, placeHolder.parentNode, item.width, item.height);
            if (imgElement != null) {
                $placeHoler.after(imgElement);
                firstImage = imgElement;
                result.push(imgElement);
            }
        }
        $placeHoler.remove();
        if (firstImage != null) {
            // DCDomTools.MoveCaretTo(firstImage);
            DCDomTools.MoveCaretToIndex(firstImage, 0);
        }
    }
    else {
        if ($.type(jsonText) == "array") {
            jsonData = jsonText;
        } else if ($.type(jsonText) == "string") {
            jsonData = $.parseJSON(jsonText);
        }
        firstImage = null;
        for (var iCount2 = 0; iCount2 < jsonData.length; iCount2++) {
            item = jsonData[iCount2];
            //BSDCWRIT-43 hulijun 20201202
            var id = "img" + Math.random();
            if (item.id && item.id.length > 0) {
                id = item.id;
            }
            imgElement = DCFileUploadManager.InnerCreateImageElement(id, item.src, null , item.width, item.height);
            if (imgElement != null) {
                DCWriterControllerEditor.InsertElementAtCurentPosition(imgElement, true);
                firstImage = imgElement;
                result.push(imgElement);
            }
        }
        if (firstImage != null) {
            // DCDomTools.MoveCaretTo(firstImage);
            DCDomTools.MoveCaretToIndex(firstImage, 0);
        }
    }
    return result;
};

window.InsertImageByJsonText = DCFileUploadManager.InsertImageByJsonText;

DCFileUploadManager.QueryState = function (id) {
    var replaceElement = document.getElementById(id);
    if (replaceElement == null) {
        return;
    }
    var url = replaceElement.getAttribute("queryurl");
    var func = function (responseText, httpOK) {
        var deleteElement = false;
        if (httpOK == false || responseText == null || responseText.length == 0 || responseText.indexOf("none") == 0) {
            // 查询操作失败,删除占位元素
            var parentNode = replaceElement.parentNode;
            var focusNode = replaceElement.previousSibling;
            if (focusNode == null) {
                focusNode = replaceElement.nextSibling;
            }
            if (focusNode == null) {
                focusNode = parentNode;
            }
            parentNode.removeChild(replaceElement);
            // DCDomTools.MoveCaretTo(focusNode);
            DCDomTools.MoveCaretToIndex(focusNode, 0);
            return;
        }
        if (responseText.indexOf("ok") == 0) {
            // 上传完毕,删除占位元素，插入图片
            var resultItems = responseText.split(":");
            // 计算图片的初始化大小
            var imgWidth = 200;
            var imgHeight = 200;
            if (resultItems.length >= 3) {
                imgWidth = parseInt(resultItems[1]);
                if (isNaN(imgWidth) == true) {
                    imgWidth = 200;
                }
                imgHeight = parseInt(resultItems[2]);
                if (isNaN(imgHeight) == true) {
                    imgHeight = 200;
                }
            }
            // 创建图片元素对象
            var pNode = replaceElement.parentNode;
            var imgID = replaceElement.getAttribute("imgid");
            var imgElement = DCFileUploadManager.InnerCreateImageElement(
                imgID,
                DCFileUploadManager.servicePageURL + "?getdcwriterbufferedimage=" + imgID,
                pNode,
                imgWidth,
                imgHeight);
            if (imgElement != null) {
                pNode.replaceChild(imgElement, replaceElement);
                // DCDomTools.MoveCaretTo(imgElement);
                DCDomTools.MoveCaretToIndex(imgElement, 0);
            }
            return;
        }
        DCDomTools.SetInnerText(replaceElement, responseText);
        window.setTimeout("DCFileUploadManager.QueryState('" + id + "')", 1000);
    };
    var result = DCDomTools.GetContentByUrl(url, false, func);
};

//***********************************************************************************
// 创建图片元素
// 参数 src:图片来源
//      container :容纳图片的容器元素对象
//      imgWidth:指定的图片宽度
//      imgHeight:指定的图片高度
DCFileUploadManager.InnerCreateImageElement = function (id, src, container, imgWidth, imgHeight) {
    var imgElement = document.createElement("img");
    imgElement.id = id;
    //imgElement.setAttribute("style", "border:1px solid black");
    if (container == null) {
        container = DCWriterControllerEditor.CurrentElement();
    }
    if (container != null) {
        // 根据插入点位置计算图片的合适高度
        var pNode = container.parentNode;
        while (pNode != null) {
            if (pNode.nodeName == "TD" || pNode.nodeName == "DIV" ) {
                var newWidth = Math.min(imgWidth, DCDomTools.GetClientWidth(pNode) - 2);
                if (newWidth != imgWidth && newWidth > 0) {
                    imgHeight = imgHeight * newWidth / imgWidth;
                    imgWidth = newWidth;
                }
                break;
            }
            pNode = pNode.parentNode;
        }
    }
    imgElement.setAttribute("width", imgWidth + "px");
    imgElement.setAttribute("height", imgHeight + "px");
    imgElement.style.width = imgWidth + "px";
    imgElement.style.height = imgHeight + "px";
    imgElement.src = src;
    return imgElement;
};

//**************************************************************************************
// 采用直接模式执行插入图片命令
DCFileUploadManager.InsertImageDirect = function (cmdArgs) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextImageElement") == false) {
        if (cmdArgs) {
            //alert(document.GetDCWriterString("JS_CannotInsertImageAtCurrentPosition"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_CannotInsertImageAtCurrentPosition");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return;
    }
    if (cmdArgs.ShowUI == false && cmdArgs.Parameter != null) {
        // 用户指定图片来源
        var src = cmdArgs.Parameter.toString().toLowerCase();
        if (src.indexOf("http://") != 0) {
            // 必须采用"http://"全路径名，否则不插入
            return null;
        }
        src = cmdArgs.Parameter.toString();
        var sel = DCSelectionManager.LastSelectionInfo;
        if (sel == null) {
            sel = DCSelectionManager.getSelection();
        }
        if (sel.currentContainer != null) {
            var imgElement = DCFileUploadManager.InnerCreateImageElement(
                src,
                src,
                sel.currentContainer,
                200,
                200);
            if (imgElement != null) {
                if (DCWriterControllerEditor.InsertElementAtCurentPosition(imgElement, true) == true) {
                    return imgElement;
                }
            }
        }
        return null;
    }
    if ( DCWriterControllerEditor.isSessionTimeout() == false ) {
        //alert(document.GetDCWriterString("JS_CannotInsertImageForSessionTimeout"));
        if (document.WriterControl) {
            var eventObject = new Object();
            eventObject.Message = document.GetDCWriterString("JS_CannotInsertImageForSessionTimeout");
            eventObject.State = document.WriterControl.ErrorInfo.Error;
            document.WriterControl.MessageHandler(eventObject);
        }
        return;
    }
    DCFileUploadManager.servicePageURL = document.body.getAttribute("servicepageurl");
    var url = DCFileUploadManager.servicePageURL + "?dcwriteruploadfile=1";
    var args = new Object();
    var imgID = "img" + new Date().valueOf();
    imgID = imgID.replace("0.", "");
    var rootWriterControl = document.WriterControl;
    if (rootWriterControl != null) {
        var frameElement = rootWriterControl.ShowMaskDialog(null, null);
        frameElement.fileID = imgID;
        frameElement.accept = "image/png,image/gif,image/jpeg,image/bmp";
        // 取消操作回调函数
        frameElement.cancelCallback = function () { rootWriterControl.CloseMaskDialog(); };
        // 提交操作回调函数
        frameElement.okCallback = function () {
            rootWriterControl.CloseMaskDialog();
            DCFileUploadManager.UploadImageCallback();
        };
        frameElement.src = url;
    }
    return null;
};

//**************************************************************************************
// 选择上传图片后的回调函数
DCFileUploadManager.UploadImageCallback = function (imgID) {
    DCFileUploadManager.currentPalceHolderElementID = "divUploadImage" + imgID;
    var div = document.createElement("span");
    div.setAttribute("style", "border:1px solid black;cursor:wait;background-color:yellow;font-size:11pt;border-radius:2px;");
    div.id = DCFileUploadManager.currentPalceHolderElementID;
    div.setAttribute("dcignore", "1");
    div.setAttribute("unselectable", "on");
    div.setAttribute("contenteditable", "false");
    div.setAttribute("imgid", imgID);
    div.setAttribute("queryurl", DCFileUploadManager.servicePageURL + "?dcwriterqueryuploadprogress=" + imgID);
    div.appendChild(document.createTextNode(document.GetDCWriterString("JS_UploadingImage")));
    if (DCWriterControllerEditor.InsertElementAtCurentPosition(div, true) == true) {
        //window.setTimeout("DCFileUploadManager.QueryState('" + div.id + "')", 1000);
    }
};
 

//**************************************************************************************
// 判断能否上传图片
DCFileUploadManager.CanUploadImage = function (showUI) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextImageElement") == false) {
        if (showUI) {
            //alert(document.GetDCWriterString("JS_CannotInsertImageAtCurrentPosition"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_CannotInsertImageAtCurrentPosition");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return false;
    }
    if (DCWriterControllerEditor.isSessionTimeout() == false) {
        if (showUI) {
            //alert(document.GetDCWriterString("JS_CannotInsertImageForSessionTimeout"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_CannotInsertImageForSessionTimeout");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return false;
    }
    return true;
};

//**************************************************************************************
// 执行插入图片命令
DCFileUploadManager.InsertImage = function (cmdArgs) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextImageElement") == false) {
        if (cmdArgs.ShowUI) {
            //alert(document.GetDCWriterString("JS_CannotInsertImageAtCurrentPosition"));
            if (document.WriterControl) {
                var eventObject = new Object();
                eventObject.Message = document.GetDCWriterString("JS_CannotInsertImageAtCurrentPosition");
                eventObject.State = document.WriterControl.ErrorInfo.Error;
                document.WriterControl.MessageHandler(eventObject);
            }
        }
        return;
    }
    if (cmdArgs.ShowUI == false && cmdArgs.Parameter != null) {
        // 用户指定图片来源
        var src = cmdArgs.Parameter.toString().toLowerCase();
        if (src.indexOf("http://") != 0) {
            // 必须采用"http://"全路径名，否则不插入
            return null;
        }
        src = cmdArgs.Parameter.toString();
        var sel = DCSelectionManager.LastSelectionInfo;
        if (sel == null) {
            sel = DCSelectionManager.getSelection();
        }
        if (sel.currentContainer != null) {
            var imgElement = DCFileUploadManager.InnerCreateImageElement(
                src,
                src,
                sel.currentContainer,
                200,
                200);
            if (imgElement != null) {
                if (DCWriterControllerEditor.InsertElementAtCurentPosition(imgElement, true) == true) {
                    return imgElement;
                }
            }
        }
        return null;
    }
    //if (DCWriterControllerEditor.isSessionTimeout() == false) {
    //    alert(document.GetDCWriterString("JS_CannotInsertImageForSessionTimeout"));
    //    return;
    //}
    var url = DCFileUploadManager.servicePageURL + "?dcwriteruploadfile=1&imagemode=1";
    var args = new Object();
    var imgID = "img" + new Date().valueOf();
    imgID = imgID.replace("0.", "");
    var rootWriterControl = document.WriterControl;
    var frameElement = rootWriterControl.ShowMaskDialog(null, null);
    frameElement.fileID = imgID;
    frameElement.contentWindow.name = imgID + "&image/png,image/gif,image/jpeg,image/bmp";

    frameElement.src = url;
    url = frameElement.src;

    DCFileUploadManager.UploadImageCallback(imgID);

    RegisterCORSCallback(window, "UploadFile_Start", function () {
        // 开始上传
        var _doc = frameElement.contentWindow.document;
        var isEmpty = false;//20201009 xym 修复DCWRITER-3527
        if(_doc.getElementById("file") != null && _doc.getElementById("file").value == ""){
            isEmpty = true;
        }
        rootWriterControl.CloseMaskDialog(isEmpty);//20200910 xym 修复DCWRITER-3481
    });
    RegisterCORSCallback(window, "UploadFile_Cancel", function () {
        // 用户取消操作
        rootWriterControl.CloseMaskDialog(true);
    });
    RegisterCORSCallback(window, "UploadFile_Complete", function (jsonText) {
        // 上传结束
        rootWriterControl.CloseMaskDialog(true);
        //上传图片 光标移动到图片后 2019-06-20 xuyiming
        var result = DCFileUploadManager.InsertImageByJsonText(jsonText);
        $(result[result.length - 1]).wrap("<span></span>");
        // console.log(result[result.length - 1].parentElement);
        DCSelectionManager.focusFirstEditableArea();
        DCDomTools.MoveCaretToEnd(result[result.length - 1].parentElement);
    });
    
    function QueryState222() {
        frameElement.contentWindow.postMessage("QueryState", "*");
        if (frameElement.src != url) {
            var span = document.getElementById(DCFileUploadManager.currentPalceHolderElementID);
            if (span != null) {
                span.parentNode.removeChild(span);
            }
            return;
        }
        window.setTimeout(QueryState222, 100);
    };

    window.setTimeout(QueryState222, 100);
     
    return null;
};



//***********************************************************************************
// 启动图片上传器
DCFileUploadManager.Start = function () {
    DCFileUploadManager.servicePageURL = document.body.getAttribute("servicepageurl");
};

DCFileUploadManager.UpLoadImageFromLocalFile = function (cmdArgs) {
    //debugger;
    if (cmdArgs.ShowUI === true && cmdArgs.Parameter === null) {
        //伍贻超20190403：新增当允许弹出界面且参数为NULL时，直接弹WIN内置文件选择框并直接上传
        var urll = document.body.getAttribute("servicepageurl") + "?dcwriteruploadfile=1&imagemode=2";//这里的imagemode=2需要服务端特别处理
        var input = document.getElementById("dcwritertempinputforuploading");
        if (input === null) {
            input = document.createElement("input");
            input.id = "dcwritertempinputforuploading";
            input.type = "file";
            input.name = "file";
            input.accept = "image/gif, image/jpeg, image/bmp,, image/png";
            input.style.display = "none";
            input.onchange = function () {
                //alert('选取文件');
                var formdatas = new FormData();
                formdatas.enctype = "multipart/form-data";
                formdatas.append("file", input.files[0]);
                var xhr = new XMLHttpRequest();
                xhr.open("POST", urll, false);
                xhr.send(formdatas);
                //debugger;
                //光标移动到图片后 2019-06-12 xuyiming
                var result = DCFileUploadManager.InsertImageByJsonText(xhr.responseText);
                $(result[result.length - 1]).wrap("<span></span>");
                console.log(result[result.length - 1].parentElement);
                DCDomTools.MoveCaretToEnd(result[result.length - 1].parentElement);
                //$(result[result.length - 1]).unwrap();
                input.remove();
                return;
            };
            document.body.appendChild(input);
            input.click();
        } else {
            input.click();
        }
    }
};

//WYC20190702：设置图片元素前端浮动
DCFileUploadManager.SetImageFloating = function (cmdArgs) {
    //debugger;
    var imgelement = DCFileUploadManager.CurrentImageElement();
    if (imgelement === null) {
        return null;
    }
    
    //只接受left,right,none三种
    if (cmdArgs.Parameter === "left") {
        imgelement.setAttribute("dc_surroundings", "true");
        //imgelement.style.setAttribute("float", "left");
        imgelement.style['float'] = "left";
    } else if (cmdArgs.Parameter === "right") {
        imgelement.setAttribute("dc_surroundings", "true");
        //imgelement.style.setAttribute("float", "right");
        imgelement.style['float'] = "right";
    } else if (cmdArgs.Parameter === "none") {
        imgelement.setAttribute("dc_surroundings", "false");
        //imgelement.style.setAttribute("float", "none");
        imgelement.style['float'] = "none";
    } else {
        return null;
    }
};

//WYC20190702：获取当前选中的图片元素
DCFileUploadManager.CurrentImageElement = function () {
    //debugger;

    var sel = DCSelectionManager.getSelection();
    if (sel === null || sel.startContainer === null) {
        return null;
    }
    var node = sel.startContainer;
    if (node.nodeName === "IMG") {
        return node;
    } else if (node.nodeName === "P") {
        for (var i = 0; i < node.childNodes.length; i++) {
            var ele = node.childNodes[i];
            if (ele.nodeName === "IMG" && ele.getAttribute("dctype") === "XTextImageElement") {
                return ele;
            }
        }
    }

    //DCWriterControllerEditor.CurrentElement(function (node) {
        
    //});
    return null;
}; 