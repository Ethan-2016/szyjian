
// 客户端处理医学表达式的代码
// 袁永福到此一游 2015-7-7

var DCMedicalExpressionManager = new Object();


DCMedicalExpressionManager.InsertMedicalExpression = function (showUI, options) {
    var result = null;
    if (options == null) {
        options = new Object();
    }
    var tagName = "IMG";

    result = document.createElement(tagName);
    result.setAttribute("alt", "医学表达式");
    if (options.ID != undefined && options.ID != "") {
        result.setAttribute("id", options.ID);
    };

    if (options.Type != undefined && options.Type != "") {
        result.setAttribute("dctype", options.Type);
    } else {
        result.setAttribute("dctype", "XTextNewMedicalExpressionElement");
    };

    if (options.ExpressionStyle != undefined && options.ExpressionStyle != "") {
        result.setAttribute("dc_expressionstyle", options.ExpressionStyle);
    } else {
        result.setAttribute("dc_expressionstyle", "FourValues1");
    };

    if (options.FontSize != undefined && options.FontSize != "") {
        result.setAttribute("dcfontsize", options.FontSize);
    } else {
        result.setAttribute("dcfontsize", "12");
    };

    if (options.Width != undefined && options.Width != "") {
        result.setAttribute("width", options.Width);
        result.width = parseInt(options.Width);
    } else {
        result.setAttribute("width", "112px");
        result.width = 112;
    };

    if (options.Height != undefined && options.Height != "") {
        result.setAttribute("height", options.Height);
        result.height = parseInt(options.Height);
    } else {
        result.setAttribute("height", "46px");
        result.height = 46;
    };

    if (options.Values != undefined && options.Values != "") {
        result.setAttribute("dc_values", options.Values);
        result.setAttribute("dc_innerserializetext", options.Values);
    } else {
        result.setAttribute("dc_values", "Value1:14;Value2:7;Value3:38;Value4:30");
        result.setAttribute("dc_innerserializetext", "Value1:14;Value2:7;Value3:38;Value4:30");
    };

    result.ondblclick = function (eventObject) { DCMedicalExpressionManager.ShowEditValueDialog(this); };
    if (showUI) {
        DCMedicalExpressionManager.ShowEditValueDialog(result);
    } 
    if (DCWriterControllerEditor.InsertElementAtCurentPosition(result, true) == true) {
        DCMedicalExpressionManager.UpdateImageSrc2(result);
        return result;
    } else {
        return null;
    }
}

DCMedicalExpressionManager.IsNewMedical = function (element) {
    return element.getAttribute("dctype") === "XTextNewMedicalExpressionElement";
};
DCMedicalExpressionManager.IsOldMedical = function (element) {
    return element.getAttribute("dctype") === "XTextMedicalExpressionFieldElement";
};
DCMedicalExpressionManager.IsMedicalExpressionElement = function (element) {
    if (element === null || !element.getAttribute) {
        return false;
    }
    return DCMedicalExpressionManager.IsOldMedical(element) == true || DCMedicalExpressionManager.IsNewMedical(element) == true;
};

// 获得服务器页面地址
DCMedicalExpressionManager.GetServicePageURL = function () {
    var url = document.body.getAttribute("servicepageurl");
    return url;
};


// 更新医学表达式图片信息
DCMedicalExpressionManager.UpdateImageSrc2 = function (element) {
    if (element != null && element.nodeName == "IMG") {
        var dctype = element.getAttribute("dctype");
        if (dctype == "XTextMedicalExpressionFieldElement"
            || dctype == "XTextNewMedicalExpressionElement") {
            if (document.body.getAttribute("imagedataembedinhtml") == "true") {
                var url = DCMedicalExpressionManager.GetImageURL2(element, true);
                url = url.replace(/\+/g, '%2B');
                var settings = {
                    async: true,
                    method: "POST",
                    type: 'POST'
                };
                DCDomTools.fixAjaxSettings(settings);
                $.ajax(
                    url,
                    settings).always(
                        function (responseText, textStatus, jqXHR) {
                            if (typeof (responseText) == "object") {
                                responseText = responseText.responseText;
                            }
                            element.src = "data:image/png;base64," + responseText;
                        });
            }
            else {
                element.src = DCMedicalExpressionManager.GetImageURL(element);
            }
        }
    }
};
// 获得显示表达式的图片URL地址
DCMedicalExpressionManager.GetImageURL2 = function (element, forBase64) {
    var url = DCMedicalExpressionManager.GetServicePageURL();
    if (url == null || url.length == 0) {
        return null;
    }
    url = url + "?dcgetmedicalexpressionimage=" + element.getAttribute("dc_expressionstyle")
        + "&text=" + encodeURI(element.getAttribute("dc_innerserializetext"))
        + "&width=" + element.width
        + "&height=" + element.height
        + "&fontsize=" + element.getAttribute("dcfontsize")
        + "&dctype=" + element.getAttribute("dctype");
    if (forBase64 == true) {
        url = url + "&forbase64=1";
    }
    return url;
};

// 更新医学表达式图片信息
DCMedicalExpressionManager.UpdateImageSrc = function (element) {
    if (element !== null && element.nodeName === "IMG") {
        var dctype = element.getAttribute("dctype");
        if (dctype === "XTextMedicalExpressionFieldElement"
            || dctype === "XTextNewMedicalExpressionElement") {
            if (document.body.getAttribute("imagedataembedinhtml") === "true") {
                var url = DCMedicalExpressionManager.GetImageURL(element, true);
                url = url.replace(/\+/g, '%2B');
                var settings = {
                    async: true,
                    method: "POST",
                    type: 'POST'
                };
                DCDomTools.fixAjaxSettings(settings);
                $.ajax(
                    url,
                    settings).always(
                        function (responseText, textStatus, jqXHR) {
                            if (typeof (responseText) === "object") {
                                responseText = responseText.responseText;
                            }
                            element.src = "data:image/png;base64," + responseText;
                        });
            }
            else {
                element.src = DCMedicalExpressionManager.GetImageURL(element);
            }
        }
    }
};

// 获得显示表达式的图片URL地址
DCMedicalExpressionManager.GetImageURL = function (element, forBase64) {
    var url = DCMedicalExpressionManager.GetServicePageURL();
    if (url === null || url.length === 0) {
        return null;
    }
    url = url + "?dcgetmedicalexpressionimage=" + element.getAttribute("dc_expressionstyle")
        + "&text=" + encodeURI(element.getAttribute("dc_innerserializetext"))
        + "&width=" + element.offsetWidth
        + "&height=" + element.offsetHeight
        + "&fontsize=" + element.getAttribute("dcfontsize")
        + "&dctype=" + element.getAttribute("dctype");
    if (forBase64 === true) {
        url = url + "&forbase64=1";
    }
    return url;
};

// 显示编辑表达式内容的对话框
DCMedicalExpressionManager.ShowEditValueDialog = function (element) {
    if (document.body.getAttribute("readonly") === "true") {
        // 控件只读
        return;
    }
    if (document.body.getAttribute("ismobiledevice") === "true") {
        // 运行在移动平台上，该功能无效
        return false;
    }
    if (DCMedicalExpressionManager.IsMedicalExpressionElement(element) === false) {
        return;
    }
    //debugger;
    var style = element.getAttribute("dc_expressionstyle");
    var url = document.body.getAttribute("referencepathfordebug");
    if (url !== null && url.length > 0) {
        url = url + "/MedicalExpression_" + style + ".htm";
    }
    else {
        url = DCMedicalExpressionManager.GetServicePageURL();
        if (url !== null && url.length > 0) {
            url = url + "?dcwres=MedicalExpression_" + style + ".htm";
        }
    }
    var rootWriterControl = document.WriterControl;
    var frameElement = null;
    //若医学表达式为桓牙牙位图/乳牙牙位图，则调大编辑框
    if (element.getAttribute("dc_expressionstyle") === "PermanentTeethBitmap" || element.getAttribute("dc_expressionstyle") === "DeciduousTeech") {
        frameElement = rootWriterControl.ShowMaskDialog(450, 560);
    } else {
        frameElement = rootWriterControl.ShowMaskDialog(null, null);
    }

    //wyc20200613：在医学表达式弹出编辑对话框之前也引发一次EventBeforeFieldContentEdit事件
    //让用户手动编辑医学表达式的dc_innerserializetext，以便于初始化编辑对话框中文本框的初始值
    var ctl = document.WriterControl;
    if (ctl != null && ctl.EventBeforeFieldContentEdit != null
        && typeof (ctl.EventBeforeFieldContentEdit) == "function") {
        ctl.EventBeforeFieldContentEdit.call(ctl, element);
    }

    var keyvalueStr = element.getAttribute("dc_innerserializetext");
    //debugger;
    var svc = document.WriterControl.getAttribute("servicepageurl");
    if (document.WriterControl !== null) {
        frameElement.setAttribute("servicepageurl", svc );
    }
    DCDomTools.FillFrameContentNotAsync(frameElement, url);
    //debugger;
    frameElement.contentWindow.SetValues(ValueFormater.ConvertKeyValueStrToArray(keyvalueStr));

    frameElement.contentWindow.cancelCallback = function (datas) {
        if (ctl != null && ctl.EventAfterFieldContentEdit != null
            && typeof (ctl.EventAfterFieldContentEdit) == "function") {
            ctl.EventAfterFieldContentEdit.call(ctl, element, datas, "cancel");
        }
        rootWriterControl.CloseMaskDialog();
    };
    frameElement.contentWindow.okCallback = function (datas) {
        if (ctl != null && ctl.EventAfterFieldContentEdit != null
            && typeof (ctl.EventAfterFieldContentEdit) == "function") {
            ctl.EventAfterFieldContentEdit.call(ctl, element, datas, "ok");
        }
        DCMedicalExpressionManager.SetElementText(element, datas);
        rootWriterControl.CloseMaskDialog();
    };
    DCDomTools.FoucsFrameContent(frameElement);
};

// 设置表达式元素的文本内容
DCMedicalExpressionManager.SetElementText = function (element, datas) {
    if (DCMedicalExpressionManager.IsMedicalExpressionElement(element) === false) {
        return;
    }
    //伍贻超20180110：将医学表达式编辑界面传出来字符串数组转换为KEYVALUE键值对并保存
    var keyvalueStr = ValueFormater.ConvertArrayToKeyValueStr(datas);
    element.setAttribute("dc_innerserializetext", keyvalueStr);

    DCMedicalExpressionManager.UpdateImageSrc(element);

    //element.src = DCMedicalExpressionManager.GetImageURL(element);
};